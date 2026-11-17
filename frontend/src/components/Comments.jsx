
import { useEffect, useState } from "react";
import api from "../api";
import "../css/Comments.css";

export default function Comments({ taskId, onChanged }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const myEmail = localStorage.getItem("email");

    async function load() {
        try {
            const res = await api.get(`/tasks/${taskId}/comments`);
            setComments(res.data);
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        load();
    }, [taskId]);

    function getInitials(name) {
        return name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";
    }

    function formatDate(date) {
        return new Date(date).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    async function handleAdd(e) {
        e.preventDefault();

        if (!text.trim() || sending) return;

        try {
            setSending(true);

            await api.post(`/tasks/${taskId}/comments`, {
                text: text.trim(),
            });

            setText("");
            await load();

            if (onChanged) onChanged();
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setSending(false);
        }
    }

    async function handleDelete(id) {
        try {
            await api.delete(`/comments/${id}`);
            await load();

            if (onChanged) onChanged();
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    }

    return (
        <section className="comments-card">

            <div className="comments-header">
                <div>
                    <h3>Comments</h3>
                    <p>Share your thoughts with your team</p>
                </div>

                <span className="comments-count">
                    {comments.length}
                </span>
            </div>

            <div className="comments-list">

                {loading ? (
                    <p className="comments-empty">
                        Loading comments...
                    </p>
                ) : comments.length === 0 ? (
                    <div className="comments-empty">
                        <div className="comments-empty-icon">💬</div>
                        <h4>No comments yet</h4>
                        <p>Be the first to start the conversation.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div className="comment-item" key={comment.id}>

                            <div className="comment-avatar">
                                {getInitials(comment.authorName)}
                            </div>

                            <div className="comment-body">

                                <div className="comment-top">
                                    <strong>{comment.authorName}</strong>

                                    <small>
                                        {formatDate(comment.createdAt)}
                                    </small>
                                </div>

                                <p className="comment-text">
                                    {comment.text}
                                </p>

                                {comment.authorEmail === myEmail && (
                                    <button
                                        className="comment-delete"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        Delete
                                    </button>
                                )}

                            </div>
                        </div>
                    ))
                )}

            </div>

            <form className="comment-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={sending}
                    required
                />

                <button
                    type="submit"
                    disabled={sending || !text.trim()}
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>

        </section>
    );
}
