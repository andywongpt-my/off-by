import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://andywongpt-my.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = allowedOrigins.has(origin) ? origin : "https://andywongpt-my.github.io";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(req),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function validDate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1, d));
  return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
}

function validUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function cleanTag(v: unknown) {
  const s = String(v || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 16);
  return /^[A-Z0-9_-]{3,16}$/.test(s) ? s : null;
}

function getSecretKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (typeof parsed?.default === "string" && parsed.default) return parsed.default;
    } catch {
      // fall through to local/legacy variables
    }
  }
  return Deno.env.get("SUPABASE_SECRET_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

async function fingerprint(req: Request, salt: string) {
  const ip = (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown"
  ).split(",")[0].trim();
  const bytes = new TextEncoder().encode(`${salt}|${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

  const origin = req.headers.get("origin") || "";
  if (origin && !allowedOrigins.has(origin)) return json(req, { error: "origin not allowed" }, 403);

  const url = Deno.env.get("SUPABASE_URL");
  const key = getSecretKey();
  const salt = Deno.env.get("OFFBY_HASH_SALT");
  if (!url || !key || !salt || salt.length < 24) return json(req, { error: "server not configured" }, 500);

  const db = createClient(url, key, { auth: { persistSession: false } });

  if (req.method === "GET") {
    const u = new URL(req.url);
    const mode = u.searchParams.get("mode");
    const date = u.searchParams.get("date");
    if (!["sprint", "daily"].includes(mode || "") || !validDate(date)) return json(req, { error: "invalid query" }, 400);

    const { data, error } = await db.rpc("off_by_leaderboard", {
      p_mode: mode,
      p_date: date,
      p_limit: 10,
    });
    return error ? json(req, { error: "board unavailable" }, 500) : json(req, data);
  }

  if (req.method !== "POST") return json(req, { error: "method not allowed" }, 405);

  let b: any;
  try {
    b = await req.json();
  } catch {
    return json(req, { error: "invalid json" }, 400);
  }

  const mode = b.mode;
  const submittedScore = Number(b.score);
  const actualMs = b.actualMs == null ? null : Number(b.actualMs);
  const date = b.challengeDate;
  const tag = cleanTag(b.playerTag);

  if (!["sprint", "daily"].includes(mode) || !validDate(date) || !validUuid(b.clientId) || !tag) {
    return json(req, { error: "invalid payload" }, 400);
  }

  let score: number;
  if (mode === "sprint") {
    if (actualMs == null || !Number.isInteger(actualMs) || actualMs < 0 || actualMs > 10000) {
      return json(req, { error: "invalid sprint timing" }, 400);
    }
    score = Math.abs(actualMs - 1000);
    if (score > 5000) return json(req, { error: "invalid sprint score" }, 400);
  } else {
    if (!Number.isInteger(submittedScore) || submittedScore < 0 || submittedScore > 100 || actualMs !== null) {
      return json(req, { error: "invalid daily score" }, 400);
    }
    score = submittedScore;
  }

  const fp = await fingerprint(req, salt);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: rateError } = await db
    .from("off_by_attempts")
    .select("id", { count: "exact", head: true })
    .eq("request_fingerprint", fp)
    .gte("created_at", since);

  if (rateError) return json(req, { error: "rate check unavailable" }, 500);
  if ((count || 0) >= 60) return json(req, { error: "rate limit" }, 429);

  const { error: insertError } = await db.from("off_by_attempts").insert({
    challenge_date: date,
    mode,
    score,
    actual_ms: mode === "sprint" ? actualMs : null,
    client_id: b.clientId,
    player_tag: tag,
    request_fingerprint: fp,
  });
  if (insertError) return json(req, { error: "score not saved" }, 500);

  const { data, error } = await db.rpc("off_by_leaderboard", {
    p_mode: mode,
    p_date: date,
    p_limit: 10,
  });
  return error ? json(req, { error: "score saved; board unavailable" }, 500) : json(req, data);
});
