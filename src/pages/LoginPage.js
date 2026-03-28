import { useAuth } from "../auth/AuthContext";
import { ALLOWED_DOMAIN } from "../constants";

// ─── Icône Google ───────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Points de valeur ───────────────────────────────────────────────

const VALUE_POINTS = [
  "Génération de posts calibrés à votre marque",
  "Roadmap éditoriale jusqu'à 18 mois",
  "Analyse et optimisation post publication",
];

// ─── Page ───────────────────────────────────────────────────────────

export function LoginPage() {
  const { login, error } = useAuth();

  return (
    <div style={{
      height: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
    }}>

      {/* ── Panneau gauche ── */}
      <div style={{
        background: "#1E3A5F",
        padding: "2.5rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>
            Content Strategy AI
          </span>
        </div>

        {/* Accroche */}
        <div>
          <p style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#fff",
            lineHeight: 1.35,
            marginBottom: 12,
          }}>
            Votre stratégie LinkedIn,<br />pilotée par l'IA.
          </p>
          <p style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
            marginBottom: 28,
          }}>
            Axes de contenu, roadmap éditoriale, génération et optimisation
            de posts — en quelques clics.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {VALUE_POINTS.map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Réservé aux collaborateurs {ALLOWED_DOMAIN}
        </p>
      </div>

      {/* ── Panneau droit ── */}
      <div style={{
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem",
        gap: 0,
      }}>
        <p style={{ fontSize: 22, fontWeight: 500, color: "#0F172A", marginBottom: 6 }}>
          Connexion
        </p>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 32, textAlign: "center" }}>
          Accédez à votre espace de création
        </p>

        {/* Bouton SSO Google */}
        <button
          onClick={login}
          style={{
            width: "100%",
            maxWidth: 300,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            border: "0.5px solid #E2E8F0",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            color: "#0F172A",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
        >
          <GoogleIcon />
          Continuer avec Google
        </button>

        {/* Message d'erreur domaine */}
        {error && (
          <div style={{
            marginTop: 16,
            width: "100%",
            maxWidth: 300,
            padding: "10px 14px",
            background: "#FEF2F2",
            border: "0.5px solid #FCA5A5",
            borderRadius: 8,
            fontSize: 13,
            color: "#B91C1C",
            textAlign: "center",
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 24, fontSize: 12, color: "#CBD5E1", textAlign: "center" }}>
          Seuls les comptes {ALLOWED_DOMAIN} sont autorisés
        </p>
      </div>
    </div>
  );
}
window.LoginPage = LoginPage;
