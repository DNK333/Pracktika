# Менеджер задач

React + TypeScript приложение для просмотра и управления задачами.

## Запуск

```bash
npm install
npm run dev
```

Приложение ожидает REST API с маршрутами `GET /tasks`, `POST /tasks`,
`PUT /tasks/:id` и `DELETE /tasks/:id`. По умолчанию запросы идут на текущий
origin. Чтобы указать отдельный адрес сервера, создайте `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Формат задачи: `{ "id": 1, "title": "Название", "description": "Описание", "status": "Новая" }`.

## ИИ

ИИ исправил код и т.д.