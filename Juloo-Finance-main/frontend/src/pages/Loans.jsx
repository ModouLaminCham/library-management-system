import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useUser } from "../context/UserContext";

const LOAN_TYPES = ["Personal", "Business", "Education", "Agriculture"];
const DURATIONS = [3, 6, 12, 18, 24, 36];
const INTEREST_RATE = 0.1;

function useAutoDismiss(setter, delay = 5000) {
  return useCallback(
    (val) => {
      setter(val);
      if (val) setTimeout(() => setter(""), delay);
    },
    [setter, delay]
  );
}

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

  const setErrorAuto = useAutoDismiss(setError);
  const setSuccessAuto = useAutoDismiss(setSuccess);

  const fetchLoans = async () => {
    try {
      const res = await api.get("loans/my-loans/");
      setLoans(res.data);
    } catch {
      setErrorAuto("Failed to load loans.");
    }
  };

  useEffect(() => {
    if (hasAccount) fetchLoans();
  }, [hasAccount]);

  // Derived loan summary values
  const parsedAmount = Number(form.amount);
  const parsedDuration = Number(form.duration_months);
  const interest = parsedAmount * INTEREST_RATE;
  const totalRepayment = parsedAmount + interest;
  const monthlyInstalment =
    parsedDuration > 0 ? totalRepayment / parsedDuration : 0;

  const isFormValid = form.loan_type && parsedAmount > 0;

  const apply = async () => {
    setError("");
    setSuccess("");
    if (!isFormValid) {
      setErrorAuto("Please select a loan type and enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      await api.post("loans/apply/", form);
      setForm({ loan_type: "", amount: "", duration_months: "12", collateral: "" });
      setSuccessAuto("Loan application submitted successfully!");
      await fetchLoans();
    } catch (err) {
      setErrorAuto(err.response?.data?.detail || "Failed to apply for loan.");
    } finally {
      setLoading(false);
    }
  };

  const repay = async (loanId, fullBalance) => {
    const amount = repayAmounts[loanId];
    if (!amount || Number(amount) <= 0) {
      setRepayMsg((prev) => ({
        ...prev,
        [loanId]: { text: "Enter a valid amount.", type: "danger" },
      }));
      return;
    }
    setRepayLoading((prev) => ({ ...prev, [loanId]: true }));
    try {
      await api.post(`loans/${loanId}/repay/`, { amount });
      setRepayAmounts((prev) => ({ ...prev, [loanId]: "" }));
      setRepayMsg((prev) => ({
        ...prev,
        [loanId]: { text: "Repayment successful!", type: "success" },
      }));
      await fetchLoans();
    } catch (err) {
      setRepayMsg((prev) => ({
        ...prev,
        [loanId]: {
          text: err.response?.data?.detail || "Repayment failed.",
          type: "danger",
        },
      }));
    } finally {
      setRepayLoading((prev) => ({ ...prev, [loanId]: false }));
    }
    // Auto-dismiss repay message
    setTimeout(
      () =>
        setRepayMsg((prev) => {
          const next = { ...prev };
          delete next[loanId];
          return next;
        }),
      5000
    );
  };

  const statusMeta = (status) => {
    const map = {
      PENDING:  { bg: "#FEF9C3", color: "#92400E",  icon: "bi-clock",            label: "Pending review" },
      APPROVED: { bg: "#DBEAFE", color: "#1E40AF",  icon: "bi-check-circle",     label: "Approved" },
      ACTIVE:   { bg: "#DCFCE7", color: "#166534",  icon: "bi-lightning-charge", label: "Active" },
      REJECTED: { bg: "#FEE2E2", color: "#991B1B",  icon: "bi-x-circle",         label: "Rejected" },
      CLOSED:   { bg: "#F1F5F9", color: "#475569",  icon: "bi-archive",          label: "Closed" },
    };
    return map[status] || map.CLOSED;
  };

  const durationLabel = (months) => {
    if (months < 12) return `${months} months`;
    const years = months / 12;
    return Number.isInteger(years)
      ? `${years} yr${years > 1 ? "s" : ""} (${months} mo)`
      : `${months} months`;
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
              <p className="mt-3 text-secondary mb-0" style={{ fontSize: 14 }}>
                You need an account before applying for a loan.
              </p>
            </div>
          ) : (
            <div className="row g-4">

              {/* ── APPLY FORM ── */}
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

                  {/* Loan type */}
                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Loan type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: 13 }}
                      value={form.loan_type}
                      onChange={(e) => setForm({ ...form, loan_type: e.target.value })}
                    >
                      <option value="">Select loan type</option>
                      {LOAN_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Amount (GMD) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white" style={{ fontSize: 13 }}>GMD</span>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="0.00"
                        style={{ fontSize: 13 }}
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                    {form.amount && parsedAmount <= 0 && (
                      <div className="text-danger mt-1" style={{ fontSize: 11 }}>
                        Amount must be greater than 0.
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Repayment duration
                    </label>
                    <select
                      className="form-select"
                      style={{ fontSize: 13 }}
                      value={form.duration_months}
                      onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                    >
                      {DURATIONS.map((m) => (
                        <option key={m} value={m}>{durationLabel(m)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Collateral */}
                  <div className="mb-4">
                    <label className="form-label text-secondary" style={{ fontSize: 12 }}>
                      Collateral <span className="text-secondary fw-normal">(optional)</span>
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
                  {parsedAmount > 0 && (
                    <div
                      className="rounded-3 p-3 mb-4"
                      style={{ background: "#EFF6FF", border: "0.5px solid #BFDBFE" }}
                    >
                      <p className="mb-2" style={{ fontSize: 12, color: "#1E40AF", fontWeight: 600 }}>
                        <i className="bi bi-calculator me-1"></i> Loan summary
                      </p>
                      {[
                        { label: "Principal", value: `GMD ${parsedAmount.toLocaleString()}` },
                        { label: `Interest (${INTEREST_RATE * 100}%)`, value: `GMD ${interest.toLocaleString()}` },
                        { label: "Total repayment", value: `GMD ${totalRepayment.toLocaleString()}`, bold: true },
                        {
                          label: `Monthly instalment (÷ ${parsedDuration})`,
                          value: `GMD ${monthlyInstalment.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                          bold: true,
                        },
                      ].map(({ label, value, bold }) => (
                        <div
                          key={label}
                          className={`d-flex justify-content-between ${bold ? "fw-semibold" : ""}`}
                          style={{ fontSize: bold ? 13 : 12, color: bold ? "#1E3A8A" : "#1E40AF", marginBottom: 2 }}
                        >
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="btn w-100 text-white fw-semibold"
                    style={{
                      background: isFormValid ? "#1E3A8A" : "#94A3B8",
                      fontSize: 13,
                      cursor: isFormValid ? "pointer" : "not-allowed",
                    }}
                    onClick={apply}
                    disabled={loading || !isFormValid}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Submitting…</>
                    ) : "Submit application"}
                  </button>
                </div>
              </div>

              {/* ── LOANS LIST ── */}
              <div className="col-12 col-md-8">
                <h6 className="fw-semibold mb-3">
                  Your loans
                  {loans.length > 0 && (
                    <span
                      className="ms-2 badge rounded-pill"
                      style={{ background: "#E2E8F0", color: "#475569", fontSize: 11, fontWeight: 500 }}
                    >
                      {loans.length}
                    </span>
                  )}
                </h6>

                {loans.length === 0 ? (
                  <div className="bg-white rounded-3 p-5 text-center" style={{ border: "0.5px solid #E2E8F0" }}>
                    <i className="bi bi-cash-stack fs-2 text-secondary"></i>
                    <p className="mt-3 text-secondary mb-1" style={{ fontSize: 14 }}>
                      No loans yet.
                    </p>
                    <p className="text-secondary mb-0" style={{ fontSize: 13 }}>
                      Use the form to submit your first loan application.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {loans.map((loan) => {
                      const { bg, color, icon, label: statusLabel } = statusMeta(loan.status);
                      const isActive = loan.status === "ACTIVE";
                      const isClosed = loan.status === "CLOSED";

                      const progress =
                        loan.total_repayment > 0
                          ? ((loan.total_repayment - loan.remaining_balance) / loan.total_repayment) * 100
                          : isClosed ? 100 : 0;

                      const remaining = Number(loan.remaining_balance);

                      return (
                        <div
                          key={loan.id}
                          className="bg-white rounded-3 p-4"
                          style={{ border: "0.5px solid #E2E8F0" }}
                        >
                          {/* HEADER */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: 14 }}>
                                {loan.loan_type} Loan
                              </div>
                              <div className="text-secondary" style={{ fontSize: 12 }}>
                                Applied {new Date(loan.created_at).toLocaleDateString(undefined, {
                                  year: "numeric", month: "short", day: "numeric",
                                })}
                              </div>
                            </div>
                            <span
                              className="px-3 py-1 rounded-pill fw-semibold d-flex align-items-center gap-1"
                              style={{ fontSize: 11, background: bg, color, whiteSpace: "nowrap" }}
                            >
                              <i className={`bi ${icon}`} style={{ fontSize: 10 }}></i>
                              {statusLabel}
                            </span>
                          </div>

                          {/* STATS GRID */}
                          <div className="row g-2 mb-3">
                            {[
                              { label: "Amount",          value: `GMD ${Number(loan.amount).toLocaleString()}` },
                              { label: `Interest (${INTEREST_RATE * 100}%)`, value: `GMD ${(Number(loan.amount) * INTEREST_RATE).toLocaleString()}` },
                              { label: "Total repayment", value: `GMD ${Number(loan.total_repayment).toLocaleString()}` },
                              { label: "Remaining",       value: `GMD ${remaining.toLocaleString()}`, highlight: isActive && remaining > 0 },
                              { label: "Duration",        value: durationLabel(loan.duration_months) },
                              { label: "Collateral",      value: loan.collateral || "None" },
                            ].map(({ label, value, highlight }) => (
                              <div key={label} className="col-6 col-md-4">
                                <div
                                  className="rounded-3 p-2"
                                  style={{
                                    background: highlight ? "#EFF6FF" : "#F8FAFC",
                                    border: `0.5px solid ${highlight ? "#BFDBFE" : "#E2E8F0"}`,
                                  }}
                                >
                                  <div className="text-secondary" style={{ fontSize: 11 }}>{label}</div>
                                  <div
                                    className="fw-semibold"
                                    style={{ fontSize: 13, color: highlight ? "#1E3A8A" : "inherit" }}
                                  >
                                    {value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* PROGRESS BAR — shown for ACTIVE and CLOSED */}
                          {(isActive || isClosed) && (
                            <>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-secondary" style={{ fontSize: 11 }}>Repayment progress</span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: isClosed ? "#166534" : "#475569",
                                    fontWeight: isClosed ? 600 : 400,
                                  }}
                                >
                                  {isClosed ? "Fully repaid ✓" : `${Math.round(progress)}%`}
                                </span>
                              </div>
                              <div className="rounded-pill mb-3" style={{ height: 6, background: "#E2E8F0" }}>
                                <div
                                  className="rounded-pill"
                                  style={{
                                    height: 6,
                                    width: `${Math.min(progress, 100)}%`,
                                    background: isClosed ? "#166534" : "#1E3A8A",
                                    transition: "width 0.5s",
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {/* REPAY SECTION — ACTIVE only */}
                          {isActive && (
                            <div
                              className="rounded-3 p-3"
                              style={{ background: "#F8FAFC", border: "0.5px solid #E2E8F0" }}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <p className="fw-semibold mb-0" style={{ fontSize: 13 }}>Make a repayment</p>
                                {remaining > 0 && (
                                  <button
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: 11,
                                      color: "#1E3A8A",
                                      background: "#EFF6FF",
                                      border: "0.5px solid #BFDBFE",
                                      padding: "2px 10px",
                                    }}
                                    onClick={() =>
                                      setRepayAmounts((prev) => ({ ...prev, [loan.id]: remaining }))
                                    }
                                  >
                                    Pay full balance
                                  </button>
                                )}
                              </div>

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
                                  min="1"
                                  max={remaining}
                                  className="form-control"
                                  placeholder={`Up to GMD ${remaining.toLocaleString()}`}
                                  style={{ fontSize: 13 }}
                                  value={repayAmounts[loan.id] || ""}
                                  onChange={(e) =>
                                    setRepayAmounts((prev) => ({ ...prev, [loan.id]: e.target.value }))
                                  }
                                />
                                <button
                                  className="btn text-white"
                                  style={{ background: "#1E3A8A", fontSize: 13 }}
                                  onClick={() => repay(loan.id, remaining)}
                                  disabled={repayLoading[loan.id]}
                                >
                                  {repayLoading[loan.id] ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : "Repay"}
                                </button>
                              </div>
                            </div>
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
