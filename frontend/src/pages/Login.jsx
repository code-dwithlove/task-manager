import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";

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
        <div className="container narrow">
            <section className="task-form">
                <h2>Login</h2>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} required
                           onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} required
                           onChange={(e) => setPassword(e.target.value)} />
                    <div className="form-actions"><button type="submit">Log in</button></div>
                </form>
                <p>No account? <Link to="/register">Register</Link></p>
            </section>
        </div>
    );
}

export default Login;