
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import "../css/KanbanBoard.css";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function TaskCard({ task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: task.id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`kanban-card ${isDragging ? "dragging" : ""}`}
        >
            <div className="kanban-card-top">
                <span className={`badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
            </div>

            <h4>{task.title}</h4>

            <div className="kanban-meta">
                {task.dueDate && (
                    <small>📅 {task.dueDate}</small>
                )}

                {task.assigneeName && (
                    <div className="kanban-assignee">
                        <span className="assignee-avatar">
                            {task.assigneeName.charAt(0).toUpperCase()}
                        </span>
                        <small>{task.assigneeName}</small>
                    </div>
                )}
            </div>
        </div>
    );
}

function Column({ status, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    const statusLabels = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        REVIEW: "Review",
        COMPLETED: "Completed",
    };

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${isOver ? "column-over" : ""}`}
        >
            <div className="kanban-column-header">
                <h3>
                    <span className={`status-dot ${status.toLowerCase()}`} />
                    {statusLabels[status]}
                </h3>

                <span className="task-count">{tasks.length}</span>
            </div>

            <div className="kanban-tasks">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}

                {tasks.length === 0 && (
                    <div className="kanban-empty">
                        No tasks yet
                    </div>
                )}
            </div>
        </div>
    );
}

function KanbanBoard({ tasks, onMove }) {
    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        onMove(active.id, over.id);
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="kanban-board">
                {STATUSES.map((status) => (
                    <Column
                        key={status}
                        status={status}
                        tasks={tasks.filter((task) => task.status === status)}
                    />
                ))}
            </div>
        </DndContext>
    );
}

export default KanbanBoard;
