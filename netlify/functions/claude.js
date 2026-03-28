const ALLOWED_DOMAINS  = ["@margoconseil.com", "@codebusters.fr", "@margo-group.com", "@margo.com"];
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS_LIMIT  = 2500;

// ─── Helpers ───────────────────────────────────────────────────────

function createError(status, message) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: { message } }),
  };
}

function createSuccess(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function getEmailFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return decoded.email || null;
  } catch {
    return null;
  }
}

function isAllowedDomain(email) {
  return typeof email === "string" && ALLOWED_DOMAINS.some(d => email.endsWith(d));
}

function validateBody(body) {
  const { messages, max_tokens } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "Le champ messages est requis.";
  }
  if (max_tokens && (typeof max_tokens !== "number" || max_tokens > MAX_TOKENS_LIMIT)) {
    return `max_tokens doit être inférieur ou égal à ${MAX_TOKENS_LIMIT}.`;
  }
  return null;
}

// ─── Handler ───────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return createError(405, "Méthode non autorisée.");
  }

  // Vérification du token
  const authHeader = event.headers["authorization"] || "";
  const token      = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const email      = getEmailFromToken(token);

  console.log("[claude.js] Email extrait du token :", email);

  if (!email || !isAllowedDomain(email)) {
    console.log("[claude.js] Domaine refusé pour :", email);
    return createError(403, `Accès refusé. Domaine non autorisé : ${email}`);
  }

  // Parsing du body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return createError(400, "Corps de la requête invalide.");
  }

  const validationError = validateBody(body);
  if (validationError) return createError(400, validationError);

  const { system, messages, max_tokens = 1200 } = body;

  // Appel Anthropic
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens, system: system || "", messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return createError(response.status, err?.error?.message || `Erreur Anthropic ${response.status}`);
    }

    const data = await response.json();
    return createSuccess(data);

  } catch (err) {
    console.error("[claude.js] Erreur réseau :", err.message);
    return createError(500, "Erreur interne du serveur.");
  }
};
