const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function TaskList({ tasks, onEdit, onDelete, onStatusChange }) {
    if (tasks.length === 0) {
        return (
            <section className="task-list">
                <h2>Tasks</h2>
                <p>No tasks yet. Add your first task above.</p>
            </section>
        );
    }

    return (
        <section className="task-list">
            <h2>Tasks</h2>
            <div className="task-grid">
                {tasks.map((task) => (
                    <div key={task.id}
                         className={`task-card ${task.status === "COMPLETED" ? "completed" : ""}`}>
                        <div className="task-header">
                            <h3>{task.title}</h3>
                            <span className={`badge ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
                        </div>
                        <p>{task.description || "No description"}</p>
                        <p className="due-date">Due: {task.dueDate || "not set"}</p>

                        <select value={task.status}
                                onChange={(e) => onStatusChange(task.id, e.target.value)}>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                        </select>

                        <div className="task-actions">
                            <button className="edit-btn" onClick={() => onEdit(task)}>Edit</button>
                            <button className="delete-btn" onClick={() => onDelete(task.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TaskList;