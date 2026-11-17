
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    assignTask,
    createTask,
    deleteTask,
    getTasks,
    updateTask,
    updateTaskStatus,
} from "../api/taskApi";
import {
    addMember,
    getMembers,
    removeMember,
} from "../api/memberApi";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import KanbanBoard from "../components/KanbanBoard";
import Members from "../components/Members";
import Comments from "../components/Comments";
import ActivityFeed from "../components/ActivityFeed.jsx";
import "../css/ProjectDetail.css";
import "../App.css";
import AiBreakdown from "../components/AiBreakdown.jsx";

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

    const [view, setView] = useState("list");
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [filter, setFilter] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [openTaskId, setOpenTaskId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const isOwner = members.some(
        (m) => m.email === myEmail && m.role === "OWNER"
    );

    async function loadTasks() {
        setLoading(true);

        try {
            // The board always shows every status, so it ignores the filter.
            const res = await getTasks(id, view === "list" ? filter : "");
            setTasks(res.data);
            setError("");
            setRefreshKey((k) => k + 1);
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
            setRefreshKey((k) => k + 1);
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    useEffect(() => {
        loadTasks();
    }, [id, filter, view]);

    useEffect(() => {
        loadMembers();
    }, [id]);

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

    // Board: move the card on screen first, then save, and undo if the server refuses.
    async function handleMove(taskId, newStatus) {
        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;

        const oldStatus = task.status;

        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId ? { ...t, status: newStatus } : t
            )
        );

        try {
            await updateTaskStatus(taskId, newStatus);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId ? { ...t, status: oldStatus } : t
                )
            );
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
        <main className="project-page">

            {/* Project header */}
            <header className="project-page-header">
                <div className="project-breadcrumb">
                    <Link to="/" className="project-back-link">
                        <span>←</span> Back to projects
                    </Link>
                </div>

                <div className="project-heading">
                    <div>
                        <span className="project-eyebrow">PROJECT WORKSPACE</span>
                        <h1>Project tasks</h1>
                        <p>Organize tasks, manage your team, and track progress.</p>
                    </div>
                </div>
            </header>

            {/* Error message */}
            {error && (
                <div className="project-error" role="alert">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* Team members */}
            <section className="project-section">
                <Members
                    members={members}
                    isOwner={isOwner}
                    onAdd={handleAddMember}
                    onRemove={handleRemoveMember}
                />
            </section>

            {/* Task creation and editing */}
            <section className="project-section">
                <div className="project-section-heading">
                    <div>
                        <span className="project-eyebrow">TASK MANAGEMENT</span>
                        <h2>{editingTask ? "Edit task" : "Create a task"}</h2>
                    </div>
                </div>

                <TaskForm
                    onSubmit={handleSave}
                    editingTask={editingTask}
                    onCancel={() => setEditingTask(null)}
                />
            </section>




            <AiBreakdown projectId={id} onAdded={() => { loadTasks(); setRefreshKey((k) => k + 1); }} />


            {/* Task workspace */}
            <section className="project-workspace">

                <div className="workspace-heading">
                    <div>
                        <h2>Workspace</h2>
                        <p>View and manage all project tasks.</p>
                    </div>

                    <div className="view-switch">
                        <button
                            className={view === "list" ? "active" : ""}
                            onClick={() => setView("list")}
                        >
                            <span>☷</span> List
                        </button>

                        <button
                            className={view === "board" ? "active" : ""}
                            onClick={() => setView("board")}
                        >
                            <span>▦</span> Board
                        </button>
                    </div>
                </div>

                {view === "list" && (
                    <div className="project-filter">
                        <label htmlFor="filter">Filter by status</label>

                        <select
                            id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="">All statuses</option>

                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="project-loading">
                        <div className="project-spinner"></div>
                        <p>Loading tasks...</p>
                    </div>
                ) : view === "board" ? (
                    <KanbanBoard tasks={tasks} onMove={handleMove} />
                ) : (
                    <TaskList
                        tasks={tasks}
                        members={members}
                        onEdit={setEditingTask}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onAssign={handleAssign}
                        onOpenComments={setOpenTaskId}
                    />
                )}

            </section>

            {/* Comments */}
            {view === "list" && openTaskId && (
                <section className="project-comments-section">
                    <div className="project-section-heading">
                        <div>
                            <span className="project-eyebrow">DISCUSSION</span>
                            <h2>Task comments</h2>
                        </div>

                        <button
                            className="project-close-comments"
                            onClick={() => setOpenTaskId(null)}
                        >
                            Close comments
                        </button>
                    </div>

                    <Comments
                        taskId={openTaskId}
                        onChanged={() => setRefreshKey((k) => k + 1)}
                    />
                </section>
            )}

            {/* Activity feed */}
            <section className="project-activity-section">
                <ActivityFeed projectId={id} refreshKey={refreshKey} />
            </section>

        </main>
    );
}

export default ProjectDetail;
