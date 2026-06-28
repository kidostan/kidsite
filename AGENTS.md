# Agent Instructions

## Project: skazkinason.ru

Детский сайт сказок для чтения онлайн. 97 сказок, 19 категорий, 215 тегов.

## Development Commands

```bash
npm run dev          # Dev-сервер на http://localhost:3000
npx prisma db push   # Применить схему БД
npx prisma db seed   # Заполнить БД сказками
npx prisma studio    # Визуальный просмотр БД
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Prisma ORM + SQLite (dev)
- Tailwind CSS 4
- TypeScript
- Node.js

## Key Files

- `src/app/page.tsx` — главная
- `src/app/(public)/stories/[slug]/page.tsx` — страница сказки
- `src/app/(public)/categories/[slug]/page.tsx` — страница категории
- `src/app/(public)/tags/[slug]/page.tsx` — страница тега
- `src/app/(admin)/` — CMS-панель (только локально)
- `src/app/(admin)/api/` — API-роуты CMS
- `prisma/schema.prisma` — схема БД
- `prisma/seed.ts` — 97 сказок
- `next.config.ts` — конфигурация Next.js

## Deployment

Сайт деплоится как **статический экспорт** (`output: "export"`) на Timeweb Cloud Apps.
Env-переменная `STATIC_EXPORT=true` включает статический экспорт только в Timeweb.
Dev-сервер работает без этой переменной (полный SSR + CMS).

Деплой: коммит в `main` → Timeweb автоматически деплоит.

## Important Notes

- CMS работает **только локально** (`npm run dev`)
- На продакшене нет серверной логики — только статический HTML/CSS/JS
- API-роуты CMS помечены `force-static` — не работают на продакшене
- Категории привязаны через `StoryCategory` join-таблицу, а не через прямой `categoryId`
- Счётчики просмотров удалены (нет серверной логики)
- Кириллические slugs: используем `decodeURIComponent(slug)` для маршрутов
- `ignoreBuildErrors: true` в `next.config.ts` из-за конфликтов типов Next.js 16
