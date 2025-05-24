<?php
header('Content-Type: application/json');

require_once '/var/www/vhosts/6289.k-hosting.pl/assets/php/db.php';

$action = $_GET['action'] ?? '';

// Cache directory
$cacheDir = '/var/www/vhosts/6289.k-hosting.pl/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

function cacheGet($cacheFile, $cacheTime) {
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
        return file_get_contents($cacheFile);
    }
    return false;
}

function cacheSet($cacheFile, $data) {
    file_put_contents($cacheFile, $data);
}

$cacheTime = 900; // 15 minutes

if ($action === 'full_menu') {
    $cacheFile = $cacheDir . '/full_menu.json';

    $cached = cacheGet($cacheFile, $cacheTime);
    if ($cached !== false) {
        echo $cached;
        exit;
    }

    $stmt = $pdo->query('SELECT id, name FROM pages ORDER BY id');
    $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query('SELECT id, name, price, ingredients, description, weight, page_id, image1, image2, image3, image4 FROM dishes ORDER BY id');
    $dishes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $json = json_encode(['pages' => $pages, 'dishes' => $dishes]);
    cacheSet($cacheFile, $json);

    echo $json;
    exit;
}

echo json_encode(['error' => 'Unknown action']);
