import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createProject, deleteProject, getProjects } from "../api/projectApi";

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

    useEffect(() => { load(); }, []);

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
        <div className="container">
            <header><h1>My projects</h1></header>
            {error && <div className="alert error">{error}</div>}

            <section className="task-form">
                <form onSubmit={handleCreate}>
                    <label htmlFor="name">New project</label>
                    <input id="name" value={name} required
                           onChange={(e) => setName(e.target.value)} />
                    <div className="form-actions"><button type="submit">Add project</button></div>
                </form>
            </section>

            <section className="task-list">
                <div className="task-grid">
                    {projects.map((p) => (
                        <div key={p.id} className="task-card">
                            <h3><Link to={`/projects/${p.id}`}>{p.name}</Link></h3>
                            <div className="task-actions">
                                <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Projects;