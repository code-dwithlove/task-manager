
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

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
        }
    }

    return (
        <div className="container narrow">
            <section className="task-form">
                <h2>Register</h2>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="form-actions">
                        <button type="submit">Register</button>
                    </div>
                </form>

                <p>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </div>
    );
}

export default Register;
