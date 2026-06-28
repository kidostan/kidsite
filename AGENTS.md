# Agent Instructions

## Project: skazkinason.ru

Детский сайт сказок для чтения онлайн. 53 сказки, 19 категорий, 150+ тегов.

## ⚠️ КРИТИЧЕСКИ ВАЖНО: ТОЛЬКО СТАТИЧЕСКИЙ ЭКСПОРТ

**Timeweb Cloud Apps НЕ поддерживает SSR!** 사이트必须是完全静态的。

- `npm run build` ВСЕГДА использует `STATIC_EXPORT=true` (через cross-env)
- Dev-сервер (`npm run dev`) работает без этой переменной (SSR + CMS)
- Никогда не делай `npm run start` на Timeweb — это SSR-режим!
- CMS работает **только локально** (`npm run dev`)

## Development Commands

```bash
npm run dev          # Dev-сервер на http://localhost:3000 (SSR + CMS)
npm run build        # Сборка для Timeweb (статический экспорт)
npx prisma db push   # Применить схему БД
npx prisma db seed   # Заполнить БД сказками
npx prisma studio    # Визуальный просмотр БД
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- Prisma ORM + SQLite (dev)
- Tailwind CSS 4
- TypeScript
- cross-env (для кросс-платформенных build-скриптов)

## Key Files

- `src/app/(public)/page.tsx` — главная
- `src/app/(public)/stories/[slug]/page.tsx` — страница сказки
- `src/app/(public)/categories/[slug]/page.tsx` — страница категории
- `src/app/(public)/tags/[slug]/page.tsx` — страница тега
- `src/app/(admin)/` — CMS-панель (только локально!)
- `src/app/(admin)/api/` — API-роуты CMS
- `src/middleware.ts` — блокирует /admin на продакшене
- `prisma/schema.prisma` — схема БД
- `prisma/seed.ts` — сказки
- `next.config.ts` — конфигурация Next.js
- `package.json` — build скрипт с STATIC_EXPORT=true

## Deployment

Сайт деплоится как **статический экспорт** на Timeweb Cloud Apps.

### Процесс деплоя:
1. `npm run build` (STATIC_EXPORT=true через cross-env)
2. `out/` directory содержит статические файлы
3. Timeweb раздаёт файлы из `out/`

### Timeweb ENV:
- `STATIC_EXPORT=true` — **ОБЯЗАТЕЛЬНО**
- `DATABASE_URL` — не нужен на продакшене (все данные в build)
- `ADMIN_PASSWORD` — не нужен на продакшене
- `NEXT_PUBLIC_APP_URL` — `https://skazkinason.ru`

### НЕ НУЖНО на Timeweb:
- `npm run start` — это SSR-режим, НЕ работает!
- `prisma` — не нужен на продакшене
- Серверная логика — вся в build-тайме

## Important Notes

- CMS работает **только локально** (`npm run dev`)
- На продакшене нет серверной логики — только статический HTML/CSS/JS
- `src/middleware.ts` блокирует `/admin` на продакшене (redirect на `/`)
- Категории привязаны через `StoryCategory` join-таблицу
- Кириллические slugs: используем `decodeURIComponent(slug)` для маршрутов
- `ignoreBuildErrors: true` в `next.config.ts` из-за конфликтов типов Next.js 16
- Все динамические страницы имеют `generateStaticParams()` для SSG
