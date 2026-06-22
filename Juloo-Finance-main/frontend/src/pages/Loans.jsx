import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useUser } from "../context/UserContext";

export default function Loans() {
  const { hasAccount } = useUser();
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    loan_type: "",
    amount: "",
    duration_months: "12",
    collateral: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [repayAmounts, setRepayAmounts] = useState({});
  const [repayLoading, setRepayLoading] = useState({});
  const [repayMsg, setRepayMsg] = useState({});

  const fetchLoans = async () => {
    try {
      const res = await api.get("loans/my-loans/");
      setLoans(res.data);
    } catch {
      setError("Failed to load loans.");
    }
  };

  useEffect(() => {
    if (hasAccount) fetchLoans();
  }, [hasAccount]);

  const apply = async () => {
    setError("");
    setSuccess("");
    if (!form.loan_type || Number(form.amount) <= 0) {
      setError("Please enter a valid loan type and amount.");
      return;
    }
    setLoading(true);
    try {
      await api.post("loans/apply/", form);
      setForm({ loan_type: "", amount: "", duration_months: "12", collateral: "" });
      setSuccess("Loan application submitted successfully!");
      await fetchLoans();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to apply for loan.");
    } finally {
      setLoading(false);
    }
  };

  const repay = async (loanId) => {
    const amount = repayAmounts[loanId];
    if (!amount || Number(amount) <= 0) {
      setRepayMsg({ ...repayMsg, [loanId]: { text: "Enter a valid amount.", type: "danger" } });
      return;
    }
    setRepayLoading({ ...repayLoading, [loanId]: true });
    try {
      await api.post(`loans/${loanId}/repay/`, { amount });
      setRepayAmounts({ ...repayAmounts, [loanId]: "" });
      setRepayMsg({ ...repayMsg, [loanId]: { text: "Repayment successful!", type: "success" } });
      await fetchLoans();
    } catch (err) {
      setRepayMsg({
        ...repayMsg,
        [loanId]: { text: err.response?.data?.detail || "Repayment failed.", type: "danger" },
      });
    } finally {
      setRepayLoading({ ...repayLoading, [loanId]: false });
    }
  };

  const statusColor = (status) => {
    const map = {
      PENDING: { bg: "#FEF9C3", color: "#92400E" },
      APPROVED: { bg: "#DBEAFE", color: "#1E40AF" },
      ACTIVE: { bg: "#DCFCE7", color: "#166534" },
      REJECTED: { bg: "#FEE2E2", color: "#991B1B" },
      CLOSED: { bg: "#F1F5F9", color: "#475569" },
    };
    return map[status] || { bg: "#F1F5F9", color: "#475569" };
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: "#F8FAFC" }}>
      <Sidebar hasAccount={hasAccount} />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Topbar />

        <div className="p-4">

          {/* PAGE TITLE */}
          <div className="mb-4">
            <h5 className="fw-semibold mb-0">Loans</h5>
            <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
              Apply for a loan or manage your existing ones.
            </p>
          </div>

          {!hasAccount ? (
            <div className="bg-white rounded-3 p-5 text-center" style={{ border: "0.5px solid #E2E8F0" }}>
              <i className="bi bi-bank fs-2 text-secondary"></i>
              <p className="mt-3 text-secondary" style={{ fontSize: 14 }}>
                You need an account before applying for a loan.
              </p>
            </div>
          ) : (
            <div className="row g-4">

              {/* APPLY FORM */}
              <div className="col-12 col-md-4">
                <div className="bg-white rounded-3 p-4" style={{ border: "0.5px solid #E2E8F0" }}>
                  <h6 className="fw-semibold mb-3">Apply for a loan</h6>

                  {error && (
                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                      <i className="bi bi-exclamation-circle me-2"></i>{error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                      <i className="bi bi-check-circle me-2"></i>{success}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Loan type
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: 13 }}
                      value={form.loan_type}
                      onChange={(e) => setForm({ ...form, loan_type: e.target.value })}
                    >
                      <option value="">Select loan type</option>
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Agriculture">Agriculture</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Amount (GMD)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white" style={{ fontSize: 13 }}>GMD</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        style={{ fontSize: 13 }}
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Duration (months)
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: 13 }}
                      value={form.duration_months}
                      onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                    >
                      {[3, 6, 12, 18, 24, 36].map((m) => (
                        <option key={m} value={m}>{m} months</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Collateral (optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Land certificate"
                      style={{ fontSize: 13 }}
                      value={form.collateral}
                      onChange={(e) => setForm({ ...form, collateral: e.target.value })}
                    />
                  </div>

                  {/* SUMMARY */}
                  {form.amount > 0 && (
                    <div
                      className="rounded-3 p-3 mb-4"
                      style={{ background: "#EFF6FF", border: "0.5px solid #BFDBFE" }}
                    >
                      <p className="mb-1" style={{ fontSize: 12, color: "#1E40AF" }}>
                        <i className="bi bi-info-circle me-1"></i> Loan summary
                      </p>
                      <div className="d-flex justify-content-between" style={{ fontSize: 12, color: "#1E40AF" }}>
                        <span>Interest (10%)</span>
                        <span>GMD {(Number(form.amount) * 0.1).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-semibold" style={{ fontSize: 13, color: "#1E3A8A" }}>
                        <span>Total repayment</span>
                        <span>GMD {(Number(form.amount) * 1.1).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn w-100 text-white fw-semibold"
                    style={{ background: "#1E3A8A", fontSize: 13 }}
                    onClick={apply}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                    ) : "Submit application"}
                  </button>
                </div>
              </div>

              {/* LOANS LIST */}
              <div className="col-12 col-md-8">
                <h6 className="fw-semibold mb-3">Your loans</h6>

                {loans.length === 0 ? (
                  <div
                    className="bg-white rounded-3 p-5 text-center"
                    style={{ border: "0.5px solid #E2E8F0" }}
                  >
                    <i className="bi bi-cash-stack fs-2 text-secondary"></i>
                    <p className="mt-3 text-secondary mb-0" style={{ fontSize: 14 }}>
                      No loans yet. Apply for your first loan!
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {loans.map((loan) => {
                      const { bg, color } = statusColor(loan.status);
                      const progress = loan.total_repayment > 0
                        ? ((loan.total_repayment - loan.remaining_balance) / loan.total_repayment) * 100
                        : 0;

                      return (
                        <div
                          key={loan.id}
                          className="bg-white rounded-3 p-4"
                          style={{ border: "0.5px solid #E2E8F0" }}
                        >
                          {/* LOAN HEADER */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: 14 }}>
                                {loan.loan_type} loan
                              </div>
                              <div className="text-secondary" style={{ fontSize: 12 }}>
                                Applied {new Date(loan.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <span
                              className="px-3 py-1 rounded-pill fw-semibold"
                              style={{ fontSize: 11, background: bg, color }}
                            >
                              {loan.status}
                            </span>
                          </div>

                          {/* LOAN STATS */}
                          <div className="row g-2 mb-3">
                            {[
                              { label: "Amount", value: `GMD ${Number(loan.amount).toLocaleString()}` },
                              { label: "Interest (10%)", value: `GMD ${(Number(loan.amount) * 0.1).toLocaleString()}` },
                              { label: "Total repayment", value: `GMD ${Number(loan.total_repayment).toLocaleString()}` },
                              { label: "Remaining", value: `GMD ${Number(loan.remaining_balance).toLocaleString()}` },
                              { label: "Duration", value: `${loan.duration_months} months` },
                              { label: "Collateral", value: loan.collateral || "None" },
                            ].map(({ label, value }) => (
                              <div key={label} className="col-6 col-md-4">
                                <div
                                  className="rounded-3 p-2"
                                  style={{ background: "#F8FAFC", border: "0.5px solid #E2E8F0" }}
                                >
                                  <div className="text-secondary" style={{ fontSize: 11 }}>{label}</div>
                                  <div className="fw-semibold" style={{ fontSize: 13 }}>{value}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* PROGRESS BAR */}
                          {loan.status === "ACTIVE" && (
                            <>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-secondary" style={{ fontSize: 11 }}>Repayment progress</span>
                                <span className="text-secondary" style={{ fontSize: 11 }}>{Math.round(progress)}%</span>
                              </div>
                              <div
                                className="rounded-pill mb-3"
                                style={{ height: 6, background: "#E2E8F0" }}
                              >
                                <div
                                  className="rounded-pill"
                                  style={{ height: 6, width: `${progress}%`, background: "#1E3A8A", transition: "width 0.5s" }}
                                />
                              </div>

                              {/* REPAY SECTION */}
                              <div
                                className="rounded-3 p-3"
                                style={{ background: "#F8FAFC", border: "0.5px solid #E2E8F0" }}
                              >
                                <p className="fw-semibold mb-2" style={{ fontSize: 13 }}>Make a repayment</p>
                                {repayMsg[loan.id] && (
                                  <div
                                    className={`alert alert-${repayMsg[loan.id].type} py-2 px-3 mb-2`}
                                    style={{ fontSize: 12 }}
                                  >
                                    {repayMsg[loan.id].text}
                                  </div>
                                )}
                                <div className="input-group">
                                  <span className="input-group-text bg-white" style={{ fontSize: 13 }}>GMD</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Amount to repay"
                                    style={{ fontSize: 13 }}
                                    value={repayAmounts[loan.id] || ""}
                                    onChange={(e) =>
                                      setRepayAmounts({ ...repayAmounts, [loan.id]: e.target.value })
                                    }
                                  />
                                  <button
                                    className="btn text-white"
                                    style={{ background: "#1E3A8A", fontSize: 13 }}
                                    onClick={() => repay(loan.id)}
                                    disabled={repayLoading[loan.id]}
                                  >
                                    {repayLoading[loan.id] ? (
                                      <span className="spinner-border spinner-border-sm"></span>
                                    ) : "Repay"}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}