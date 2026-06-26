<?php
require_once __DIR__ . '/db.php';

function render_story_card(array $s): string {
    $meta = json_decode($s['metadata'] ?? '{}', true);
    $age_min = $meta['age_min'] ?? null;
    $age_max = $meta['age_max'] ?? null;
    $cover = $s['coverImageUrl'] ?? null;

    $ageBadge = '';
    if ($age_min && $age_max) {
        $ageBadge = '<span class="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">' . intval($age_min) . '–' . intval($age_max) . ' лет</span>';
    }
    $timeBadge = '';
    if (!empty($s['readingTimeMinutes'])) {
        $timeBadge = '<span class="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">' . intval($s['readingTimeMinutes']) . ' мин</span>';
    }
    $catBadge = '';
    if (!empty($s['category_name'])) {
        $catBadge = '<span class="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">' . e($s['category_name']) . '</span>';
    }

    $coverHtml = $cover
        ? '<img src="' . e($cover) . '" alt="' . e($s['title']) . '" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy">'
        : '<div class="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"><span class="text-6xl">📖</span></div>';

    return <<<HTML
    <a href="/stories/{$s['slug']}" class="group block">
        <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
            {$coverHtml}
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 class="text-white font-bold text-lg line-clamp-2">{$s['title']}</h3>
                <div class="flex gap-2 mt-2 flex-wrap">{$ageBadge}{$timeBadge}{$catBadge}</div>
            </div>
        </div>
        <h3 class="mt-2 font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">{$s['title']}</h3>
    </a>
HTML;
}

function render_breadcrumbs(array $items): string {
    $html = '<nav class="text-sm text-gray-500 mb-6"><ol class="flex flex-wrap items-center gap-1">';
    foreach ($items as $i => $item) {
        if ($i > 0) $html .= '<li><span class="mx-2">/</span></li>';
        if (isset($item['url'])) {
            $html .= '<li><a href="' . e($item['url']) . '" class="hover:text-purple-600">' . e($item['name']) . '</a></li>';
        } else {
            $html .= '<li class="text-gray-900">' . e($item['name']) . '</li>';
        }
    }
    $html .= '</ol></nav>';
    return $html;
}
