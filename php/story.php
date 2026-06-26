<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();
$slug = $_GET['slug'] ?? '';

$stmt = $db->prepare("SELECT s.*, c.name as category_name, c.slug as category_slug FROM Story s LEFT JOIN Category c ON s.categoryId = c.id WHERE s.slug = :slug AND s.status = 'published'");
$stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
$story = $stmt->execute()->fetchArray(SQLITE3_ASSOC);

if (!$story) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404</title></head><body><h1>Сказка не найдена</h1><a href="/stories">Вернуться к списку</a></body></html>';
    exit;
}

// Increment view count
$db->exec("UPDATE Story SET viewCount = viewCount + 1 WHERE id = '{$story['id']}'");
$story['viewCount']++;

$meta = json_decode($story['metadata'] ?? '{}', true);
$seo = [];
$r = $db->query("SELECT * FROM SeoMetadata WHERE storyId = '{$story['id']}'");
$seo = $r->fetchArray(SQLITE3_ASSOC) ?: [];

$paragraphs = array_filter(explode("\n\n", $story['storyText']), fn($p) => trim($p));

// Tags
$tags = [];
$r = $db->query("SELECT t.name, t.slug FROM StoryTag st JOIN Tag t ON st.tagId = t.id WHERE st.storyId = '{$story['id']}'");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $tags[] = $row;

// Similar stories
$catIds = [];
$r = $db->query("SELECT categoryId FROM StoryCategory WHERE storyId = '{$story['id']}'");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $catIds[] = $row['categoryId'];
$similar = [];
if ($catIds) {
    $ids = implode(',', array_map(fn($id) => "'$id'", $catIds));
    $r = $db->query("SELECT DISTINCT s.id, s.title, s.slug, s.coverImageUrl, c.name as category_name
        FROM StoryCategory sc
        JOIN Story s ON sc.storyId = s.id
        LEFT JOIN Category c ON s.categoryId = c.id
        WHERE sc.categoryId IN ($ids) AND s.id != '{$story['id']}' AND s.status = 'published'
        LIMIT 5");
    while ($row = $r->fetchArray(SQLITE3_ASSOC)) $similar[] = $row;
}

$seoTitle = $seo['seoTitle'] ?? ($story['title'] . ' | ' . SITE_NAME);
$seoDesc = $seo['seoDescription'] ?? 'Сказка "' . $story['title'] . '" для детей';
$keywords = $seo['keywords'] ?? '';

// JSON-LD
$jsonLd = [
    '@context' => 'https://schema.org',
    '@type' => 'Article',
    'headline' => $story['title'],
    'description' => $seoDesc,
    'datePublished' => $story['createdAt'],
    'dateModified' => $story['updatedAt'],
    'author' => ['@type' => 'Organization', 'name' => SITE_NAME],
];

$breadcrumbItems = [['name' => 'Главная', 'url' => '/'], ['name' => 'Сказки', 'url' => '/stories']];
if ($story['category_name']) {
    $breadcrumbItems[] = ['name' => $story['category_name'], 'url' => '/categories/' . $story['category_slug']];
}
$breadcrumbItems[] = ['name' => $story['title'], 'url' => '/stories/' . $story['slug']];

$breadcrumbLd = [
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [],
];
foreach ($breadcrumbItems as $i => $item) {
    $breadcrumbLd['itemListElement'][] = [
        '@type' => 'ListItem',
        'position' => $i + 1,
        'name' => $item['name'],
        'item' => APP_URL . $item['url'],
    ];
}

header_html($seoTitle, $seoDesc);
?>

<script type="application/ld+json"><?= json_encode($jsonLd, JSON_UNESCAPED_UNICODE) ?></script>
<script type="application/ld+json"><?= json_encode($breadcrumbLd, JSON_UNESCAPED_UNICODE) ?></script>

<article class="max-w-4xl mx-auto px-4 py-8">
    <?= render_breadcrumbs($breadcrumbItems) ?>

    <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900"><?= e($story['title']) ?></h1>
        <div class="flex gap-4 mt-4 text-gray-600 flex-wrap">
            <?php if ($story['readingTimeMinutes']): ?>
            <span class="flex items-center gap-1">🕐 <?= intval($story['readingTimeMinutes']) ?> мин чтения</span>
            <?php endif; ?>
            <span class="flex items-center gap-1">👁 <?= $story['viewCount'] ?> просмотров</span>
            <?php if (!empty($meta['age_min']) && !empty($meta['age_max'])): ?>
            <span class="bg-purple-100 text-purple-700 px-3 py-0.5 rounded-full text-sm"><?= intval($meta['age_min']) ?>–<?= intval($meta['age_max']) ?> лет</span>
            <?php endif; ?>
            <?php if (!empty($meta['difficulty'])): ?>
            <span class="bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full text-sm"><?= e($meta['difficulty']) ?></span>
            <?php endif; ?>
        </div>
    </header>

    <div class="prose prose-lg max-w-none">
        <?php foreach ($paragraphs as $i => $p): ?>
        <div class="mb-6">
            <p class="whitespace-pre-line"><?= e(trim($p)) ?></p>
        </div>
        <?php endforeach; ?>
    </div>

    <?php if ($tags): ?>
    <div class="mt-8 pt-6 border-t">
        <h2 class="text-lg font-bold mb-3">Теги</h2>
        <div class="flex flex-wrap gap-2">
            <?php foreach ($tags as $t): ?>
            <a href="/tags/<?= e($t['slug']) ?>" class="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm transition-colors"><?= e($t['name']) ?></a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($similar): ?>
    <div class="mt-12 pt-8 border-t">
        <h2 class="text-2xl font-bold mb-6">Похожие сказки</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <?php foreach ($similar as $s): ?>
            <a href="/stories/<?= e($s['slug']) ?>" class="group block">
                <div class="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    <?php if ($s['coverImageUrl']): ?>
                    <img src="<?= e($s['coverImageUrl']) ?>" alt="<?= e($s['title']) ?>" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy">
                    <?php else: ?>
                    <div class="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"><span class="text-4xl">📖</span></div>
                    <?php endif; ?>
                </div>
                <h3 class="mt-2 font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors"><?= e($s['title']) ?></h3>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>
</article>

<?php footer_html(); ?>
