import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    assignTask, createTask, deleteTask, getTasks, updateTask, updateTaskStatus,
} from "../api/taskApi";
import { addMember, getMembers, removeMember } from "../api/memberApi";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import KanbanBoard from "../components/KanbanBoard";
import Members from "../components/Members";
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
    const myEmail = localStorage.getItem("email");

    const [view, setView] = useState("list");            // "list" or "board"
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [filter, setFilter] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [openTaskId, setOpenTaskId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const isOwner = members.some((m) => m.email === myEmail && m.role === "OWNER");

    async function loadTasks() {
        setLoading(true);
        try {
            // the board always shows every status, so it ignores the filter
            const res = await getTasks(id, view === "list" ? filter : "");
            setTasks(res.data);
            setError("");
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    async function loadMembers() {
        try {
            const res = await getMembers(id);
            setMembers(res.data);
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    useEffect(() => { loadTasks(); }, [id, filter, view]);
    useEffect(() => { loadMembers(); }, [id]);

    async function handleSave(task) {
        setError("");
        try {
            if (editingTask) {
                await updateTask(editingTask.id, task);
                setEditingTask(null);
            } else {
                await createTask(id, task);
            }
            await loadTasks();
            return true;
        } catch (err) {
            setError(errorMessage(err));
            return false;
        }
    }

    async function handleStatusChange(taskId, status) {
        try {
            await updateTaskStatus(taskId, status);
            await loadTasks();
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    // Board: move the card on screen first, then save, and undo if the server refuses
    async function handleMove(taskId, newStatus) {
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;
        const oldStatus = task.status;

        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (err) {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t)));
            setError(errorMessage(err));
        }
    }

    async function handleAssign(taskId, userId) {
        try {
            await assignTask(taskId, userId);
            await loadTasks();
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
            await loadTasks();
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    async function handleAddMember(email) {
        setError("");
        try {
            await addMember(id, email);
            await loadMembers();
            return true;
        } catch (err) {
            setError(errorMessage(err));
            return false;
        }
    }

    async function handleRemoveMember(userId) {
        if (!window.confirm("Remove this member?")) return;
        try {
            await removeMember(id, userId);
            await loadMembers();
            await loadTasks();
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

            <Members members={members} isOwner={isOwner}
                     onAdd={handleAddMember} onRemove={handleRemoveMember} />

            <TaskForm onSubmit={handleSave} editingTask={editingTask}
                      onCancel={() => setEditingTask(null)} />

            <div className="view-switch">
                <button className={view === "list" ? "active" : ""}
                        onClick={() => setView("list")}>List</button>
                <button className={view === "board" ? "active" : ""}
                        onClick={() => setView("board")}>Board</button>
            </div>

            {view === "list" && (
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
            )}

            {loading ? (
                <p>Loading tasks...</p>
            ) : view === "board" ? (
                <KanbanBoard tasks={tasks} onMove={handleMove} />
            ) : (
                <TaskList tasks={tasks} members={members} onEdit={setEditingTask}
                          onDelete={handleDelete} onStatusChange={handleStatusChange}
                          onAssign={handleAssign} onOpenComments={setOpenTaskId} />
            )}

            {view === "list" && openTaskId && (
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