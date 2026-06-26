<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';

$db = db();

$newStories = $db->query("SELECT s.*, c.name as category_name, c.slug as category_slug FROM Story s LEFT JOIN Category c ON s.categoryId = c.id WHERE s.status = 'published' ORDER BY s.createdAt DESC LIMIT 10")->fetchArray(SQLITE3_ASSOC) ? [] : [];

// Re-run because fetchArray consumed the result
$newStories = [];
$r = $db->query("SELECT s.id, s.title, s.slug, s.coverImageUrl, s.readingTimeMinutes, s.viewCount, s.metadata, c.name as category_name, c.slug as category_slug FROM Story s LEFT JOIN Category c ON s.categoryId = c.id WHERE s.status = 'published' ORDER BY s.createdAt DESC LIMIT 10");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $newStories[] = $row;

$popularStories = [];
$r = $db->query("SELECT s.id, s.title, s.slug, s.coverImageUrl, s.readingTimeMinutes, s.viewCount, s.metadata, c.name as category_name, c.slug as category_slug FROM Story s LEFT JOIN Category c ON s.categoryId = c.id WHERE s.status = 'published' ORDER BY s.viewCount DESC LIMIT 10");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $popularStories[] = $row;

$ageCategories = [];
$r = $db->query("SELECT c.*, (SELECT COUNT(*) FROM StoryCategory sc WHERE sc.categoryId = c.id) as story_count FROM Category c WHERE c.slug IN ('do-3-let','ot-3-do-5-let','ot-5-do-8-let','ot-8-do-12-let') ORDER BY c.slug");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $ageCategories[] = $row;

$authorCategories = [];
$r = $db->query("SELECT c.*, (SELECT COUNT(*) FROM StoryCategory sc WHERE sc.categoryId = c.id) as story_count FROM Category c WHERE c.slug IN ('народные-сказки','сказки-ас-пушкина','сказки-ки-чуковского','сказки-хк-андерсена','сказки-братьев-гримм','сказки-шарля-перро','авторские-сказки')");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $authorCategories[] = $row;

header_html();
?>

<main class="flex-1">
    <section class="bg-gradient-to-b from-purple-100 to-white py-16 md:py-24">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-purple-900">Сказки для детей онлайн</h1>
            <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Читайте бесплатно сказки для детей любого возраста.
                Народные, авторские, волшебные — <?= $db->querySingle("SELECT COUNT(*) FROM Story WHERE status='published'") ?> сказок.
            </p>
            <div class="mt-8 flex gap-4 justify-center">
                <a href="/stories" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">Читать сказки</a>
                <a href="/categories" class="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full font-semibold transition-colors">Категории</a>
            </div>
        </div>
    </section>

    <section class="py-12">
        <div class="container mx-auto px-4">
            <h2 class="text-2xl font-bold mb-6">Сказки по возрасту</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <?php foreach ($ageCategories as $cat): ?>
                <a href="/categories/<?= e($cat['slug']) ?>" class="block p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pinkey-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-center">
                    <div class="text-4xl mb-3">
                        <?= $cat['slug'] === 'do-3-let' ? '👶' : ($cat['slug'] === 'ot-3-do-5-let' ? '🧒' : ($cat['slug'] === 'ot-5-do-8-let' ? '📚' : '🎓')) ?>
                    </div>
                    <h3 class="font-bold text-gray-900"><?= e($cat['name']) ?></h3>
                    <p class="text-sm text-gray-500 mt-1"><?= $cat['story_count'] ?> сказок</p>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="py-12 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-2xl font-bold mb-6">Сказки по авторам</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <?php foreach ($authorCategories as $cat): ?>
                <a href="/categories/<?= e($cat['slug']) ?>" class="block p-4 rounded-xl bg-white hover:bg-purple-50 transition-colors text-center border border-gray-100">
                    <h3 class="font-semibold text-gray-900 text-sm"><?= e($cat['name']) ?></h3>
                    <p class="text-xs text-gray-500 mt-1"><?= $cat['story_count'] ?> сказок</p>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <?php if ($newStories): ?>
    <section class="py-12">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">Новые сказки</h2>
                <a href="/stories" class="text-purple-600 hover:text-purple-700 text-sm font-medium">Все сказки →</a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                <?php foreach ($newStories as $s): ?>
                <?= render_story_card($s) ?>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <?php if ($popularStories): ?>
    <section class="py-12 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-2xl font-bold mb-6">Популярные сказки</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                <?php foreach ($popularStories as $s): ?>
                <?= render_story_card($s) ?>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <section class="py-12">
        <div class="container mx-auto px-4 max-w-3xl">
            <h2 class="text-2xl font-bold mb-4">Сказки для детей читать онлайн</h2>
            <div class="prose prose-gray max-w-none text-gray-600 space-y-4">
                <p>Добро пожаловать на сайт сказок для детей! Здесь вы найдёте любимые сказки для чтения вслух: русские народные, сказки Пушкина, Чуковского, Андерсена, братьев Гримм и других авторов.</p>
                <p>Все сказки разделены по возрасту и тематике. Для самых маленьких — короткие и простые сказки. Для детей постарше — более длинные и сложные истории.</p>
                <p>Читайте сказки детям перед сном, во время прогулки или в дороге.</p>
            </div>
        </div>
    </section>
</main>

<?php footer_html(); ?>
