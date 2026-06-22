import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { useUser } from "../context/UserContext";

export default function Accounts() {
  const { account, hasAccount } = useUser();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!hasAccount) return;
    api
      .get("transactions/history/")
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]));
  }, [hasAccount]);

  const totalIn = transactions
    .filter((tx) => tx.transaction_type === "DEPOSIT")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalOut = transactions
    .filter((tx) => tx.transaction_type === "WITHDRAW")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div style={styles.page}>
      <Sidebar hasAccount={hasAccount} />

      <div style={styles.main}>
        <Topbar />

        <div style={styles.container}>
          <h2 style={styles.title}>Accounts</h2>

          {!hasAccount ? (
            <div style={styles.card}>No account found. Create one to get started.</div>
          ) : (
            <>
              <div style={styles.card}>
                <h4 style={styles.cardTitle}>Primary Account</h4>
                <p style={styles.meta}>Account Number: {account.account_number}</p>
                <h1 style={styles.balance}>GMD {Number(account.balance).toLocaleString()}</h1>
                <p style={styles.meta}>Created: {new Date(account.created_at).toLocaleString()}</p>
              </div>

              <div style={styles.grid}>
                <div style={styles.smallCard}>
                  <p>Total Deposits</p>
                  <h3 style={{ color: "#166534" }}>GMD {totalIn.toLocaleString()}</h3>
                </div>
                <div style={styles.smallCard}>
                  <p>Total Withdrawals</p>
                  <h3 style={{ color: "#991B1B" }}>GMD {totalOut.toLocaleString()}</h3>
                </div>
                <div style={styles.smallCard}>
                  <p>Transactions</p>
                  <h3>{transactions.length}</h3>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0F172A, #1E3A8A)",
    color: "white",
  },
  main: { flex: 1 },
  container: { padding: 24 },
  title: { marginBottom: 16 },
  card: {
    background: "white",
    color: "#0F172A",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
  },
  cardTitle: { marginBottom: 8 },
  balance: { margin: "8px 0" },
  meta: { color: "#64748B", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  smallCard: {
    background: "white",
    color: "#0F172A",
    borderRadius: 12,
    padding: 16,
  },
};
