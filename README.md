# GEMA — AI Light · ERP Transport · TIASTICA
## Guía de Implementación Rápida

---

### Estructura de archivos

```
/ai-light/
  chat.php        → Endpoint principal (llama a Claude API)
  config.php      → API Key y configuración
  knowledge.php   → Base de conocimiento del producto
  leads.php       → Guarda y notifica leads calificados
  chat.js         → Widget embebible en cualquier página
  README.md       → Esta guía
  /logs/          → Se crea automáticamente
  leads.json      → Se crea automáticamente
```

---

### Instalación (5 minutos)

**1. Sube los archivos a tu servidor PHP**
```
/public_html/ai-light/   ← o el path que prefieras
```

**2. Configura tu API Key en config.php**
```php
define('ANTHROPIC_API_KEY', 'sk-ant-TU_KEY_REAL_AQUI');
```
Obtén tu API Key en: https://console.anthropic.com

**3. Asegúrate de tener cURL activo en PHP**
```php
phpinfo(); // busca "cURL" — debe decir "enabled"
```

**4. Incluye el widget en cualquier página HTML**
```html
<!-- Al final del <body>, antes de </body> -->
<script src="/ai-light/chat.js"></script>
```

¡Listo! El botón naranja de GEMA aparecerá en la esquina inferior derecha.

---

### Integración con la Landing Page Onboarding

La landing `ERP_Transport_Onboarding_AILight.html` ya tiene el chat integrado de forma standalone (sin API). Para activar la versión con IA real:

1. Elimina el bloque `<script>` del chat en la landing (desde `// ======== AI LIGHT — GEMA ========` hasta el final)
2. Agrega al final del `<body>`:
```html
<script src="/ai-light/chat.js"></script>
```

---

### Personalización

**Cambiar colores o nombre (en chat.js):**
```js
const CONFIG = {
  primaryColor: '#E8881A',   // naranja TIASTICA
  botName: 'GEMA',
  botSubtitle: 'Asistente ERP Transport',
  ...
}
```

**Agregar preguntas frecuentes (en knowledge.php):**
Añade texto en la función `getKnowledgeBase()` siguiendo el mismo formato.

**Conectar a CRM (en leads.php):**
Agrega un `curl_post` a tu CRM (HubSpot, Zoho, Salesforce) dentro de la función de guardar lead.

---

### Webhook para leads (opcional)

En `leads.php` puedes agregar notificación a Zapier/Make:
```php
// Después de guardar el JSON:
$webhookUrl = 'https://hooks.zapier.com/hooks/catch/TU_ID/';
$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($lead));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_exec($ch);
curl_close($ch);
```

---

### Flujo de conversación

```
Usuario abre el chat
        ↓
GEMA saluda + muestra 5 botones rápidos
        ↓
Usuario hace pregunta
        ↓
chat.js → POST a chat.php → Claude API
        ↓
Respuesta con conocimiento del producto
        ↓
Si detecta intención de compra → flujo de calificación
        ↓
Recopila: empresa, unidades, país, contacto
        ↓
leads.php guarda + envía email a ventas
        ↓
"Un asesor te contactará en 24 horas"
```

---

### Soporte técnico TIASTICA
- Web: www.tiastica.com
- Tel: 55 1947 5252
- Email: ventas@gmtransporterp.com
- WhatsApp: https://wa.link/5fwr4k

*Desarrollado con ❤️ para TIASTICA · GM Transport Software® 2025*
