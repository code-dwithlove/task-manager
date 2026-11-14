import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function TaskCard({ task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: task.id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
             className="kanban-card">
            <strong>{task.title}</strong>
            <div className="kanban-meta">
                <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                {task.dueDate && <small> due {task.dueDate}</small>}
            </div>
            {task.assigneeName && <small>👤 {task.assigneeName}</small>}
        </div>
    );
}

function Column({ status, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div ref={setNodeRef} className="kanban-column"
             style={{ background: isOver ? "#e6f4ea" : "#f4f5f7" }}>
            <h3>{status.replace("_", " ")} ({tasks.length})</h3>
            {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
    );
}

function KanbanBoard({ tasks, onMove }) {
    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;                 // dropped outside every column
        onMove(active.id, over.id);        // task id, new status
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="kanban-board">
                {STATUSES.map((s) => (
                    <Column key={s} status={s} tasks={tasks.filter((t) => t.status === s)} />
                ))}
            </div>
        </DndContext>
    );
}

export default KanbanBoard;