# Техническое задание: AI-Ready SaaS-платформа детского контента

## Ключевые уточнения

1. **Контент вручную** — генерация через LLM опциональна, основное наполнение руками
2. **Аудио загружается вручную** — не нужен AI Pipeline для озвучки
3. **Веб-MORDA (CMS)** — полный визуальный интерфейс для управления
4. **Бесплатное продвижение** — нулевой бюджет на маркетинг

---

## 1. Рекомендуемый стек технологий

### Backend
- **Next.js 14+ (App Router)** — SSR + API Routes в одном фреймворке
- **TypeScript** — типизация на всех уровнях

### Database
- **PostgreSQL (Supabase Free)** — 500MB бесплатно
- **Prisma ORM** — типизированные запросы, миграции

### Хранилище файлов
- **Cloudflare R2** — 10GB бесплатно, без выходного трафика
- **Cloudflare CDN** — автоматический кэш

### Frontend
- **Next.js + Tailwind CSS** — SSR + утилитарный CSS
- **Framer Motion** — анимации

### CMS
- **自制 панель в Next.js** — не нужен внешний Strapi/AdminJS

### Поиск
- **pg_trgm + Full-Text Search PostgreSQL** — бесплатный полнотекстовый поиск

---

## 2. Схема базы данных

### Таблица `stories`
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  story_text TEXT NOT NULL, -- Markdown
  audio_url VARCHAR(1000), -- загружено вручную
  cover_image_url VARCHAR(1000), -- обложка
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  reading_time_minutes INTEGER, -- время чтения
  view_count INTEGER DEFAULT 0, -- аналитика
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `story_images`
```sql
CREATE TABLE story_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  paragraph_index INTEGER NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  alt_text VARCHAR(500), -- для SEO
  caption VARCHAR(500), -- подпись под картинкой
  sort_order INTEGER DEFAULT 0
);
```

### Таблица `story_paragraphs`
```sql
CREATE TABLE story_paragraphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  paragraph_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  has_image BOOLEAN DEFAULT false
);
```

### Таблица `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  metadata JSONB DEFAULT '{}'
);
```

### Таблица `tags`
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0
);
```

### Таблица `story_tags`
```sql
CREATE TABLE story_tags (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, tag_id)
);
```

### Таблица `seo_metadata`
```sql
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  seo_title VARCHAR(500),
  seo_description VARCHAR(500),
  og_image VARCHAR(1000),
  keywords TEXT[], -- массив ключевых слов
  canonical_url VARCHAR(1000),
  json_ld JSONB -- Schema.org structured data
);
```

---

## 3. Веб-MORDA (CMS)

### Структура приложения
```
Z:\KIDSITE\
├── app/
│   ├── (public)/
│   │   ├── page.tsx              — главная
│   │   ├── stories/
│   │   │   ├── page.tsx          — каталог сказок
│   │   │   └── [slug]/
│   │   │       └── page.tsx      — страница сказки
│   │   ├── categories/
│   │   │   ├── page.tsx          — все категории
│   │   │   └── [slug]/
│   │   │       └── page.tsx      — категория
│   │   ├── tags/
│   │   │   └── page.tsx          — облако тегов
│   │   └── sitemap.ts            — динамическая карта сайта
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx          — дашборд
│   │   │   ├── stories/
│   │   │   │   ├── page.tsx      — список сказок
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  — создание сказки
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx — редактирование
│   │   │   ├── categories/
│   │   │   │   └── page.tsx      — управление категориями
│   │   │   ├── tags/
│   │   │   │   └── page.tsx      — управление тегами
│   │   │   ├── import/
│   │   │   │   └── page.tsx      — массовый импорт
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx      — статистика
│   │   │   └── seo/
│   │   │       └── page.tsx      — SEO-инструменты
│   │   └── api/
│   │       ├── stories/
│   │       │   ├── route.ts      — CRUD сказок
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── upload/
│   │       │   ├── audio/
│   │       │   │   └── route.ts  — загрузка аудио
│   │       │   └── images/
│   │       │       └── route.ts  — загрузка картинок
│   │       ├── categories/
│   │       │   └── route.ts
│   │       ├── tags/
│   │       │   └── route.ts
│   │       └── import/
│   │           └── route.ts      — массовый импорт
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       — базовые компоненты
│   ├── admin/                    — компоненты CMS
│   ├── public/                   — публичные компоненты
│   └── seo/                      — SEO-компоненты
├── lib/
│   ├── db.ts                     — Prisma клиент
│   ├── storage.ts                — Cloudflare R2
│   ├── seo.ts                    — SEO-утилиты
│   └── search.ts                 — полнотекстовый поиск
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
└── package.json
```

---

## 4. Визуальный редактор сказки

### Форма создания/редактирования

```tsx
// components/admin/StoryEditor.tsx
'use client';

export function StoryEditor({ story }: { story?: Story }) {
  return (
    <form className="max-w-4xl space-y-6">
      {/* Основная информация */}
      <Section title="Основная информация">
        <Input name="title" label="Заголовок" placeholder="Сказка про..." />
        <SlugGenerator from="title" />
        <Textarea
          name="story_text"
          label="Текст сказки"
          placeholder="Markdown формат"
          rows={20}
        />
      </Section>

      {/* Мета-данные */}
      <Section title="Мета-данные">
        <div className="grid grid-cols-2 gap-4">
          <Select name="category" label="Категория" options={categories} />
          <Select name="age_min" label="Минимальный возраст" options={[3,4,5,6,7,8,9,10]} />
          <Select name="age_max" label="Максимальный возраст" options={[4,5,6,7,8,9,10,12]} />
          <Select name="difficulty" label="Сложность" options={['Легкая','Средняя','Сложная']} />
        </div>
        <TagInput name="tags" label="Теги" />
      </Section>

      {/* Аудио */}
      <Section title="Аудио">
        {story?.audio_url ? (
          <AudioPlayer src={story.audio_url} />
        ) : (
          <FileUpload
            name="audio"
            accept="audio/*"
            maxSize={50 * 1024 * 1024} // 50MB
            onUpload={handleAudioUpload}
          />
        )}
      </Section>

      {/* Картинки */}
      <Section title="Иллюстрации">
        <SortableImages
          images={story?.images || []}
          onReorder={handleReorder}
          onAdd={handleAddImage}
          onRemove={handleRemoveImage}
        />
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <Input name="seo_title" label="SEO Title" maxLength={60} />
        <Textarea name="seo_description" label="Meta Description" maxLength={160} />
        <Input name="og_image" label="OG Image URL" />
        <JsonLdEditor name="json_ld" />
      </Section>

      {/* Действия */}
      <div className="flex gap-4">
        <Button type="submit" variant="primary">
          {story ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="submit" variant="secondary" name="action" value="publish">
          Опубликовать
        </Button>
      </div>
    </form>
  );
}
```

---

## 5. Загрузка файлов

### API Endpoint для загрузки аудио

```typescript
// app/api/upload/audio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  // Валидация типа
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Валидация размера (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Загрузка в Cloudflare R2
  const blob = await put(`audio/${file.name}`, file, {
    access: 'public',
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
```

### API Endpoint для загрузки картинок

```typescript
// app/api/upload/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  const uploads = await Promise.all(
    files.map(async (file) => {
      const blob = await put(`images/${Date.now()}-${file.name}`, file, {
        access: 'public',
        contentType: file.type,
      });
      return { url: blob.url, name: file.name };
    })
  );

  return NextResponse.json({ files: uploads });
}
```

---

## 6. SEO-оптимизация (БЕСПЛАТНО)

### 6.1. Технический SEO (автоматически)

```typescript
// lib/seo.ts
import { Metadata } from 'next';

export function generateStoryMetadata(story: Story): Metadata {
  return {
    title: story.seo_metadata?.seo_title || `${story.title} | Сказки Онлайн`,
    description: story.seo_metadata?.seo_description,
    openGraph: {
      title: story.title,
      description: story.seo_metadata?.seo_description,
      images: [story.seo_metadata?.og_image || story.cover_image_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.seo_metadata?.seo_description,
    },
    alternates: {
      canonical: `https://kidsite.com/stories/${story.slug}`,
    },
  };
}
```

### 6.2. Schema.org (Structured Data)

```typescript
// components/seo/StoryJsonLd.tsx
export function StoryJsonLd({ story }: { story: Story }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.seo_metadata?.seo_description,
    image: story.cover_image_url,
    datePublished: story.created_at,
    dateModified: story.updated_at,
    author: {
      '@type': 'Organization',
      name: 'KidsSite',
    },
    publisher: {
      '@type': 'Organization',
      name: 'KidsSite',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kidsite.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://kidsite.com/stories/${story.slug}`,
    },
    articleSection: story.metadata.category,
    wordCount: story.story_text.split(/\s+/).length,
    timeRequired: `PT${story.reading_time_minutes}M`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 6.3. Динамическая карта сайта

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await prisma.story.findMany({
    where: { status: 'published' },
    select: { slug: true, updated_at: true },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const storyUrls = stories.map((story) => ({
    url: `https://kidsite.com/stories/${story.slug}`,
    lastModified: story.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `https://kidsite.com/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: 'https://kidsite.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
    ...storyUrls,
  ];
}
```

### 6.4. Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://kidsite.com/sitemap.xml',
  };
}
```

### 6.5. RSS Feed

```typescript
// app/feed.xml/route.ts
import { prisma } from '@/lib/db';

export async function GET() {
  const stories = await prisma.story.findMany({
    where: { status: 'published' },
    orderBy: { created_at: 'desc' },
    take: 50,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Сказки Онлайн</title>
    <link>https://kidsite.com</link>
    <description>Сказки для детей онлайн бесплатно</description>
    <language>ru</language>
    ${stories.map((story) => `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>https://kidsite.com/stories/${story.slug}</link>
      <pubDate>${story.created_at.toUTCString()}</pubDate>
      <description>${escapeXml(story.seo_metadata?.seo_description || '')}</description>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

---

## 7. Полнотекстовый поиск (бесплатно)

```typescript
// lib/search.ts
import { prisma } from '@/lib/db';

export async function searchStories(query: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  // PostgreSQL Full-Text Search с pg_trgm
  const stories = await prisma.$queryRaw`
    SELECT
      s.*,
      ts_rank(
        to_tsvector('russian', s.title || ' ' || s.story_text),
        plainto_tsquery('russian', ${query})
      ) as rank,
      similarity(s.title, ${query}) as title_similarity
    FROM stories s
    WHERE
      s.status = 'published' AND (
        to_tsvector('russian', s.title || ' ' || s.story_text) @@ plainto_tsquery('russian', ${query})
        OR similarity(s.title, ${query}) > 0.3
      )
    ORDER BY rank DESC, title_similarity DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const total = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM stories s
    WHERE
      s.status = 'published' AND (
        to_tsvector('russian', s.title || ' ' || s.story_text) @@ plainto_tsquery('russian', ${query})
        OR similarity(s.title, ${query}) > 0.3
      )
  `;

  return {
    stories,
    total: Number(total[0].count),
    page,
    totalPages: Math.ceil(Number(total[0].count) / limit),
  };
}
```

### Подключение pg_trgm

```sql
-- В Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Индекс для быстрого поиска
CREATE INDEX idx_stories_title_trgm ON stories USING gin (title gin_trgm_ops);
CREATE INDEX idx_stories_text_search ON stories USING gin (
  to_tsvector('russian', title || ' ' || story_text)
);
```

---

## 8. Публичный сайт (Frontend)

### Главная страница

```tsx
// app/(public)/page.tsx
import { prisma } from '@/lib/db';
import { StoryCard } from '@/components/public/StoryCard';
import { CategoryGrid } from '@/components/public/CategoryGrid';

export default async function HomePage() {
  const [featuredStories, categories, recentStories] = await Promise.all([
    prisma.story.findMany({
      where: { status: 'published' },
      orderBy: { view_count: 'desc' },
      take: 10,
      include: { images: { take: 1 } },
    }),
    prisma.category.findMany({
      include: { _count: { select: { stories: true } } },
    }),
    prisma.story.findMany({
      where: { status: 'published' },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: { images: { take: 1 } },
    }),
  ]);

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-100 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-900">
            Сказки для детей онлайн
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Читайте бесплатно thousands сказок для детей любого возраста
          </p>
        </div>
      </section>

      {/* Популярные сказки */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Популярные сказки</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Категории</h2>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Новые сказки */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Новые сказки</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Страница сказки

```tsx
// app/(public)/stories/[slug]/page.tsx
import { prisma } from '@/lib/db';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { StoryJsonLd } from '@/components/seo/StoryJsonLd';
import { generateStoryMetadata } from '@/lib/seo';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: { seo_metadata: true },
  });

  if (!story) return {};

  return generateStoryMetadata(story);
}

export default async function StoryPage({ params }: Props) {
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { paragraph_index: 'asc' } },
      paragraphs: { orderBy: { paragraph_index: 'asc' } },
      category: true,
      tags: true,
      seo_metadata: true,
    },
  });

  if (!story) {
    return notFound();
  }

  // Увеличиваем счетчик просмотров
  await prisma.story.update({
    where: { id: story.id },
    data: { view_count: { increment: 1 } },
  });

  return (
    <>
      <StoryJsonLd story={story} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{story.title}</h1>
          <div className="flex gap-4 mt-4 text-gray-600">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {story.reading_time_minutes} мин чтения
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {story.view_count} просмотров
            </span>
            <Badge>{story.metadata?.age_min}-{story.metadata?.age_max} лет</Badge>
          </div>
        </header>

        {/* Аудио плеер */}
        {story.audio_url && (
          <div className="mb-8 bg-purple-50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Слушать сказку</h3>
            <AudioPlayer src={story.audio_url} />
          </div>
        )}

        {/* Контент */}
        <div className="prose prose-lg max-w-none">
          {story.paragraphs.map((paragraph, i) => (
            <div key={paragraph.id} className="mb-6">
              <p>{paragraph.content}</p>
              {story.images[i] && (
                <figure className="my-6">
                  <img
                    src={story.images[i].image_url}
                    alt={story.images[i].alt_text || `Иллюстрация ${i + 1}`}
                    className="rounded-lg w-full"
                    loading="lazy"
                  />
                  {story.images[i].caption && (
                    <figcaption className="text-center text-gray-500 mt-2">
                      {story.images[i].caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          ))}
        </div>

        {/* Теги */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </footer>
      </article>
    </>
  );
}
```

---

## 9. Стратегия бесплатного продвижения

### 9.1. Технический SEO (0$)
- [x] Schema.org (Article, BreadcrumbList, WebSite)
- [x] Динамическая карта сайта (sitemap.xml)
- [x] Robots.txt с правильными директивами
- [x] Canonical URL для каждой страницы
- [x] OpenGraph и Twitter Card мета-теги
- [x] Адаптивная вёрстка (Mobile-First)
- [x] Скорость загрузки (Next.js SSR + CDN)

### 9.2. Контент-стратегия (0$)
- **Внутренняя перелинковка** — каждая сказка ссылается на похожие
- **Хлебные крошки** — понятная навигация для пользователей и поисковиков
- **Теги и категории** — дополнительные посадочные страницы
- **Читательное время** — показывается на каждой странице
- **Похожие сказки** — блок "Вам понравится" в конце

### 9.3. Социальные сигналы (0$)
- **Share-кнопки** — Telegram, VK, WhatsApp, Одноклассники
- **Превью при репосте** — OpenGraph мета-теги
- **RSS-лента** — для подписчиков

### 9.4. Контент-маркетинг (0$)
- **Полезные страницы** — "Как читать детям книги", "Возрастные особенности"
- **FAQ-раздел** — ответы на частые вопросы родителей
- **Словарь сказочных персонажей** — дополнительный трафик

### 9.5. Метрики и аналитика (0$)
- **Яндекс.Метрика** — бесплатная аналитика
- **Яндекс.Вебмастер** — индексация
- **Google Search Console** — индексация
- **Внутренняя статистика** — просмотры, время на сайте

### 9.6. Формула роста

```
100 сказок × 5 тегов × 10 ключевых слов = 5,000 посадочных страниц

Если каждая страница приносит 1-5 просмотров в день:
5,000 × 2.5 = 12,500 просмотров/день
12,500 × 30 = 375,000 просмотров/месяц

Без единого доллара на рекламу.
```

---

## 10. Деплой (бесплатно/дёшево)

### Вариант 1: Полностью бесплатно
- **Vercel** — Free план (100GB трафика/месяц)
- **Supabase** — Free план (500MB БД)
- **Cloudflare R2** — 10GB бесплатно
- **Итого:** 0$/месяц (до 100K просмотров)

### Вариант 2: Масштабирование
- **Vercel Pro** — 20$/месяц (1TB трафика)
- **Supabase Pro** — 25$/месяц (8GB БД)
- **Cloudflare R2** — оплата за использование
- **Итого:** ~50$/месяц (до 1M просмотров)

---

## 11. Чек-лист реализации

### Фаза 1: Ядро (1-2 дня)
- [ ] Настройка Next.js + TypeScript + Tailwind
- [ ] Prisma + PostgreSQL (Supabase)
- [ ] Базовые API Routes (CRUD сказок)
- [ ] Аутентификация для админки

### Фаза 2: CMS (2-3 дня)
- [ ] Панель администратора
- [ ] Редактор сказок (Markdown)
- [ ] Загрузка аудио и картинок
- [ ] Управление категориями и тегами

### Фаза 3: Публичный сайт (2-3 дня)
- [ ] Главная страница
- [ ] Каталог с фильтрами
- [ ] Страница сказки
- [ ] Аудио-плеер
- [ ] Поиск

### Фаза 4: SEO (1 день)
- [ ] Schema.org
- [ ] Sitemap
- [ ] Robots.txt
- [ ] OpenGraph
- [ ] RSS

### Фаза 5: Оптимизация (1 день)
- [ ] Кэширование (ISR)
- [ ] Изображения (Next/Image)
- [ ] Lighthouse 90+ score

---

## 12. API Endpoints

```
GET    /api/stories              — список сказок
POST   /api/stories              — создание сказки
GET    /api/stories/[id]         — получение сказки
PUT    /api/stories/[id]         — обновление сказки
DELETE /api/stories/[id]         — удаление сказки

POST   /api/upload/audio        — загрузка аудио
POST   /api/upload/images       — загрузка картинок

GET    /api/categories          — список категорий
POST   /api/categories          — создание категории
PUT    /api/categories/[id]     — обновление категории
DELETE /api/categories/[id]     — удаление категории

GET    /api/tags                — список тегов
POST   /api/tags                — создание тега

GET    /api/search?q=           — поиск сказок

POST   /api/import              — массовый импорт CSV/JSON
GET    /api/import/status/:id   — статус импорта
```

---

## 13. Массовый импорт

### Формат CSV
```csv
title,category,age_min,age_max,difficulty,tags,audio_file,images_dir
"Лиса и Заяц","Животные",5,7,"Легкая","дружба,лес",lisayzayec.mp3,./stories/lisayzayec/
"Волшебный лес","Приключения",4,6,"Средняя","волшебство,лес",volshelniy-les.mp3,./stories/les/
```

### Workflow
1. Загрузка CSV через CMS
2. Валидация данных
3. Создание записей в БД
4. Копирование файлов в R2
5. Генерация slug из title
6. Автоматический SEO-анализ

---

## 14. Структура Markdown для сказки

```markdown
# Заголовок сказки

Первый абзац. Здесь может быть **жирный текст** и *курсив*.

![Описание картинки](image-1.jpg)

Второй абзац после картинки.

> Цитата персонажа

Третий абзац.

---

*Сказка для детей 5-7 лет*
```

---

## 15. Package.json

```json
{
  "name": "kidsite",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "@vercel/blob": "^0.15.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.0.0",
    "papaparse": "^5.4.0",
    "zod": "^3.22.0",
    "slugify": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "prisma": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

Готово к реализации. Начинаем?