import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  createTask,
  deleteTask,
  getTasks,
  TASK_STATUSES,
  Task,
  TaskInput,
  TaskStatus,
  updateTask,
} from './tasksApi'

const EMPTY_TASK: TaskInput = {
  title: '',
  description: '',
  status: 'Новая',
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState<TaskInput>(EMPTY_TASK)
  const [editingId, setEditingId] = useState<Task['id'] | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'Все'>('Все')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTasks() {
      try {
        setError('')
        setTasks(await getTasks())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить задачи')
      } finally {
        setLoading(false)
      }
    }

    void loadTasks()
  }, [])

  const visibleTasks = useMemo(
    () => (statusFilter === 'Все' ? tasks : tasks.filter((task) => task.status === statusFilter)),
    [statusFilter, tasks],
  )

  function resetForm() {
    setForm(EMPTY_TASK)
    setEditingId(null)
  }

  function startEditing(task: Task) {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId === null) {
        const createdTask = await createTask(form)
        setTasks((currentTasks) => [createdTask, ...currentTasks])
      } else {
        const updatedTask = await updateTask(editingId, form)
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === editingId ? updatedTask : task)),
        )
      }
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить задачу')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) {
      return
    }

    setError('')
    setSaving(true)
    try {
      await deleteTask(task.id)
      setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id))
      if (editingId === task.id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить задачу')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="header-copy">
          <span className="eyebrow">ПЛАНИРУЙ · ДЕЙСТВУЙ · ЗАВЕРШАЙ</span>
          <h1>Менеджер задач</h1>
          <p>Все важные дела — в одном месте.</p>
        </div>
        <div className="task-total" aria-label={`Всего задач: ${tasks.length}`}>
          <span>{tasks.length}</span>
          <small>{tasks.length === 1 ? 'задача' : 'задач'}</small>
        </div>
      </header>

      <section className="workspace">
        <aside className="editor-card">
          <div className="section-heading">
            <span className="heading-icon">{editingId === null ? '+' : '↻'}</span>
            <div>
              <h2>{editingId === null ? 'Новая задача' : 'Редактирование'}</h2>
              <p>{editingId === null ? 'Запишите, что нужно сделать' : 'Измените детали задачи'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="task-title">Название</label>
            <input
              id="task-title"
              type="text"
              placeholder="Например, подготовить отчёт"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              maxLength={120}
            />

            <label htmlFor="task-description">Описание</label>
            <textarea
              id="task-description"
              placeholder="Добавьте подробности..."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
            />

            <label htmlFor="task-status">Статус</label>
            <select
              id="task-status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Сохранение…' : editingId === null ? 'Добавить задачу' : 'Сохранить изменения'}
              </button>
              {editingId !== null && (
                <button className="text-button" type="button" onClick={resetForm} disabled={saving}>
                  Отмена
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="list-toolbar">
            <div>
              <h2 id="tasks-heading">Мои задачи</h2>
              <p className="list-caption">Список дел и их текущий статус</p>
            </div>
            <label className="filter-control">
              <span>Статус</span>
              <select
                aria-label="Фильтр по статусу"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'Все')}
              >
                <option value="Все">Все задачи</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
              <button type="button" aria-label="Закрыть сообщение" onClick={() => setError('')}>
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="message-card" role="status">
              <span className="loader" />
              <p>Загружаем задачи…</p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="message-card empty-state">
              <span className="empty-icon">{tasks.length === 0 ? '✦' : '⌕'}</span>
              <h3>{tasks.length === 0 ? 'Пока нет задач' : 'Задачи не найдены'}</h3>
              <p>
                {tasks.length === 0
                  ? 'Добавьте первую задачу — и ваш план на день готов.'
                  : 'Попробуйте выбрать другой статус.'}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className="task-card" key={task.id}>
                  <div className="task-content">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        <span className="status-dot" />
                        {task.status}
                      </span>
                    </div>
                    <p className={task.description ? '' : 'muted-description'}>
                      {task.description || 'Описание не добавлено'}
                    </p>
                  </div>
                  <div className="task-actions">
                    <button
                      className="icon-button edit-button"
                      type="button"
                      onClick={() => startEditing(task)}
                      disabled={saving}
                      aria-label={`Редактировать задачу: ${task.title}`}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-button delete-button"
                      type="button"
                      onClick={() => void handleDelete(task)}
                      disabled={saving}
                      aria-label={`Удалить задачу: ${task.title}`}
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && tasks.length > 0 && (
            <p className="result-count">
              Показано {visibleTasks.length} из {tasks.length}
            </p>
          )}
        </section>
      </section>
      <footer>Небольшие шаги каждый день приводят к большим результатам.</footer>
    </main>
  )
}

function getStatusClass(status: TaskStatus): string {
  switch (status) {
    case 'Новая':
      return 'status-new'
    case 'В процессе':
      return 'status-progress'
    case 'Выполнена':
      return 'status-done'
  }
}

export default App
