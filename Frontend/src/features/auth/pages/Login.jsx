import "../auth.form.scss";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/");
  };

  if (loading) {
    return (
      <main>
        <h1>Loading.....</h1>
      </main>
    );
  }

  return (
    <main className="login-page">
      {/* Logo */}
      <div className="logo">
        <h1>
          AI Job <span>Prep</span>
        </h1>
        <p>Design by Sandesh</p>
      </div>

      {/* Login Card */}
      <div className="form-container">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <input
              type="password"
              id="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="button primary-button" type="submit">
            Sign In →
          </button>
        </form>

        <p className="register-text">
          Don't have an account?
          <Link to="/register"> Register Here!</Link>
        </p>
      </div>

      {/* Footer */}
      <footer>
        <p>© 2026 Message_Codes</p>

        <div className="footer-links">
          <Link >Privacy Policy</Link>
          <Link >Terms of Service</Link>
          <Link >Security</Link>
          <Link >Contact</Link>
        </div>
      </footer>
    </main>
  );
};

export default Login;