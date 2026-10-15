export const TASK_STATUSES = ['Новая', 'В процессе', 'Выполнена'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task {
  id: number | string
  title: string
  description: string
  status: TaskStatus
}

export type TaskInput = Omit<Task, 'id'>

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const TASKS_URL = `${API_URL}/tasks`

async function readError(response: Response): Promise<string> {
  const message = await response.text()
  return message || `Ошибка запроса: ${response.status} ${response.statusText}`
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(TASKS_URL)
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json() as Promise<Task[]>
}

export async function createTask(task: TaskInput): Promise<Task> {
  const response = await fetch(TASKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json() as Promise<Task>
}

export async function updateTask(id: Task['id'], task: TaskInput): Promise<Task> {
  const response = await fetch(`${TASKS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json() as Promise<Task>
}

export async function deleteTask(id: Task['id']): Promise<void> {
  const response = await fetch(`${TASKS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
}
