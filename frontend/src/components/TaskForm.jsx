import { useEffect, useState } from "react";

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

    // fill the form when a task is chosen for editing, clear it otherwise
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
        <section className="task-form">
            <h2>{editingTask ? "Edit task" : "Add new task"}</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input id="title" value={title} required
                       onChange={(e) => setTitle(e.target.value)} />

                <label htmlFor="description">Description</label>
                <textarea id="description" rows="3" value={description}
                          onChange={(e) => setDescription(e.target.value)} />

                <label htmlFor="priority">Priority</label>
                <select id="priority" value={priority}
                        onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>

                <label htmlFor="dueDate">Due date</label>
                <input id="dueDate" type="date" value={dueDate}
                       onChange={(e) => setDueDate(e.target.value)} />

                <div className="form-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : editingTask ? "Update task" : "Add task"}
                    </button>
                    {editingTask && (
                        <button type="button" className="secondary-btn" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default TaskForm;