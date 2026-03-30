// netlify/functions/save.js
const { getStore } = require("@netlify/blobs");

function getUserEmail(event) {
  try {
    const auth = event.headers["authorization"] || event.headers["Authorization"] || "";
    const token = auth.replace("Bearer ", "").trim();
    if (!token) return null;
    // Décode le JWT sans vérification de signature (Netlify Identity gère ça)
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return payload.email || null;
  } catch (e) {
    console.error("getUserEmail error:", e);
    return null;
  }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const email = getUserEmail(event);
  console.log("save.js — email:", email, "method:", event.httpMethod);

  if (!email) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Non authentifié" }) };
  }

  // Clé unique par utilisateur
  const key = "user_" + email.replace(/[^a-zA-Z0-9@._-]/g, "_");

  try {
    const store = getStore({
      name: "csa_data",
      consistency: "strong",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_TOKEN,
    });

    if (event.httpMethod === "GET") {
      let data = null;
      try {
        data = await store.get(key, { type: "json" });
      } catch (e) {
        console.log("No data yet for", key);
      }
      console.log("GET — data found:", !!data);
      return { statusCode: 200, headers, body: JSON.stringify(data || {}) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await store.setJSON(key, body);
      console.log("POST — saved ok for", key);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  } catch (err) {
    console.error("save.js error:", err.message, err.stack);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
