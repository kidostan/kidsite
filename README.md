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

## Пошаговая инструкция: Git + Timeweb

### 1. Первичная настройка Git

```bash
# Установить Git: https://git-scm.com/download/win

# Настроить имя и email
git config --global user.name "kidostan"
git config --global user.email "leadokop@gmail.com"

# Перейти в папку проекта
cd Z:\KIDSITE

# Инициализировать репозиторий
git init
git branch -M main

# Добавить remote (если репозиторий уже создан на GitHub)
git remote add origin https://github.com/kidostan/kidsite.git
```

### 2. Первый коммит и pushes

```bash
# Добавить все файлы
git add -A

# Проверить что добавится
git status

# Коммит
git commit -m "Initial commit: 97 сказок, CMS, SEO"

# Push на GitHub
git push -u origin main
```

### 3. Создание приложения на Timeweb

1. Зайти на https://timeweb.cloud → Cloud Apps
2. Создать новое приложение
3. Выбрать **GitHub** как источник кода
4. Подключить аккаунт GitHub (если первый раз — авторизовать приложение Timeweb)
5. Выбрать репозиторий `kidostan/kidsite`
6. Выбрать ветку `main`

### 4. Настройка сборки в Timeweb

В панели приложения → **Настройки**:

| Параметр | Значение |
|----------|----------|
| Framework | Next.js |
| Build cmd | `npm run build` |
| Run cmd | *(оставить пустым)* |
| Index dir | `out` |

### 5. Переменные среды в Timeweb

В панели приложения → **Переменные среды** (Env vars):

| Переменная | Значение |
|------------|----------|
| `STATIC_EXPORT` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://skazkinason.ru` |
| `DATABASE_URL` | `file:./prod.db` |

> **Важно:** `STATIC_EXPORT=true` — обязательно! Без него Next.js попытается запустить SSR-сервер, которого Timeweb не поддерживает.

### 6. Домен

1. В панели Timeweb → **Домены**
2. Добавить `skazkinason.ru`
3. Настроить DNS у регистратора (reg.ru):
   - A-запись → IP Timeweb (узнать в панели)
   - CNAME `www` → домен приложения Timeweb
4. SSL-сертификат установить через панель Timeweb → SSL

### 7. Автодеплой

После настройки каждый `git push origin main` автоматически запускает сборку и деплой на Timeweb. Нужно только:

```bash
git add -A
git commit -m "описание изменений"
git push origin main
```

Через 2-5 минут сайт обновится на `skazkinason.ru`.

### 8. Редактирование сказок (workflow)

```
1. Запустить локально:  npm run dev
2. Открыть CMS:         http://localhost:3000/admin
3. Войти:              пароль admin123
4. Редактировать сказки / категории / теги
5. Закоммитить:         git add -A && git commit -m "описание" && git push
6. Timeweb деплоит автоматически
```

### Полезные команды Timeweb CLI

```bash
# Установить CLI (если нужно управлять через терминал)
npm install -g @timeweb-cloud/cli

# Авторизация
twc login

# Просмотр логов деплоя
twc app logs <app-id>

# Ручной деплой
twc app deploy <app-id>
```

ID приложения: `215419`

## Деплой на другой хостинг (не Timeweb)

Если захочешь перенести с Timeweb:

### Вариант A: Любой VPS (Vultr, DigitalOcean, etc.)

```bash
# 1. Подключиться к серверу
ssh root@<ip>

# 2. Установить Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 3. Клонировать репозиторий
git clone https://github.com/kidostan/kidsite.git
cd kidsite

# 4. Установить зависимости и собрать
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build

# 5. Запустить (или через PM2)
npm start
# или
pm2 start npm --name kidsite -- start
```

### Вариант B: Статический хостинг (Netlify, Vercel, GitHub Pages)

```bash
# 1. Собрать статику
npm install
npx prisma generate && npx prisma db push && npx prisma db seed
STATIC_EXPORT=true npm run build

# 2. Загрузить папку out/ на хостинг
```

Для Netlify/Vercel: подключить GitHub-репозиторий, указать build command `npm run build` и publish directory `out`.

> **Важно:** На статическом хостинге CMS не работает — сказки редактируются только через `npm run dev` локально + коммит в git.

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
