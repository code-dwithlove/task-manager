import {useEffect, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import {register, wakeServer} from "../api/authApi";
import "../css/Login.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        wakeServer();
    }, []);


    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await register(name, email, password);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("email", res.data.email);

            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Registration failed"
            );
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            {/* Branding panel */}
            <aside className="auth-brand-panel">
                <div className="auth-brand">
                    <div className="auth-brand-icon">T</div>
                    <span>TaskFlow</span>
                </div>

                <div className="auth-brand-content">
                    <span className="auth-eyebrow">GET STARTED</span>

                    <h1>
                        A better way
                        <br />
                        to work together.
                    </h1>

                    <p>
                        Bring your projects, tasks, and team into one
                        organized workspace. Start building momentum today.
                    </p>

                    <div className="auth-brand-decoration">
                        <div className="decoration-card decoration-card-one">
                            <span className="decoration-dot"></span>
                            Project planning
                            <span className="decoration-check">✓</span>
                        </div>

                        <div className="decoration-card decoration-card-two">
                            <span className="decoration-dot"></span>
                            Team collaboration
                            <span className="decoration-check">✓</span>
                        </div>

                        <div className="decoration-card decoration-card-three">
                            <span className="decoration-dot"></span>
                            Track your progress
                            <span className="decoration-check">✓</span>
                        </div>
                    </div>
                </div>

                <div className="auth-bottom-text">
                    © 2026 TaskFlow. All rights reserved.
                </div>
            </aside>

            {/* Registration panel */}
            <main className="auth-form-panel">
                <div className="auth-mobile-brand">
                    <div className="auth-brand-icon">T</div>
                    <span>TaskFlow</span>
                </div>

                <section className="auth-card">
                    <div className="auth-heading">
                        <span className="auth-eyebrow">CREATE ACCOUNT</span>
                        <h2>Create your account</h2>
                        <p>Enter your details to get started.</p>
                    </div>

                    {error && (
                        <div className="auth-alert" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

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

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Getting You In..." : "Create Account"}
                            {!loading && <span>→</span>}
                        </button>

                        {loading && (
                            <p className="auth-hint">
                                The server may be waking up. This can take up to a minute the first time.
                            </p>
                        )}
                    </form>

                    <div className="auth-divider">
                        <span>ALREADY REGISTERED?</span>
                    </div>

                    <p className="auth-register">
                        Already have an account?{" "}
                        <Link to="/login">Log in</Link>
                    </p>
                </section>
            </main>
        </div>
    );
}

export default Register;