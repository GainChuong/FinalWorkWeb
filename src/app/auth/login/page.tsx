"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Demo accounts
const DEMO_ACCOUNTS = [
  { label: "Buyer",  email: "buyer@refashion.vn",  password: "buyer123"  },
  { label: "Seller", email: "seller@refashion.vn", password: "seller123" },
  { label: "Admin",  email: "admin@refashion.vn",  password: "admin123"  },
];

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [demoIndex, setDemoIndex] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle, user } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes("@")) newErrors.email = "Email phải chứa ký tự @.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email không hợp lệ (vd: example@gmail.com).";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const success = login(email, password);
    if (success) {
      // Read redirect from localStorage immediately after login() sets state
      // Use window.location.href for full-page navigation (needed for vanilla HTML portals)
      try {
        const stored = localStorage.getItem("refashion_current_user");
        const parsed = stored ? JSON.parse(stored) : null;
        const dest = parsed?.redirect || redirectTo;
        window.location.href = dest;
      } catch {
        window.location.href = redirectTo;
      }
    } else {
      setErrors({ password: "Email hoặc mật khẩu không đúng. Vui lòng thử lại." });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrors({});
    const success = await loginWithGoogle();
    setGoogleLoading(false);
    if (success) {
      router.push(redirectTo);
    } else {
      setErrors({ password: "Đăng nhập Google thất bại. Vui lòng thử lại." });
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Tính năng đăng nhập bằng ${provider} đang được phát triển.`);
  };

  const fillDemoAccount = () => {
    const acc = DEMO_ACCOUNTS[demoIndex % DEMO_ACCOUNTS.length];
    setEmail(acc.email);
    setPassword(acc.password);
    setErrors({});
    setDemoIndex(prev => prev + 1);
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "calc(100vh - 70px)", padding: "2rem", backgroundColor: "var(--background)"
    }}>
      <div style={{
        width: "1000px",
        maxWidth: "100%",
        height: "650px",
        backgroundColor: "var(--card)",
        borderRadius: "24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 50px var(--shadow-lg)"
      }}>

        {/* LEFT COLUMN: FORM */}
        <div style={{ padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Link href="/" className="logo-brand" style={{ marginBottom: "2rem" }}>
            ReFashion<span>Eco</span>
          </Link>

          <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-serif)", color: "var(--primary)", marginBottom: "0.5rem" }}>
            Chào mừng trở lại!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Tiếp tục hành trình mua sắm thời trang xanh cùng chúng tôi.
          </p>

          {/* Demo account button */}
          <button
            type="button"
            onClick={fillDemoAccount}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "var(--primary-light)", border: "1px dashed var(--primary)",
              borderRadius: "10px", padding: "0.6rem 1rem", cursor: "pointer",
              fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600,
              marginBottom: "1.25rem", width: "100%", justifyContent: "center"
            }}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Dùng tài khoản Demo để thử
          </button>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "1rem" }}>
              <input
                id="login-email"
                type="email"
                placeholder="Địa chỉ Email (phải có @)"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                style={{
                  width: "100%", padding: "0.85rem 1.25rem", borderRadius: "12px",
                  border: `1px solid ${errors.email ? "#ef4444" : "var(--border)"}`,
                  backgroundColor: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem"
                }}
              />
              {errors.email && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "1rem", position: "relative" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                style={{
                  width: "100%", padding: "0.85rem 3rem 0.85rem 1.25rem", borderRadius: "12px",
                  border: `1px solid ${errors.password ? "#ef4444" : "var(--border)"}`,
                  backgroundColor: "var(--background)", color: "var(--foreground)", fontSize: "0.95rem"
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: 0, color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem"
              }}>
                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              {errors.password && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.password}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "var(--primary)" }} /> Ghi nhớ đăng nhập
              </label>
              <a href="#" style={{ color: "var(--accent)", fontWeight: "600" }}>Quên mật khẩu?</a>
            </div>

            <button
              id="login-submit"
              className="btn btn-primary"
              type="submit"
              style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", fontSize: "1rem" }}
            >
              Đăng Nhập
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <hr style={{ flexGrow: 1, border: 0, borderTop: "1px solid var(--border)" }} />
            <span style={{ padding: "0 0.75rem" }}>hoặc đăng nhập bằng</span>
            <hr style={{ flexGrow: 1, border: 0, borderTop: "1px solid var(--border)" }} />
          </div>

          <div>
            <button
              className="btn btn-outline"
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                fontSize: "0.9rem",
                width: "100%",
                opacity: googleLoading ? 0.7 : 1,
                cursor: googleLoading ? "not-allowed" : "pointer"
              }}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</>
              ) : (
                <><i className="fa-brands fa-google" style={{ color: "#EA4335" }}></i> Đăng nhập bằng Google</>
              )}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Bạn chưa có tài khoản?{" "}
            <Link href="/auth/register" style={{ color: "var(--primary)", fontWeight: "700" }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* RIGHT COLUMN: BACKGROUND */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "3rem", color: "white" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            backgroundImage: "linear-gradient(to top, rgba(15, 81, 50, 0.9) 20%, rgba(15, 81, 50, 0.3) 100%), url('https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800')",
            backgroundSize: "cover", backgroundPosition: "center", zIndex: 0
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="badge badge-accent" style={{ marginBottom: "1rem" }}>Tiêu dùng xanh</span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", marginBottom: "0.75rem", lineHeight: "1.3" }}>
              Cấp Cho Quần Áo Cũ Vòng Đời Thứ Hai
            </h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Quyên góp, trao đổi và phục sinh các trang phục dệt may cũ để cùng nhau giảm tải rác thải chôn lấp, làm sạch nguồn sống hành tinh.
            </p>

            {/* Demo account info box */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "12px",
              padding: "1rem", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <i className="fa-solid fa-circle-info"></i> Tài khoản Demo (click "Dùng tài khoản Demo" để chuyển)
              </p>
              <p style={{ fontSize: "0.78rem", opacity: 0.9, lineHeight: 1.8, fontFamily: "monospace" }}>
                📧 buyer@refashion.vn / buyer123<br />
                📧 seller@refashion.vn / seller123<br />
                📧 admin@refashion.vn / admin123
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-muted)" }}>Đang tải...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
