import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { useUser } from "../context/UserContext";

export default function CreateAccount() {
  const navigate = useNavigate();
  const { refreshData, hasAccount } = useUser();
  const [initialDeposit, setInitialDeposit] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (initialDeposit && Number(initialDeposit) < 0) {
      setError("Initial deposit cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      await api.post("accounts/create/", {
        initial_deposit: initialDeposit || 0,
      });
      await refreshData();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar hasAccount={hasAccount} />

      <div className="flex-grow-1">
        <Topbar />

        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h2 style={styles.title}>Open Your Account</h2>
            <p style={styles.subtitle}>Set an optional opening deposit and start banking.</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={submit}>
              <div style={styles.field}>
                <input
                  type="number"
                  name="initial_deposit"
                  placeholder="Initial Deposit (GMD)"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button disabled={loading} style={styles.button}>
                {loading ? "Processing..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    background: "linear-gradient(135deg, #0F172A, #1E3A8A)",
    minHeight: "calc(100vh - 65px)",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    color: "white",
  },
  title: { fontWeight: "700", marginBottom: "5px" },
  subtitle: { fontSize: "14px", color: "#CBD5E1", marginBottom: "20px" },
  field: { marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "white",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBox: {
    background: "#7F1D1D",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
};
