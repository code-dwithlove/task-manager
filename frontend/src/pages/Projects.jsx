
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    createProject,
    deleteProject,
    getProjects,
} from "../api/projectApi";
import NotificationBell from "../components/NotificationBell.jsx";
import AccountMenu from "../components/AccountMenu.jsx";
import "../css/Projects.css";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    async function load() {
        try {
            const res = await getProjects();
            setProjects(res.data);
        } catch {
            setError("Could not load projects.");
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        await createProject({ name, description: "" });
        setName("");
        load();
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this project and its tasks?")) return;
        await deleteProject(id);
        load();
    }

    return (
        <main className="projects-page">

            {/* Dashboard header */}
            <header className="projects-header">

                <div className="projects-brand">
                    <div className="projects-brand-icon">T</div>
                    <span>TaskFlow</span>
                </div>

                <div className="projects-header-actions">
                    <NotificationBell />
                    <AccountMenu />
                </div>

            </header>

            {/* Page introduction */}
            <section className="projects-intro">
                <div>
                    <span className="projects-eyebrow">YOUR WORKSPACE</span>
                    <h1>My projects</h1>
                    <p>
                        Organize your work, collaborate with your team,
                        and keep everything moving.
                    </p>
                </div>

                <div className="projects-count">
                    <span>{projects.length}</span>
                    <p>Total projects</p>
                </div>
            </section>

            {/* Error message */}
            {error && (
                <div className="projects-error" role="alert">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* Create project */}
            <section className="create-project-section">

                <div className="create-project-heading">
                    <div className="create-project-icon">+</div>

                    <div>
                        <h2>Create a new project</h2>
                        <p>Start organizing your next piece of work.</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="create-project-form">
                    <div className="create-project-input">
                        <label htmlFor="name">Project name</label>
                        <input
                            id="name"
                            value={name}
                            required
                            placeholder="e.g. Website redesign"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button type="submit">
                        <span>+</span> Add project
                    </button>
                </form>

            </section>

            {/* Project collection */}
            <section className="projects-collection">

                <div className="projects-collection-heading">
                    <div>
                        <h2>All projects</h2>
                        <p>Your projects in one place.</p>
                    </div>

                    <span className="projects-collection-count">
                        {projects.length} projects
                    </span>
                </div>

                {projects.length === 0 ? (
                    <div className="projects-empty">
                        <div className="projects-empty-icon">▦</div>
                        <h3>No projects yet</h3>
                        <p>
                            Create your first project to start managing
                            tasks and collaborating with your team.
                        </p>
                    </div>
                ) : (
                    <div className="projects-grid">

                        {projects.map((p) => (
                            <article key={p.id} className="project-card">

                                <div className="project-card-top">
                                    <div className="project-card-icon">▦</div>

                                    <button
                                        className="project-delete-button"
                                        onClick={() => handleDelete(p.id)}
                                        aria-label={`Delete ${p.name}`}
                                        title="Delete project"
                                    >
                                        ×
                                    </button>
                                </div>

                                <h3>
                                    <Link to={`/projects/${p.id}`}>
                                        {p.name}
                                    </Link>
                                </h3>

                                <p className="project-card-description">
                                    Manage tasks and collaborate with your team.
                                </p>

                                <div className="project-card-footer">
                                    <Link to={`/projects/${p.id}`}>
                                        Open project <span>→</span>
                                    </Link>
                                </div>

                            </article>
                        ))}

                    </div>
                )}

            </section>

            <footer className="projects-footer">
                <span>TaskFlow</span>
                <p>Make progress, one task at a time.</p>
            </footer>

        </main>
    );
}

export default Projects;
