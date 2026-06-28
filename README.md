# SkazkiOnlayn (skazkinason.ru)

Сайт детских сказок для чтения онлайн. 97 сказок, 19 категорий, 215 тегов.

## Стек

- **Next.js 16** (App Router, Turbopack)
- **Prisma ORM** + SQLite (dev) / PostgreSQL (prod)
- **Tailwind CSS 4**
- **TypeScript**
- **Node.js**

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Инициализация базы данных
npx prisma generate
npx prisma db push
npx prisma db seed

# Запуск dev-сервера
npm run dev
```

Открыть http://localhost:3000

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (http://localhost:3000) |
| `npm run build` | Продакшн-билд (требует `STATIC_EXPORT=true` в env) |
| `npm start` | Запуск продакшн-сервера |
| `npx prisma studio` | Визуальный просмотр базы данных |
| `npx prisma db seed` | Заполнение базы 97 сказками |

## Структура проекта

```
src/
├── app/
│   ├── (public)/              # Публичные страницы (SSG)
│   │   ├── categories/        # Категории (/categories, /categories/[slug])
│   │   ├── stories/           # Сказки (/stories, /stories/[slug])
│   │   ├── tags/              # Теги (/tags, /tags/[slug])
│   │   └── privacy/           # Политика конфиденциальности
│   ├── (admin)/               # CMS-панель (только локально)
│   │   ├── admin/
│   │   │   ├── page.tsx       # Дашборд
│   │   │   ├── stories/       # Управление сказками
│   │   │   ├── categories/    # Управление категориями
│   │   │   ├── tags/          # Управление тегами
│   │   │   ├── analytics/     # Аналитика + импорт
│   │   │   └── login/         # Авторизация
│   │   └── api/               # API-роуты для CMS
│   ├── page.tsx               # Главная страница
│   ├── sitemap.ts             # Генерация sitemap.xml
│   └── robots.txt             # Robots.txt
├── components/
│   ├── public/                # Публичные компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── StoryCard.tsx
│   ├── admin/                 # Компоненты CMS
│   ├── seo/                   # SEO-компоненты (JSON-LD)
│   └── ui/                    # UI-компоненты (AudioPlayer и т.д.)
├── lib/
│   ├── db.ts                  # Prisma-клиент
│   ├── auth.ts                # Аутентификация (jose JWT)
│   └── utils.ts               # Утилиты (slug, metadata и т.д.)
└── prisma/
    ├── schema.prisma          # Схема базы данных
    ├── seed.ts                # Сидер: 97 сказок, 19 категорий, 215 тегов
    └── prisma.config.ts       # Конфигурация Prisma
```

## База данных

### Модели

- **Story** — сказка (title, slug, storyText, audioUrl, coverImageUrl, status, metadata, readingTimeMinutes)
- **Category** — категория (name, slug, description)
- **Tag** — тег (name, slug, usageCount)
- **StoryCategory** — связь many-to-many сказка↔категория
- **StoryTag** — связь many-to-many сказка↔тег
- **StoryParagraph** — абзацы сказки (paragraphIndex, content, hasImage)
- **StoryImage** — изображения (imageUrl, altText, caption, paragraphIndex, sortOrder)
- **SeoMetadata** — SEO-метаданные (seoTitle, seoDescription, keywords, ogImage)

### Сидер (prisma/seed.ts)

Заполняет базу при `npx prisma db seed`:
- 19 категорий (7 авторских + 4 возрастных + 8 тематических)
- 97 сказок с полными текстами и метаданными
- 215 тегов

## Деплой на Timeweb Cloud Apps

### Важно: статический экспорт

Сайт деплоится как **статический** (`output: "export"`). Это настраивается через env-переменную:

```
STATIC_EXPORT=true
```

**В Timeweb панель → Настройки → Переменные среды** добавить:
- `STATIC_EXPORT=true`

### Настройки приложения в Timeweb

| Параметр | Значение |
|----------|----------|
| Framework | Next.js |
| Repository | kidostan/kidsite |
| Branch | main |
| Build cmd | `npm run build` |
| Index dir | `out` |
| Env vars | `STATIC_EXPORT=true`, `DATABASE_URL=file:./prod.db`, `NEXT_PUBLIC_APP_URL=https://skazkinason.ru` |

### Как деплоить

1. Редактируешь сказки локально через CMS (`npm run dev` → http://localhost:3000/admin)
2. `git add -A && git commit -m "описание" && git push origin main`
3. Timeweb автоматически деплоит (auto deploy включён)

### SSL-сертификат

Установлен через панель Timeweb → SSL. Wildcard-сертификат GlobalSign.
Действителен до: 2027-01-12.

## CMS-панель (локально)

CMS работает **только локально** через `npm run dev`. На продакшене CMS нет.

### Доступ

http://localhost:3000/admin/login

Пароль: задаётся в env `ADMIN_PASSWORD` (по умолчанию `admin123`)

### Возможности

- Создание / редактирование / удаление сказок
- Управление категориями и тегами
- Загрузка аудио и изображений
- Массовый импорт CSV/JSON
- Просмотр статистики

### Примечание

При `STATIC_EXPORT=true` API-роуты CMS помечены как `force-static` — они не работают на продакшене, только локально.

## SEO

- **Title/Description** для каждой страницы
- **Open Graph** метаданные
- **JSON-LD** (Article, BreadcrumbList)
- **Sitemap** автоматически генерируется (`/sitemap.xml`)
- **Robots.txt** — разрешён доступ ко всем страницам, кроме /admin/ и /api/
- **Canonical URLs**
- **Keywords** мета-тег

## Ключевые решения

| Решение | Причина |
|---------|---------|
| `output: "export"` через env | Dev работает как SSR, продакшен как статика |
| `force-static` на API-роутах | Нужно для `output: "export"`, работают только локально |
| `generateStaticParams` на всех динамических маршрутах | Требуется для `output: "export"` |
| SQLite для dev | Простая настройка, не требует сервера |
| StoryCategory join-таблица | Many-to-many: сказка может быть в нескольких категориях |
| `decodeURIComponent(slug)` | Кириллические slugs в URL |
| Нет счётчика просмотров | Нет серверной логики на продакшене |
| Админка локально | Проще, чем настраивать серверную авторизацию |

## Частые проблемы

### "generateStaticParams missing" в dev

Если `output: "export"` включён в `next.config.ts` без env-проверки — `next dev` ломается.
Решение: `output: process.env.STATIC_EXPORT === "true" ? "export" : undefined`

### Счётчики категорий показывают 0

Сказки привязаны через `StoryCategory`, а не через прямой `categoryId`.
Решение: `_count: { select: { storyCategories: true } }`

### Timeweb не запускает Node.js сервер

Приложение создано как "frontend" (статика), а не "SSR".
Решение: `output: "export"` + `index_dir: "out"`

## Контакты

- GitHub: https://github.com/kidostan/kidsite
- Домен: skazkinason.ru
- Email: leadokop@gmail.com
