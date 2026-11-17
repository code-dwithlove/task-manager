import "../css/TaskList.css";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function TaskList({
                      tasks,
                      members,
                      onEdit,
                      onDelete,
                      onStatusChange,
                      onAssign,
                      onOpenComments,
                  }) {
    return (
        <section className="task-list-section">

            <div className="task-list-header">
                <div>
                    <h2>Tasks</h2>
                    <p>Manage and track your project tasks.</p>
                </div>

                <span className="task-total">
                    {tasks.length} tasks
                </span>
            </div>

            {tasks.length === 0 ? (
                <div className="task-list-empty">
                    <div className="task-empty-icon">📋</div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started.</p>
                </div>
            ) : (
                <div className="modern-task-grid">

                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`modern-task-card ${
                                task.status === "COMPLETED" ? "completed" : ""
                            }`}
                        >

                            <div className="modern-task-header">
                                <h3>{task.title}</h3>

                                <span className={`badge ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                            </div>

                            <p className="modern-task-description">
                                {task.description || "No description"}
                            </p>

                            <div className="modern-task-due">
                                <span>Due date</span>
                                <strong>{task.dueDate || "Not set"}</strong>
                            </div>

                            <div className="modern-task-controls">

                                <div className="task-control">
                                    <label htmlFor={`status-${task.id}`}>
                                        Status
                                    </label>

                                    <select
                                        id={`status-${task.id}`}
                                        value={task.status}
                                        onChange={(e) =>
                                            onStatusChange(task.id, e.target.value)
                                        }
                                    >
                                        {STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status.replace("_", " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="task-control">
                                    <label htmlFor={`assignee-${task.id}`}>
                                        Assigned to
                                    </label>

                                    <select
                                        id={`assignee-${task.id}`}
                                        value={task.assigneeId ?? ""}
                                        onChange={(e) =>
                                            onAssign(task.id, e.target.value)
                                        }
                                    >
                                        <option value="">Unassigned</option>

                                        {members.map((member) => (
                                            <option
                                                key={member.userId}
                                                value={member.userId}
                                            >
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="modern-task-actions">

                                <button
                                    className="task-action-edit"
                                    onClick={() => onEdit(task)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="task-action-comments"
                                    onClick={() => onOpenComments(task.id)}
                                >
                                    Comments
                                </button>

                                <button
                                    className="task-action-delete"
                                    onClick={() => onDelete(task.id)}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </section>
    );
}

export default TaskList;
