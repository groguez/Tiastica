<?php
/**
 * GEMA — GM Expert Machine Assistant
 * AI Light basada en Claude API para ERP Transport TIASTICA
 * Archivo: chat.php — Endpoint principal del chatbot
 * 
 * Uso: POST /ai-light/chat.php
 * Body JSON: { "message": "...", "history": [...] }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once 'config.php';
require_once 'knowledge.php';

$input = json_decode(file_get_contents('php://input'), true);
$userMessage = trim($input['message'] ?? '');
$history = $input['history'] ?? [];

if (empty($userMessage)) {
    echo json_encode(['error' => 'Mensaje vacío']);
    exit;
}

// ======== SYSTEM PROMPT ========
$systemPrompt = "Eres GEMA (GM Expert Machine Assistant), el asistente virtual inteligente de TIASTICA para la solución ERP Transport (GM Transport Software®).

PERSONALIDAD:
- Tono profesional pero cercano, como un experto en transporte y tecnología
- Respuestas claras, concisas y útiles. Máximo 4 párrafos.
- Idioma: Español (México) por defecto. Cambia a inglés si el usuario escribe en inglés.
- Usa emojis ocasionalmente para hacer las respuestas más visuales (🚛 📡 🧾 etc.)
- Siempre ofrece el siguiente paso al final de tu respuesta

REGLAS IMPORTANTES:
1. NUNCA inventes precios específicos — siempre di 'para una cotización personalizada, un asesor puede ayudarte'
2. Si el usuario quiere demo, cotización o contacto → recopila: empresa, número de unidades, país, WhatsApp/email
3. Cuando detectes intención de compra → activa el flujo de calificación
4. Limita las respuestas a información del sistema GM Transport / TIASTICA
5. Evita hablar de competidores
6. Si no sabes algo específico → deriva al asesor humano con contacto: 55 1947 5252 o ventas@gmtransporterp.com

CONTACTO DE LA EMPRESA:
- Web: www.tiastica.com | www.rastreosatelital.com
- Tel: 55 1947 5252
- Email: ventas@gmtransporterp.com
- WhatsApp: https://wa.link/5fwr4k
- Redes: @tiasticamx | TiasticaTecnologia | linkedin.com/company/tiastica
- Presencia: México 🇲🇽 · Estados Unidos 🇺🇸 · Perú 🇵🇪

BASE DE CONOCIMIENTO COMPLETA:
" . getKnowledgeBase();

// ======== BUILD MESSAGES ARRAY ========
$messages = [];
foreach ($history as $h) {
    if (isset($h['role']) && isset($h['content'])) {
        $messages[] = ['role' => $h['role'], 'content' => $h['content']];
    }
}
$messages[] = ['role' => 'user', 'content' => $userMessage];

// ======== CALL CLAUDE API ========
$payload = [
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 1000,
    'system' => $systemPrompt,
    'messages' => $messages
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01'
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo json_encode(['error' => 'Error de conexión: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data['content'][0]['text'])) {
    echo json_encode([
        'error' => 'Error al procesar la respuesta',
        'status' => $httpCode
    ]);
    exit;
}

$assistantMessage = $data['content'][0]['text'];

// ======== DETECT LEAD INTENT ========
$leadIntent = detectLeadIntent($userMessage, $assistantMessage);

// ======== SAVE TO LOG ========
logConversation($userMessage, $assistantMessage);

echo json_encode([
    'message' => $assistantMessage,
    'lead_intent' => $leadIntent,
    'tokens_used' => $data['usage']['output_tokens'] ?? 0
]);

// ======== HELPERS ========

function detectLeadIntent($userMsg, $botMsg) {
    $triggers = ['demo', 'cotizacion', 'cotización', 'precio', 'contratar', 'asesor', 'comprar', 'quiero', 'necesito', 'interesa'];
    $userLow = strtolower($userMsg);
    foreach ($triggers as $t) {
        if (strpos($userLow, $t) !== false) return true;
    }
    return false;
}

function logConversation($userMsg, $botMsg) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);
    $entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'user' => $userMsg,
        'bot' => substr($botMsg, 0, 200),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    $logFile = $logDir . '/chat_' . date('Y-m-d') . '.json';
    $existing = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
    $existing[] = $entry;
    file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
?>
