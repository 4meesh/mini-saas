import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const TaskItem = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(task.content)
    const [editedPriority, setEditedPriority] = useState(task.priority || 'medium')
    const [editedCategory, setEditedCategory] = useState(task.category || 'general')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!editedContent.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    content: editedContent,
                    priority: editedPriority,
                    category: editedCategory
                })
                .eq('id', task.id)

            if (error) throw error
            onUpdate()
            setIsEditing(false)
        } catch (err) {
            console.error('Error updating task:', err)
            alert('Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleComplete = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: !task.completed })
                .eq('id', task.id)

            if (error) throw error
            onUpdate()
        } catch (err) {
            console.error('Error toggling task:', err)
            alert('Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task.id)

            if (error) throw error
            onDelete()
        } catch (err) {
            console.error('Error deleting task:', err)
            alert('Failed to delete task')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent': return '🔥'
            case 'high': return '⚠️'
            case 'medium': return '📌'
            case 'low': return '📋'
            default: return '📌'
        }
    }

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'work': return '💼'
            case 'personal': return '👤'
            case 'shopping': return '🛒'
            case 'health': return '❤️'
            case 'finance': return '💰'
            case 'general': return '📁'
            default: return '📁'
        }
    }

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'medium'}`}>
            <div className="task-checkbox">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleToggleComplete}
                    disabled={loading}
                    id={`task-${task.id}`}
                />
                <label htmlFor={`task-${task.id}`}></label>
            </div>

            <div className="task-content">
                {isEditing ? (
                    <div className="task-edit">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                        <div className="task-edit-controls">
                            <select
                                value={editedPriority}
                                onChange={(e) => setEditedPriority(e.target.value)}
                                disabled={loading}
                                className="priority-select-small"
                            >
                                <option value="low">📋 Low</option>
                                <option value="medium">📌 Medium</option>
                                <option value="high">⚠️ High</option>
                                <option value="urgent">🔥 Urgent</option>
                            </select>
                            <select
                                value={editedCategory}
                                onChange={(e) => setEditedCategory(e.target.value)}
                                disabled={loading}
                                className="category-select-small"
                            >
                                <option value="general">📁 General</option>
                                <option value="work">💼 Work</option>
                                <option value="personal">👤 Personal</option>
                                <option value="shopping">🛒 Shopping</option>
                                <option value="health">❤️ Health</option>
                                <option value="finance">💰 Finance</option>
                            </select>
                        </div>
                        <div className="task-edit-actions">
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={handleSave}
                                disabled={loading || !editedContent.trim()}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    setEditedContent(task.content)
                                    setEditedPriority(task.priority || 'medium')
                                    setEditedCategory(task.category || 'general')
                                    setIsEditing(false)
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="task-header">
                            <p className="task-text">{task.content}</p>
                            <div className="task-badges">
                                <span className={`badge badge-priority priority-${task.priority || 'medium'}`}>
                                    {getPriorityIcon(task.priority)} {(task.priority || 'medium').toUpperCase()}
                                </span>
                                <span className={`badge badge-category category-${task.category || 'general'}`}>
                                    {getCategoryIcon(task.category)} {(task.category || 'general').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <span className="task-date">{formatDate(task.created_at)}</span>
                    </>
                )}
            </div>

            {!isEditing && (
                <div className="task-actions">
                    <button
                        className="btn-icon"
                        onClick={() => setIsEditing(true)}
                        disabled={loading}
                        title="Edit task"
                    >
                        ✏️
                    </button>
                    <button
                        className="btn-icon"
                        onClick={handleDelete}
                        disabled={loading}
                        title="Delete task"
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    )
}
