<?php
header('Content-Type: application/json');

require_once '/var/www/vhosts/6289.k-hosting.pl/assets/php/db.php';
$config = require '/var/www/vhosts/6289.k-hosting.pl/assets/php/sms_config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$debug = [];

$input = file_get_contents('php://input');
$debug[] = "Input JSON: " . $input;

$data = json_decode($input, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Brak danych', 'debug' => $debug]);
    exit;
}
$debug[] = "JSON распарсен успешно";

$items_list = array_map(function ($item) {
    return "{$item['name']} x{$item['quantity']} ({$item['total']}zł)";
}, $data['items']);
$items_string = implode(", ", $items_list);
$debug[] = "Форматируем товары: " . $items_string;

$stmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, delivery_details, delivery_time, special_requests, payment_method, total_amount, order_date, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$success = $stmt->execute([
    $data['order_id'],
    $data['customer_name'],
    $data['customer_phone'],
    $data['delivery_address'],
    $data['delivery_details'],
    $data['delivery_time'],
    $data['special_requests'],
    $data['payment_method'],
    $data['total_amount'],
    $data['order_date'],
    $data['status'],
    $items_string
]);

if (!$success) {
    $errorInfo = $stmt->errorInfo();
    http_response_code(500);
    echo json_encode(['error' => 'Błąd podczas zapisywania zamówienia', 'db_error' => $errorInfo, 'debug' => $debug]);
    exit;
}
$debug[] = "Заказ сохранён в БД";

$message = "🍕 NOWE ZAMÓWIENIE #" . $data['order_id'] . "\n";
$message .= "Klient: " . $data['customer_name'] . "\n";
$message .= "Telefon: " . $data['customer_phone'] . "\n";
$message .= "Adres: " . $data['delivery_address'] . "\n";
$message .= "Zamówienie:\n";

foreach ($data['items'] as $item) {
    $message .= "• {$item['name']} x{$item['quantity']} - {$item['total']}zł\n";
}
$message .= "Razem: " . $data['total_amount'] . "zł";
$debug[] = "Сообщение SMS сформировано";

// Отправка через Twilio
$twilioSid = $config['twilioSid'];
$twilioToken = $config['twilioToken'];
$twilioFrom = $config['twilioFrom'];
$managerPhone = $config['managerPhone'];

$url = "https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'To' => $managerPhone,
    'From' => $twilioFrom,
    'Body' => $message
]));
curl_setopt($ch, CURLOPT_USERPWD, "$twilioSid:$twilioToken");

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$debug[] = "Ответ Twilio API: HTTP код = $httpCode, ответ = $response";

$responseData = json_decode($response, true);
if ($httpCode !== 201 || isset($responseData['error_code'])) {
    $errorMsg = $responseData['message'] ?? 'Неизвестная ошибка';
    http_response_code(500);
    echo json_encode(['error' => "Ошибка Twilio API: $errorMsg", 'debug' => $debug]);
    exit;
}

echo json_encode(['success' => true, 'debug' => $debug]);
