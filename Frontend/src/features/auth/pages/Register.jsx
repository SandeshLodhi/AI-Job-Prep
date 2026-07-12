import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, handleRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password });
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

      {/* Register Card */}
      <div className="form-container">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="button primary-button" type="submit">
            Register →
          </button>
        </form>

        <p className="register-text">
          Already have an account?
          <Link to="/login"> Login Here!</Link>
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

export default Register;