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

    // Убираем дубликаты блюд по 'id'
    $uniqueDishes = [];
    $seenIds = [];
    foreach ($dishes as $dish) {
        if (!in_array($dish['id'], $seenIds)) {
            $seenIds[] = $dish['id'];
            $uniqueDishes[] = $dish;
        }
    }
    $dishes = $uniqueDishes;

    $json = json_encode(['pages' => $pages, 'dishes' => $dishes]);
    cacheSet($cacheFile, $json);

    echo $json;
    exit;
}

if ($action === 'get_sets') {
    $stmt = $pdo->query("SELECT * FROM sets");
    $sets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($sets as &$row) {
        $set_id = $row['id'];

        // 1. Dishes
        $stmtDishes = $pdo->prepare("
            SELECT d.id, d.name
            FROM set_dishes sd
            JOIN dishes d ON sd.dish_id = d.id
            WHERE sd.set_id = ?
        ");
        $stmtDishes->execute([$set_id]);
        $row['dishes'] = $stmtDishes->fetchAll(PDO::FETCH_ASSOC);

        // 2. Backery (через таблицу set_backery)
        $stmtBackery = $pdo->prepare("
            SELECT b.id, b.name
            FROM set_backery sb
            JOIN backery b ON sb.backery_id = b.id
            WHERE sb.set_id = ?
        ");
        $stmtBackery->execute([$set_id]);
        $row['backery'] = $stmtBackery->fetchAll(PDO::FETCH_ASSOC);

        // 3. Text ingredients (через таблицу set_ingredients)
        $stmtText = $pdo->prepare("
            SELECT ingredient_text 
            FROM set_ingredients 
            WHERE set_id = ?
        ");
        $stmtText->execute([$set_id]);
        $textIngredients = $stmtText->fetchAll(PDO::FETCH_COLUMN);
        $row['ingredient_text'] = $textIngredients;
    }

    header('Content-Type: application/json');
    echo json_encode(['sets' => $sets]);
    exit;
}

if ($action === 'get_bakery') {
    $stmt = $pdo->prepare("SELECT 
        id, name, weight, price, ingredients, description, image1, image2, image3, image4 
        FROM backery ORDER BY id");

    if ($stmt->execute()) {
        $bakeryItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode([
            'bakery' => $bakeryItems
        ]);
        exit;
    } else {
        // Error handling
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Ошибка получения данных из таблицы backery']);
        exit;
    }
}

if ($action === 'get_daily') {
    $cacheFile = $cacheDir . '/daily.json';

    $cached = cacheGet($cacheFile, $cacheTime);
    if ($cached !== false) {
        echo $cached;
        exit;
    }

    $daily = [];

    // Получаем блюда
    $stmt = $pdo->query("
        SELECT d.id, d.name, d.description, d.price, d.image1
        FROM daily da
        JOIN dishes d ON da.dish_id = d.id
        WHERE da.dish_id IS NOT NULL
    ");
    $dishes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($dishes as $dish) {
        $dish['dish_id'] = $dish['id'];
        $dish['set_id'] = null;
        $daily[] = $dish;
    }

    // Получаем сеты
    $stmt = $pdo->query("
        SELECT s.id, s.name, s.description, s.price, s.image1
        FROM daily da
        JOIN sets s ON da.set_id = s.id
        WHERE da.set_id IS NOT NULL
    ");
    $sets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sets as $set) {
        $set['dish_id'] = null;
        $set['set_id'] = $set['id'];
        $daily[] = $set;
    }

    $json = json_encode(['daily' => $daily]);
    cacheSet($cacheFile, $json);

    echo $json;
    exit;
}


echo json_encode(['error' => 'Unknown action']);
