import { useEffect, useState } from "react";
import { getActivity } from "../api/activityApi";

function ActivityFeed({ projectId, refreshKey }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        getActivity(projectId)
            .then((res) => setItems(res.data))
            .catch(() => setItems([]));
    }, [projectId, refreshKey]);   // loads again whenever refreshKey changes

    return (
        <section className="task-list">
            <h2>Activity</h2>
            {items.length === 0 && <p>No activity yet.</p>}
            <ul className="activity-list">
                {items.map((a) => (
                    <li key={a.id}>
                        <strong>{a.actorName}</strong> {a.message}{" "}
                        <small>{new Date(a.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default ActivityFeed;