import { useEffect, useState } from "react";
import api from "../api";

export default function Comments({ taskId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const myEmail = localStorage.getItem("email");

    async function load() {
        const res = await api.get(`/tasks/${taskId}/comments`);
        setComments(res.data);
    }

    useEffect(() => { load(); }, [taskId]);

    async function handleAdd(e) {
        e.preventDefault();
        await api.post(`/tasks/${taskId}/comments`, { text });
        setText("");
        load();
    }

    async function handleDelete(id) {
        await api.delete(`/comments/${id}`);
        load();
    }

    return (
        <div>
            <h3>Comments</h3>
            {comments.map((c) => (
                <p key={c.id}>
                    <strong>{c.authorName}</strong>: {c.text}{" "}
                    <small>{new Date(c.createdAt).toLocaleString()}</small>
                    {c.authorEmail === myEmail && (
                        <button onClick={() => handleDelete(c.id)}>Delete</button>
                    )}
                </p>
            ))}
            <form onSubmit={handleAdd}>
                <input value={text} onChange={(e) => setText(e.target.value)}
                       placeholder="Write a comment" required />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}