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
    $query = "SELECT * FROM sets";
    $result = $conn->query($query);

    $sets = [];

    // id and name of the dish
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $set_id = $row['id'];

            $dishes_query = "
                SELECT d.id, d.name
                FROM set_dishes sd
                JOIN dishes d ON sd.dish_id = d.id
                WHERE sd.set_id = $set_id
            ";

            $dishes_result = $conn->query($dishes_query);
            $dishes = [];

            if ($dishes_result && $dishes_result->num_rows > 0) {
                while ($dish_row = $dishes_result->fetch_assoc()) {
                    $dishes[] = $dish_row;
                }
            }

            // Add dishes to the set row
            $row['dishes'] = $dishes;
            $sets[] = $row;
        }
    }

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

}

echo json_encode(['error' => 'Unknown action']);
