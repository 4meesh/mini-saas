import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { TaskItem } from '../components/TaskItem'

export const Dashboard = () => {
    const { user, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState('')
    const [newPriority, setNewPriority] = useState('medium')
    const [newCategory, setNewCategory] = useState('general')
    const [loading, setLoading] = useState(false)
    const [fetchingTasks, setFetchingTasks] = useState(true)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')

    useEffect(() => {
        fetchTasks()

        // Keyboard shortcuts
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault()
                document.getElementById('new-task-input')?.focus()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault()
                document.getElementById('search-input')?.focus()
            }
            if (e.key === 'Escape') {
                setSearchQuery('')
                setFilterStatus('all')
                setFilterPriority('all')
                setFilterCategory('all')
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTasks(data || [])
        } catch (err) {
            console.error('Error fetching tasks:', err)
        } finally {
            setFetchingTasks(false)
        }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault()
        if (!newTask.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .insert([
                    {
                        content: newTask,
                        user_id: user.id,
                        completed: false,
                        priority: newPriority,
                        category: newCategory
                    }
                ])

            if (error) throw error
            setNewTask('')
            setNewPriority('medium')
            setNewCategory('general')
            await fetchTasks()
        } catch (err) {
            console.error('Error creating task:', err)
            alert('Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (err) {
            console.error('Error signing out:', err)
        }
    }

    // Export to JSON
    const exportToJSON = () => {
        const dataStr = JSON.stringify(filteredTasks, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Content', 'Priority', 'Category', 'Completed', 'Created At']
        const rows = filteredTasks.map(task => [
            `"${task.content.replace(/"/g, '""')}"`,
            task.priority,
            task.category,
            task.completed ? 'Yes' : 'No',
            new Date(task.created_at).toLocaleString()
        ])

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
        const dataBlob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    // Import from JSON
    const handleImport = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const importedTasks = JSON.parse(event.target.result)

                const tasksToInsert = importedTasks.map(task => ({
                    content: task.content,
                    user_id: user.id,
                    completed: task.completed || false,
                    priority: task.priority || 'medium',
                    category: task.category || 'general'
                }))

                const { error } = await supabase.from('tasks').insert(tasksToInsert)
                if (error) throw error

                await fetchTasks()
                alert(`Successfully imported ${tasksToInsert.length} tasks!`)
            } catch (err) {
                console.error('Error importing tasks:', err)
                alert('Failed to import tasks. Please check the file format.')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && !task.completed) ||
            (filterStatus === 'completed' && task.completed)
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        active: tasks.filter(t => !t.completed).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
        byPriority: {
            urgent: tasks.filter(t => t.priority === 'urgent' && !t.completed).length,
            high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
            medium: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
            low: tasks.filter(t => t.priority === 'low' && !t.completed).length,
        },
        byCategory: {
            work: tasks.filter(t => t.category === 'work' && !t.completed).length,
            personal: tasks.filter(t => t.category === 'personal' && !t.completed).length,
            shopping: tasks.filter(t => t.category === 'shopping' && !t.completed).length,
            health: tasks.filter(t => t.category === 'health' && !t.completed).length,
            finance: tasks.filter(t => t.category === 'finance' && !t.completed).length,
            general: tasks.filter(t => t.category === 'general' && !t.completed).length,
        }
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Task Dashboard</h1>
                        <p className="user-email">{user?.email}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary btn-sm" onClick={exportToJSON} title="Export to JSON">
                            📥 JSON
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={exportToCSV} title="Export to CSV">
                            📥 CSV
                        </button>
                        <label className="btn btn-secondary btn-sm" title="Import tasks">
                            📤 Import
                            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                        </label>
                        <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                            Sign Out
                        </button>
                        <button className="btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Statistics Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.active}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.completionRate}%</div>
                        <div className="stat-label">Completion Rate</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${stats.completionRate}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Priority & Category Breakdown */}
                <div className="breakdown-grid">
                    <div className="breakdown-card">
                        <h3>Active by Priority</h3>
                        <div className="breakdown-items">
                            {stats.byPriority.urgent > 0 && <div className="breakdown-item priority-urgent">🔥 Urgent: {stats.byPriority.urgent}</div>}
                            {stats.byPriority.high > 0 && <div className="breakdown-item priority-high">⚠️ High: {stats.byPriority.high}</div>}
                            {stats.byPriority.medium > 0 && <div className="breakdown-item priority-medium">📌 Medium: {stats.byPriority.medium}</div>}
                            {stats.byPriority.low > 0 && <div className="breakdown-item priority-low">📋 Low: {stats.byPriority.low}</div>}
                            {stats.active === 0 && <div className="empty-state"><p>No active tasks</p></div>}
                        </div>
                    </div>
                    <div className="breakdown-card">
                        <h3>Active by Category</h3>
                        <div className="breakdown-items">
                            {Object.entries(stats.byCategory).filter(([_, count]) => count > 0).map(([cat, count]) => (
                                <div key={cat} className={`breakdown-item category-${cat}`}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}: {count}
                                </div>
                            ))}
                            {stats.active === 0 && <div className="empty-state"><p>No active tasks</p></div>}
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="filters-section">
                    <input
                        id="search-input"
                        type="text"
                        placeholder="🔍 Search tasks... (Ctrl+F)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-controls">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
                            <option value="all">All Priorities</option>
                            <option value="urgent">🔥 Urgent</option>
                            <option value="high">⚠️ High</option>
                            <option value="medium">📌 Medium</option>
                            <option value="low">📋 Low</option>
                        </select>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                            <option value="all">All Categories</option>
                            <option value="work">💼 Work</option>
                            <option value="personal">👤 Personal</option>
                            <option value="shopping">🛒 Shopping</option>
                            <option value="health">❤️ Health</option>
                            <option value="finance">💰 Finance</option>
                            <option value="general">📁 General</option>
                        </select>
                        {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setFilterStatus('all')
                                    setFilterPriority('all')
                                    setFilterCategory('all')
                                }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Task Creation Form */}
                <div className="task-section">
                    <form onSubmit={handleCreateTask} className="task-form">
                        <textarea
                            id="new-task-input"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done? (Ctrl+N)"
                            disabled={loading}
                            rows={3}
                        />
                        <div className="task-form-controls">
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                disabled={loading}
                                className="priority-select"
                            >
                                <option value="low">📋 Low Priority</option>
                                <option value="medium">📌 Medium Priority</option>
                                <option value="high">⚠️ High Priority</option>
                                <option value="urgent">🔥 Urgent</option>
                            </select>
                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                disabled={loading}
                                className="category-select"
                            >
                                <option value="general">📁 General</option>
                                <option value="work">💼 Work</option>
                                <option value="personal">👤 Personal</option>
                                <option value="shopping">🛒 Shopping</option>
                                <option value="health">❤️ Health</option>
                                <option value="finance">💰 Finance</option>
                            </select>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !newTask.trim()}
                            >
                                {loading ? 'Adding...' : 'Add Task'}
                            </button>
                        </div>
                    </form>

                    {/* Task List */}
                    <div className="task-list">
                        {fetchingTasks ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading tasks...</p>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <p>{searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                                    ? 'No tasks match your filters.'
                                    : 'No tasks yet. Create your first task above!'}</p>
                            </div>
                        ) : (
                            <>
                                <div className="task-list-header">
                                    <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
                                </div>
                                {filteredTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onUpdate={fetchTasks}
                                        onDelete={fetchTasks}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Keyboard Shortcuts Help */}
                <div className="shortcuts-hint">
                    <small>💡 Shortcuts: <kbd>Ctrl+N</kbd> New Task | <kbd>Ctrl+F</kbd> Search | <kbd>Esc</kbd> Clear Filters</small>
                </div>
            </main>
        </div>
    )
}
