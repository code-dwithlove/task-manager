
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import "../css/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await login(email, password);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("email", res.data.email);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    }

    return (
        <div className="auth-page">

            <div className="auth-brand-panel">
                <div className="auth-brand">
                    <div className="auth-brand-icon">T</div>
                    <span>TaskFlow</span>
                </div>

                <div className="auth-brand-content">
                    <span className="auth-eyebrow">WORK SMARTER</span>

                    <h1>
                        Bring your team's
                        <span> work together.</span>
                    </h1>

                    <p>
                        Plan projects, organize tasks, and collaborate
                        with your team — all in one place.
                    </p>
                </div>

                <div className="auth-brand-footer">
                    © 2026 TaskFlow. All rights reserved.
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-mobile-brand">
                    <div className="auth-brand-icon">T</div>
                    <span>TaskFlow</span>
                </div>

                <section className="auth-card">

                    <div className="auth-heading">
                        <h2>Welcome back</h2>
                        <p>Enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="auth-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">

                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="auth-submit">
                            Log in
                            <span>→</span>
                        </button>

                    </form>

                    <div className="auth-divider">
                        <span></span>
                        <p>NEW TO TASKFLOW?</p>
                        <span></span>
                    </div>

                    <p className="auth-register">
                        Don't have an account?
                        <Link to="/register"> Create an account</Link>
                    </p>

                </section>

                <p className="auth-bottom-text">
                    Your workspace. Your progress. One place.
                </p>
            </div>

        </div>
    );
}

export default Login;
