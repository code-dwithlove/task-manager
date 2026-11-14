import { useState } from "react";

function Members({ members, isOwner, onAdd, onRemove }) {
    const [email, setEmail] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const added = await onAdd(email.trim());
        if (added) setEmail("");
    }

    return (
        <section className="task-form">
            <h2>Members</h2>
            <ul>
                {members.map((m) => (
                    <li key={m.userId}>
                        {m.name} ({m.email}), {m.role}{" "}
                        {isOwner && m.role !== "OWNER" && (
                            <button className="delete-btn" onClick={() => onRemove(m.userId)}>
                                Remove
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {isOwner && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="memberEmail">Add a member by email</label>
                    <input id="memberEmail" type="email" value={email} required
                           onChange={(e) => setEmail(e.target.value)} />
                    <div className="form-actions">
                        <button type="submit">Add member</button>
                    </div>
                </form>
            )}
        </section>
    );
}

export default Members;