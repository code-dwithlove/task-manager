
import { useState } from "react";
import "../css/Members.css";

function Members({ members, isOwner, onAdd, onRemove }) {
    const [email, setEmail] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const added = await onAdd(email.trim());

        if (added) setEmail("");
    }

    function getInitials(name) {
        return name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";
    }

    return (
        <section className="members-card">

            <div className="members-header">
                <div>
                    <h2>Team Members</h2>
                    <p>Manage people working on this project.</p>
                </div>

                <span className="members-count">
                    {members.length} members
                </span>
            </div>

            <div className="members-list">

                {members.map((member) => (
                    <div className="member-item" key={member.userId}>

                        <div className="member-avatar">
                            {getInitials(member.name)}
                        </div>

                        <div className="member-info">
                            <strong>{member.name}</strong>
                            <small>{member.email}</small>
                        </div>

                        <div className="member-actions">
                            <span
                                className={`member-role ${
                                    member.role === "OWNER" ? "owner" : "member"
                                }`}
                            >
                                {member.role}
                            </span>

                            {isOwner && member.role !== "OWNER" && (
                                <button
                                    className="member-remove"
                                    onClick={() => onRemove(member.userId)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                    </div>
                ))}

                {members.length === 0 && (
                    <div className="members-empty">
                        <div>👥</div>
                        <h3>No members yet</h3>
                        <p>Add people to start collaborating.</p>
                    </div>
                )}

            </div>

            {isOwner && (
                <div className="member-invite-section">

                    <div className="invite-heading">
                        <h3>Invite a team member</h3>
                        <p>Add someone to this project using their email address.</p>
                    </div>

                    <form className="member-invite-form" onSubmit={handleSubmit}>

                        <div className="member-input-wrapper">
                            <input
                                id="memberEmail"
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit">
                            + Add member
                        </button>

                    </form>

                </div>
            )}

        </section>
    );
}

export default Members;
