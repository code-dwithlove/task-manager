
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNotifications,
    getUnreadCount,
    markAllRead,
    markRead,
} from "../api/notificationApi";
import "../css/NotificationBell.css";

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
            // Ignore notification count errors.
        }
    }

    useEffect(() => {
        loadCount();

        const timer = setInterval(loadCount, 30000);

        return () => clearInterval(timer);
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

    function formatDate(date) {
        return new Date(date).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    return (
        <div className="notification-wrapper">

            <button
                className={`notification-trigger ${open ? "active" : ""}`}
                onClick={toggle}
                aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
                aria-expanded={open}
            >
                <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                </svg>

                {count > 0 && (
                    <span className="notification-badge">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="notification-overlay"
                        onClick={() => setOpen(false)}
                    />

                    <div className="notification-panel">

                        <div className="notification-header">
                            <div>
                                <h3>Notifications</h3>
                                <p>
                                    {count} unread notifications
                                </p>
                            </div>

                            <button
                                className="notification-close"
                                onClick={() => setOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="notification-actions">
                            <button
                                className="mark-all-read"
                                onClick={handleMarkAll}
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="notification-list">

                            {items.length === 0 ? (
                                <div className="notification-empty">
                                    <div>🔔</div>
                                    <h4>You're all caught up!</h4>
                                    <p>No notifications to show.</p>
                                </div>
                            ) : (
                                items.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${
                                            n.seen ? "read" : "unread"
                                        }`}
                                        onClick={() => openItem(n)}
                                    >
                                        <span className="notification-dot" />

                                        <div className="notification-content">
                                            <p>{n.message}</p>

                                            <small>
                                                {formatDate(n.createdAt)}
                                            </small>
                                        </div>
                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}

export default NotificationBell;
