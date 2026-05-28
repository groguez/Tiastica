<?php
/**
 * GEMA AI Light — Gestor de Leads Calificados
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$lead = [
    'timestamp'   => date('Y-m-d H:i:s'),
    'nombre'      => htmlspecialchars($input['nombre'] ?? ''),
    'empresa'     => htmlspecialchars($input['empresa'] ?? ''),
    'unidades'    => htmlspecialchars($input['unidades'] ?? ''),
    'pais'        => htmlspecialchars($input['pais'] ?? ''),
    'tipo_op'     => htmlspecialchars($input['tipo_op'] ?? ''),
    'whatsapp'    => htmlspecialchars($input['whatsapp'] ?? ''),
    'email'       => filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL),
    'intereses'   => $input['intereses'] ?? [],
    'origen'      => $input['origen'] ?? 'chat_gema',
    'ip'          => $_SERVER['REMOTE_ADDR'] ?? ''
];

// Guardar en JSON
$leads = file_exists(LEADS_FILE) ? json_decode(file_get_contents(LEADS_FILE), true) : [];
$leads[] = $lead;
file_put_contents(LEADS_FILE, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Enviar notificación por email (configura tu SMTP)
if (!empty($lead['email']) || !empty($lead['whatsapp'])) {
    $subject = "🚛 Nuevo Lead GEMA — {$lead['empresa']} ({$lead['unidades']} unidades)";
    $body = "Nuevo lead desde el chat GEMA:\n\n"
        . "Nombre: {$lead['nombre']}\n"
        . "Empresa: {$lead['empresa']}\n"
        . "Unidades: {$lead['unidades']}\n"
        . "País: {$lead['pais']}\n"
        . "Operación: {$lead['tipo_op']}\n"
        . "WhatsApp: {$lead['whatsapp']}\n"
        . "Email: {$lead['email']}\n"
        . "Intereses: " . implode(', ', $lead['intereses']) . "\n"
        . "Hora: {$lead['timestamp']}";
    @mail(COMPANY_EMAIL, $subject, $body, "From: gema@tiastica.com");
}

echo json_encode(['success' => true, 'message' => 'Lead guardado correctamente']);
?>
