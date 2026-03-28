import { useAuth } from "./AuthContext";
import { LoginPage } from "../pages/LoginPage";

/**
 * Garde de route — affiche LoginPage si l'utilisateur n'est pas connecté.
 * Affiche un écran de chargement pendant l'initialisation de Netlify Identity.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#94A3B8",
        fontSize: 14,
      }}>
        Chargement…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}
window.ProtectedRoute = ProtectedRoute;
