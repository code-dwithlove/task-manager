
import { useEffect, useState } from "react";
import "../css/TaskForm.css";

function TaskForm({ onSubmit, editingTask, onCancel }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);

    function clearFields() {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate("");
    }

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description || "");
            setPriority(editingTask.priority);
            setDueDate(editingTask.dueDate || "");
        } else {
            clearFields();
        }
    }, [editingTask]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        try {
            const saved = await onSubmit({
                title: title.trim(),
                description,
                priority,
                dueDate: dueDate || null,
                status: editingTask ? editingTask.status : "TODO",
            });

            if (saved && !editingTask) clearFields();
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="task-form-card">

            <div className="task-form-header">
                <div>
                    <span className="task-form-label">
                        TASK MANAGEMENT
                    </span>

                    <h2>
                        {editingTask ? "Edit task" : "Create a task"}
                    </h2>

                    <p>
                        {editingTask
                            ? "Update the details of your task."
                            : "Add a new task and keep your project moving."}
                    </p>
                </div>
            </div>

            <form className="modern-task-form" onSubmit={handleSubmit}>

                <div className="task-field">
                    <label htmlFor="title">Task title</label>

                    <input
                        id="title"
                        type="text"
                        placeholder="e.g. Design the dashboard"
                        value={title}
                        required
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="task-field">
                    <label htmlFor="description">Description</label>

                    <textarea
                        id="description"
                        rows="4"
                        placeholder="Describe what needs to be done..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="task-form-grid">

                    <div className="task-field">
                        <label htmlFor="priority">Priority</label>

                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="task-field">
                        <label htmlFor="dueDate">Due date</label>

                        <input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                </div>

                <div className="modern-form-actions">

                    <button
                        type="submit"
                        className="task-submit-btn"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingTask
                                ? "Update task"
                                : "+ Create task"}
                    </button>

                    {editingTask && (
                        <button
                            type="button"
                            className="task-cancel-btn"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

        </section>
    );
}

export default TaskForm;
