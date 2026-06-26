<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/helpers.php';

$db = db();
$q = $_GET['q'] ?? '';
$category = $_GET['category'] ?? '';
$tag = $_GET['tag'] ?? '';

$where = "s.status = 'published'";
$params = [];

if ($q) {
    $where .= " AND (s.title LIKE :q OR s.storyText LIKE :q)";
    $params[':q'] = "%$q%";
}
if ($category) {
    $where .= " AND EXISTS (SELECT 1 FROM StoryCategory sc JOIN Category c2 ON sc.categoryId = c2.id WHERE sc.storyId = s.id AND c2.slug = :cat)";
    $params[':cat'] = $category;
}
if ($tag) {
    $where .= " AND EXISTS (SELECT 1 FROM StoryTag st JOIN Tag t ON st.tagId = t.id WHERE st.storyId = s.id AND t.slug = :tag)";
    $params[':tag'] = $tag;
}

$sql = "SELECT s.id, s.title, s.slug, s.coverImageUrl, s.readingTimeMinutes, s.viewCount, s.metadata,
        c.name as category_name, c.slug as category_slug
        FROM Story s LEFT JOIN Category c ON s.categoryId = c.id
        WHERE $where ORDER BY s.createdAt DESC LIMIT 60";

$stmt = $db->prepare($sql);
foreach ($params as $k => $v) $stmt->bindValue($k, $v, SQLITE3_TEXT);
$r = $stmt->execute();
$stories = [];
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $stories[] = $row;

$allCategories = [];
$r = $db->query("SELECT c.*, (SELECT COUNT(*) FROM StoryCategory sc WHERE sc.categoryId = c.id) as story_count FROM Category c ORDER BY c.name");
while ($row = $r->fetchArray(SQLITE3_ASSOC)) $allCategories[] = $row;

$title = $q ? "Результаты поиска: \"$q\"" : "Все сказки";
header_html($title);
?>

<main class="flex-1 py-8">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold mb-6"><?= e($title) ?></h1>
        <div class="flex flex-col md:flex-row gap-8">
            <aside class="md:w-64 shrink-0">
                <h2 class="font-bold text-gray-900 mb-3">Категории</h2>
                <nav class="space-y-1">
                    <a href="/stories" class="block px-3 py-2 rounded-lg text-sm transition-colors <?= !$category ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100' ?>">
                        Все сказки
                    </a>
                    <?php foreach ($allCategories as $cat): ?>
                    <a href="/stories?category=<?= e($cat['slug']) ?>" class="block px-3 py-2 rounded-lg text-sm transition-colors <?= $category === $cat['slug'] ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100' ?>">
                        <?= e($cat['name']) ?>
                        <span class="text-gray-400 ml-1">(<?= $cat['story_count'] ?>)</span>
                    </a>
                    <?php endforeach; ?>
                </nav>
            </aside>
            <div class="flex-1">
                <?php if (empty($stories)): ?>
                    <p class="text-gray-500 text-lg">Сказки пока не добавлены.</p>
                <?php else: ?>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        <?php foreach ($stories as $s): ?>
                        <?= render_story_card($s) ?>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</main>

<?php footer_html(); ?>
