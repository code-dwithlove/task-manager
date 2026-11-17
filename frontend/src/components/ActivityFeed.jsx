
import { useEffect, useState } from "react";
import { getActivity } from "../api/activityApi";

function ActivityFeed({ projectId, refreshKey }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        getActivity(projectId)
            .then((res) => setItems(res.data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [projectId, refreshKey]);

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <section className="activity-card">
            <div className="activity-header">
                <div>
                    <h2>Activity</h2>
                    <p>Recent updates and project activity</p>
                </div>

                <span className="activity-count">
                    {items.length} updates
                </span>
            </div>

            {loading ? (
                <p className="activity-empty">Loading activity...</p>
            ) : items.length === 0 ? (
                <div className="activity-empty">
                    <div className="activity-empty-icon">↗</div>
                    <h3>No activity yet</h3>
                    <p>Updates will appear here as your project progresses.</p>
                </div>
            ) : (
                <ul className="activity-list">
                    {items.map((activity) => (
                        <li className="activity-item" key={activity.id}>
                            <div className="activity-avatar">
                                {getInitials(activity.actorName)}
                            </div>

                            <div className="activity-content">
                                <p>
                                    <strong>{activity.actorName}</strong>{" "}
                                    {activity.message}
                                </p>

                                <small>
                                    {formatDate(activity.createdAt)}
                                </small>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ActivityFeed;
