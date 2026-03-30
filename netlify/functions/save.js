// netlify/functions/save.js
// Sauvegarde et lecture des données utilisateur via Netlify Blobs
const { getStore } = require("@netlify/blobs");
const jwt = require("jsonwebtoken");

function getUserEmail(event) {
  const auth = event.headers["authorization"] || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    // Netlify Identity tokens sont des JWT signés avec le secret du site
    const decoded = jwt.decode(token);
    return decoded?.email || null;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const email = getUserEmail(event);
  if (!email) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Non authentifié" }) };
  }

  // Clé unique par utilisateur (on sanitise l'email)
  const key = "user_" + email.replace(/[^a-zA-Z0-9]/g, "_");
  const store = getStore("csa_data");

  try {
    if (event.httpMethod === "GET") {
      const data = await store.get(key, { type: "json" }).catch(() => null);
      return { statusCode: 200, headers, body: JSON.stringify(data || {}) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await store.setJSON(key, body);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  } catch (err) {
    console.error("save.js error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
