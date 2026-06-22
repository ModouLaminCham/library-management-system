import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { useUser } from "../context/UserContext";

export default function Transactions() {
  const { hasAccount, refreshData } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await api.get("transactions/history/");
      setTransactions(res.data);
      setError("");
    } catch (err) {
      setTransactions([]);
      if (err.response?.status !== 404) {
        setError("Failed to load transactions");
      }
    }
  };

  useEffect(() => {
    if (hasAccount) {
      fetchTransactions();
    }
  }, [hasAccount]);

  const submit = async (type) => {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post(`transactions/${type}/`, { amount });
      setAmount("");
      await fetchTransactions();
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.detail || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar hasAccount={hasAccount} />
      <div className="flex-grow-1">
        <Topbar />

        <div className="container mt-4">
          <h4>Transactions</h4>

          {!hasAccount ? (
            <div className="alert alert-info mt-3">Create an account first to transact.</div>
          ) : (
            <>
              <div className="card mt-3 p-3">
                <h6>Deposit / Withdraw</h6>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button
                    className="btn btn-success"
                    disabled={loading}
                    onClick={() => submit("deposit")}
                  >
                    Deposit
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={loading}
                    onClick={() => submit("withdraw")}
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <div className="card mt-3 p-3">
                <h6>Transaction History</h6>
                {transactions.length === 0 ? (
                  <p className="mb-0">No transactions yet.</p>
                ) : (
                  <table className="table table-striped mt-2 mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className={t.transaction_type === "DEPOSIT" ? "text-success" : "text-danger"}>
                            {t.transaction_type}
                          </td>
                          <td>GMD {Number(t.amount).toLocaleString()}</td>
                          <td>{new Date(t.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
