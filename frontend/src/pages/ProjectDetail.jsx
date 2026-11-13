import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    createTask, deleteTask, getTasks, updateTask, updateTaskStatus,
} from "../api/taskApi";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import Comments from "../components/Comments";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function errorMessage(err) {
    const data = err.response?.data;
    return data && typeof data === "object"
        ? Object.values(data).join(", ")
        : "Cannot reach the server.";
}

function ProjectDetail() {
    const { id } = useParams();
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [openTaskId, setOpenTaskId] = useState(null);   // which task's comments are shown
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const res = await getTasks(id, filter);
            setTasks(res.data);
            setError("");
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [id, filter]);

    async function handleSave(task) {
        setError("");
        try {
            if (editingTask) {
                await updateTask(editingTask.id, task);
                setEditingTask(null);
            } else {
                await createTask(id, task);
            }
            await load();
            return true;
        } catch (err) {
            setError(errorMessage(err));
            return false;
        }
    }

    async function handleStatusChange(taskId, status) {
        try {
            await updateTaskStatus(taskId, status);
            await load();
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    async function handleDelete(taskId) {
        if (!window.confirm("Delete this task?")) return;
        try {
            await deleteTask(taskId);
            if (editingTask?.id === taskId) setEditingTask(null);
            if (openTaskId === taskId) setOpenTaskId(null);
            await load();
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    return (
        <div className="container">
            <header>
                <h1>Project tasks</h1>
                <p><Link to="/">Back to projects</Link></p>
            </header>

            {error && <div className="alert error" role="alert">{error}</div>}

            <TaskForm onSubmit={handleSave} editingTask={editingTask}
                      onCancel={() => setEditingTask(null)} />

            <section className="task-form">
                <label htmlFor="filter">Show</label>
                <select id="filter" value={filter}
                        onChange={(e) => setFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                </select>
            </section>

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <TaskList tasks={tasks} onEdit={setEditingTask}
                          onDelete={handleDelete} onStatusChange={handleStatusChange}
                          onOpenComments={setOpenTaskId} />
            )}

            {openTaskId && (
                <section className="task-form">
                    <Comments taskId={openTaskId} />
                    <div className="form-actions">
                        <button className="secondary-btn" onClick={() => setOpenTaskId(null)}>
                            Close comments
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}

export default ProjectDetail;