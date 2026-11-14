import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNotifications, getUnreadCount, markAllRead, markRead,
} from "../api/notificationApi";

function NotificationBell() {
    const [count, setCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    async function loadCount() {
        try {
            const res = await getUnreadCount();
            setCount(res.data.count);
        } catch {
            // ignore: the bell is not important enough to show an error
        }
    }

    useEffect(() => {
        loadCount();
        const timer = setInterval(loadCount, 30000);
        return () => clearInterval(timer);       // stop when the page closes
    }, []);

    async function toggle() {
        if (!open) {
            const res = await getNotifications();
            setItems(res.data);
        }
        setOpen(!open);
    }

    async function openItem(n) {
        await markRead(n.id);
        setOpen(false);
        loadCount();
        if (n.projectId) navigate(`/projects/${n.projectId}`);
    }

    async function handleMarkAll() {
        await markAllRead();
        setItems(items.map((n) => ({ ...n, seen: true })));
        setCount(0);
    }

    return (
        <div className="bell">
            <button onClick={toggle}>🔔 {count > 0 && <b>({count})</b>}</button>
            {open && (
                <div className="bell-panel">
                    <button className="secondary-btn" onClick={handleMarkAll}>
                        Mark all as read
                    </button>
                    {items.length === 0 && <p>No notifications.</p>}
                    {items.map((n) => (
                        <div key={n.id} className="bell-item" onClick={() => openItem(n)}
                             style={{ fontWeight: n.seen ? "normal" : "bold" }}>
                            {n.message}
                            <small> {new Date(n.createdAt).toLocaleString()}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;