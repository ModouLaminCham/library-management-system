import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import { useUser } from "../context/UserContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const navigate = useNavigate();
  const { isAuthenticated, loginWithTokens } = useUser();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!form.username || !form.password || (!isLogin && !form.email)) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      setLoading(true);
      if (isLogin) {
        const res = await api.post("auth/token/", {
          username: form.username,
          password: form.password,
        });
        await loginWithTokens({ access: res.data.access, refresh: res.data.refresh });
        navigate("/dashboard", { replace: true });
      } else {
        await api.post("auth/register/", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        setIsLogin(true);
        setForm((prev) => ({ ...prev, password: "" }));
        setSuccess("Registration successful! You can now login.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to complete request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: "#F8FAFC" }}>

      {/* LEFT PANEL */}
      <div
        className="d-none d-md-flex flex-column justify-content-between p-5"
        style={{ width: "42%", background: "#0F172A", color: "white" }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 40, height: 40, background: "#1E3A8A" }}
          >
            <i className="bi bi-bank fs-5 text-white"></i>
          </div>
          <span className="fw-semibold fs-5">Juloo Finance</span>
        </div>

        <div>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
            style={{ background: "#1E293B", color: "#93C5FD", fontSize: 12 }}
          >
            <i className="bi bi-shield-check"></i> Trusted digital banking
          </div>
          <h1 className="fw-semibold lh-sm mb-3" style={{ fontSize: 32 }}>
            Modern banking<br />
            <span style={{ color: "#3B82F6" }}>for The Gambia</span>
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7 }}>
            Send money, apply for loans, and manage your finances — all in one secure platform.
          </p>
        </div>

        <div className="d-flex gap-4">
          {[["10K+", "Customers"], ["GMD 2M+", "Transacted"], ["99.9%", "Uptime"]].map(([val, label]) => (
            <div key={label}>
              <div className="fw-semibold" style={{ fontSize: 18 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div
          className="bg-white rounded-4 p-4 p-md-5 w-100"
          style={{ maxWidth: 420, border: "0.5px solid #E2E8F0" }}
        >
          {/* mobile logo */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 36, height: 36, background: "#1E3A8A" }}
            >
              <i className="bi bi-bank text-white"></i>
            </div>
            <span className="fw-semibold">Juloo Finance</span>
          </div>

          <h2 className="fw-semibold mb-1" style={{ fontSize: 20 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-secondary mb-4" style={{ fontSize: 13 }}>
            {isLogin ? "Login to access your banking dashboard" : "Register to start your digital banking journey"}
          </p>

          {error && (
            <div className="alert alert-danger py-2 px-3" style={{ fontSize: 13 }}>
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}
          {success && (
            <div className="alert alert-success py-2 px-3" style={{ fontSize: 13 }}>
              <i className="bi bi-check-circle me-2"></i>{success}
            </div>
          )}

          {!isLogin && (
            <div className="mb-3">
              <label className="form-label text-secondary" style={{ fontSize: 12 }}>Email address</label>
              <input
                className="form-control"
                name="email"
                value={form.email}
                placeholder="you@example.com"
                onChange={handleChange}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: 12 }}>Username</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
              placeholder="Enter your username"
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary" style={{ fontSize: 12 }}>Password</label>
            <div className="input-group">
              <input
                className="form-control border-end-0"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="Enter your password"
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn w-100 text-white fw-semibold"
            style={{ background: "#1E3A8A", opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
            ) : isLogin ? "Login" : "Create account"}
          </button>

          <p className="text-center text-secondary mt-3 mb-0" style={{ fontSize: 13 }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              className="fw-semibold"
              style={{ color: "#1E3A8A", cursor: "pointer" }}
              onClick={() => { setIsLogin((v) => !v); setError(""); setSuccess(""); }}
            >
              {isLogin ? "Create one" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}