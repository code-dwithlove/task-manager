
import { useState } from "react";
import { suggestTasks } from "../api/aiApi";
import { createTask } from "../api/taskApi";
import "../css/AiBreakdown.css";

export default function AiBreakdown({ projectId, onAdded }) {
    const [goal, setGoal] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const generate = async (e) => {
        e.preventDefault();

        if (!goal.trim()) return;

        setError("");
        setSuccess("");
        setSuggestions([]);
        setLoading(true);

        try {
            const { data } = await suggestTasks(projectId, {
                goal: goal.trim(),
            });

            const tasks = data?.tasks || [];

            if (!tasks.length) {
                setError("No tasks were generated. Try describing your goal differently.");
                return;
            }

            setSuggestions(
                tasks.map((task, index) => ({
                    ...task,
                    id: index,
                    selected: true,
                }))
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "AI request failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggle = (id) => {
        setSuggestions((list) =>
            list.map((task) =>
                task.id === id
                    ? { ...task, selected: !task.selected }
                    : task
            )
        );
    };

    const toggleAll = () => {
        const allSelected = suggestions.every((task) => task.selected);

        setSuggestions((list) =>
            list.map((task) => ({
                ...task,
                selected: !allSelected,
            }))
        );
    };

    const addSelected = async () => {
        const selectedTasks = suggestions.filter((task) => task.selected);

        if (!selectedTasks.length) return;

        setAdding(true);
        setError("");
        setSuccess("");

        let addedCount = 0;

        try {
            for (const task of selectedTasks) {
                await createTask(projectId, {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: "TODO",
                });

                addedCount++;
            }

            setSuggestions([]);
            setGoal("");
            setSuccess(`${addedCount} tasks added successfully!`);

            onAdded?.();
        } catch (err) {
            setError(
                `${addedCount} of ${selectedTasks.length} tasks were added. ` +
                (err.response?.data?.message || "Some tasks could not be added.")
            );

            if (addedCount > 0) {
                setSuggestions((list) =>
                    list.filter((task) => !selectedTasks
                        .slice(0, addedCount)
                        .some((added) => added.id === task.id))
                );

                onAdded?.();
            }
        } finally {
            setAdding(false);
        }
    };

    const chosen = suggestions.filter((task) => task.selected).length;

    return (
        <div className="ai-box">

            {/* Header */}
            <div className="ai-header">
                <div className="ai-icon">✦</div>

                <div>
                    <h3>AI Task Breakdown</h3>
                    <p>
                        Turn your ideas into actionable tasks with AI.
                    </p>
                </div>

                <span className="ai-badge">AI POWERED</span>
            </div>

            {/* Goal Input */}
            <form onSubmit={generate} className="ai-form">
                <label htmlFor="ai-goal">
                    What do you want to accomplish?
                </label>

                <textarea
                    id="ai-goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Example: Build a complete authentication system with login, registration, password reset and JWT security..."
                    maxLength={500}
                    required
                    disabled={loading || adding}
                />

                <div className="ai-form-footer">
                    <span>{goal.length}/500 characters</span>

                    <button
                        type="submit"
                        className="ai-generate-btn"
                        disabled={loading || adding || !goal.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="ai-spinner"></span>
                                Generating...
                            </>
                        ) : (
                            <>✦ Generate Tasks</>
                        )}
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="ai-message ai-error">
                    <span>⚠</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="ai-message ai-success">
                    <span>✓</span>
                    <p>{success}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="ai-loading">
                    <div className="ai-spinner large"></div>
                    <h4>Breaking down your goal...</h4>
                    <p>AI is creating actionable tasks for your project.</p>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && !loading && (
                <div className="ai-results">

                    <div className="ai-results-header">
                        <div>
                            <h4>Suggested Tasks</h4>
                            <p>
                                Review and select the tasks you want to add.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="ai-select-all"
                            onClick={toggleAll}
                            disabled={adding}
                        >
                            {chosen === suggestions.length
                                ? "Deselect all"
                                : "Select all"}
                        </button>
                    </div>

                    <div className="ai-list">
                        {suggestions.map((task) => (
                            <div
                                key={task.id}
                                className={`ai-task-card ${
                                    task.selected ? "selected" : ""
                                }`}
                            >
                                <label className="ai-task-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={task.selected}
                                        onChange={() => toggle(task.id)}
                                        disabled={adding}
                                    />
                                    <span className="custom-checkbox"></span>
                                </label>

                                <div className="ai-task-content">
                                    <div className="ai-task-title">
                                        <strong>{task.title}</strong>

                                        <span
                                            className={`ai-priority ${(
                                                task.priority || "MEDIUM"
                                            ).toLowerCase()}`}
                                        >
                                            {task.priority || "MEDIUM"}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p>{task.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ai-results-footer">
                        <span>
                            <strong>{chosen}</strong> of {suggestions.length} tasks selected
                        </span>

                        <button
                            type="button"
                            className="ai-add-btn"
                            onClick={addSelected}
                            disabled={adding || chosen === 0}
                        >
                            {adding
                                ? "Adding Tasks..."
                                : `+ Add ${chosen} Tasks to Project`}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
