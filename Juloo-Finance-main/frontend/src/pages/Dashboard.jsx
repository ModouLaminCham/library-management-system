import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { useUser } from "../context/UserContext";

export default function Dashboard() {
  const { account, hasAccount } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loanAmount, setLoanAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanMsg, setLoanMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccount) { setLoading(false); return; }
    api.get("transactions/history/")
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [hasAccount]);

  const applyLoan = async () => {
    if (!loanAmount || Number(loanAmount) <= 0) {
      setLoanMsg({ text: "Enter a valid amount.", type: "danger" });
      return;
    }
    try {
      setLoanLoading(true);
      await api.post("loans/apply/", { loan_type: "General", amount: loanAmount });
      setLoanAmount("");
      setLoanMsg({ text: "Loan application submitted successfully!", type: "success" });
    } catch (err) {
      setLoanMsg({ text: err.response?.data?.detail || "Loan request failed.", type: "danger" });
    } finally {
      setLoanLoading(false);
    }
  };

  const totalDeposits = transactions
    .filter((t) => t.transaction_type === "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.transaction_type !== "DEPOSIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "#F8FAFC" }}>
        <div className="spinner-border" style={{ color: "#1E3A8A" }}></div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ background: "#F8FAFC" }}>
      <Sidebar hasAccount={hasAccount} />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Topbar />

        {!hasAccount ? (
          <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
            <div className="text-center bg-white rounded-4 p-5" style={{ border: "0.5px solid #E2E8F0", maxWidth: 400 }}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                style={{ width: 64, height: 64, background: "#EFF6FF" }}
              >
                <i className="bi bi-bank fs-3" style={{ color: "#1E3A8A" }}></i>
              </div>
              <h4 className="fw-semibold mb-2">No account yet</h4>
              <p className="text-secondary mb-4" style={{ fontSize: 14 }}>
                Create an account to start banking with Juloo Finance.
              </p>
              <button
                className="btn text-white px-4"
                style={{ background: "#1E3A8A" }}
                onClick={() => navigate("/create-account")}
              >
                Open an account
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">

            {/* PAGE TITLE */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-0">Dashboard</h5>
              <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
                Welcome back — here's your financial overview.
              </p>
            </div>

            {/* METRIC CARDS */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div
                  className="rounded-3 p-4 text-white h-100"
                  style={{ background: "#1E3A8A" }}
                >
                  <p className="mb-1" style={{ fontSize: 12, color: "#93C5FD" }}>
                    <i className="bi bi-wallet2 me-1"></i> Total balance
                  </p>
                  <h3 className="fw-semibold mb-1">
                    GMD {Number(account.balance).toLocaleString()}
                  </h3>
                  <p style={{ fontSize: 12, color: "#93C5FD" }} className="mb-0">
                    Account #{account.account_number}
                  </p>
                </div>
              </div>

              <div className="col-6 col-md-4">
                <div className="bg-white rounded-3 p-4 h-100" style={{ border: "0.5px solid #E2E8F0" }}>
                  <p className="text-secondary mb-1" style={{ fontSize: 12 }}>
                    <i className="bi bi-arrow-down-circle me-1 text-success"></i> Total received
                  </p>
                  <h5 className="fw-semibold mb-0">GMD {totalDeposits.toLocaleString()}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: 12 }}>
                    {transactions.filter((t) => t.transaction_type === "DEPOSIT").length} deposits
                  </p>
                </div>
              </div>

              <div className="col-6 col-md-4">
                <div className="bg-white rounded-3 p-4 h-100" style={{ border: "0.5px solid #E2E8F0" }}>
                  <p className="text-secondary mb-1" style={{ fontSize: 12 }}>
                    <i className="bi bi-arrow-up-circle me-1 text-danger"></i> Total sent
                  </p>
                  <h5 className="fw-semibold mb-0">GMD {totalWithdrawals.toLocaleString()}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: 12 }}>
                    {transactions.filter((t) => t.transaction_type !== "DEPOSIT").length} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="row g-3">

              {/* RECENT TRANSACTIONS */}
              <div className="col-12 col-md-7">
                <div className="bg-white rounded-3 p-4 h-100" style={{ border: "0.5px solid #E2E8F0" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-semibold mb-0">Recent transactions</h6>
                    <span
                      className="text-decoration-none"
                      style={{ fontSize: 12, color: "#1E3A8A", cursor: "pointer" }}
                      onClick={() => navigate("/transactions")}
                    >
                      View all →
                    </span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-inbox fs-2 text-secondary"></i>
                      <p className="text-secondary mt-2 mb-0" style={{ fontSize: 13 }}>No transactions yet</p>
                    </div>
                  ) : (
                    transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="d-flex justify-content-between align-items-center py-2"
                        style={{ borderBottom: "0.5px solid #F1F5F9" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: 36, height: 36,
                              background: tx.transaction_type === "DEPOSIT" ? "#DCFCE7" : "#FEE2E2",
                            }}
                          >
                            <i
                              className={`bi ${tx.transaction_type === "DEPOSIT" ? "bi-arrow-down text-success" : "bi-arrow-up text-danger"}`}
                              style={{ fontSize: 14 }}
                            ></i>
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: 13 }}>
                              {tx.transaction_type}
                            </div>
                            <div className="text-secondary" style={{ fontSize: 11 }}>
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span
                          className="fw-semibold"
                          style={{
                            fontSize: 13,
                            color: tx.transaction_type === "DEPOSIT" ? "#16A34A" : "#DC2626",
                          }}
                        >
                          {tx.transaction_type === "DEPOSIT" ? "+" : "-"} GMD {Number(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* QUICK ACTIONS + LOAN */}
              <div className="col-12 col-md-5 d-flex flex-column gap-3">

                {/* QUICK ACTIONS */}
                <div className="bg-white rounded-3 p-4" style={{ border: "0.5px solid #E2E8F0" }}>
                  <h6 className="fw-semibold mb-3">Quick actions</h6>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { icon: "bi-arrow-up-circle", label: "Send money", path: "/transactions" },
                      { icon: "bi-arrow-down-circle", label: "Deposit funds", path: "/transactions" },
                      { icon: "bi-cash-stack", label: "Apply for loan", path: "/loans" },
                      { icon: "bi-file-earmark-text", label: "View statement", path: "/transactions" },
                    ].map(({ icon, label, path }) => (
                      <button
                        key={label}
                        className="btn btn-light d-flex align-items-center gap-2 text-start"
                        style={{ fontSize: 13, border: "0.5px solid #E2E8F0" }}
                        onClick={() => navigate(path)}
                      >
                        <i className={`bi ${icon}`} style={{ color: "#1E3A8A", fontSize: 16 }}></i>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUICK LOAN */}
                <div className="bg-white rounded-3 p-4" style={{ border: "0.5px solid #E2E8F0" }}>
                  <h6 className="fw-semibold mb-3">Quick loan apply</h6>
                  {loanMsg.text && (
                    <div className={`alert alert-${loanMsg.type} py-2 px-3 mb-3`} style={{ fontSize: 12 }}>
                      {loanMsg.text}
                    </div>
                  )}
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{ fontSize: 13 }}>GMD</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      style={{ fontSize: 13 }}
                    />
                    <button
                      className="btn text-white"
                      style={{ background: "#1E3A8A", fontSize: 13 }}
                      onClick={applyLoan}
                      disabled={loanLoading}
                    >
                      {loanLoading ? <span className="spinner-border spinner-border-sm"></span> : "Apply"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}