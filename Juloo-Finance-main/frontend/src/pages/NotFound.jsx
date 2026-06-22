import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.text}>The page you requested does not exist or has moved.</p>
        <div style={styles.actions}>
          <Link style={styles.primary} to="/dashboard">
            Go to Dashboard
          </Link>
          <Link style={styles.secondary} to="/">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  },
  card: {
    background: "white",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  code: {
    margin: 0,
    fontSize: 56,
    color: "#1e3a8a",
  },
  title: {
    margin: "8px 0",
  },
  text: {
    margin: "8px 0 20px 0",
    color: "#64748b",
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primary: {
    background: "#1e3a8a",
    color: "white",
    textDecoration: "none",
    borderRadius: 10,
    padding: "10px 16px",
  },
  secondary: {
    background: "#e2e8f0",
    color: "#0f172a",
    textDecoration: "none",
    borderRadius: 10,
    padding: "10px 16px",
  },
};
