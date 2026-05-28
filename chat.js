/**
 * GEMA AI Light — Frontend Chat Widget
 * ERP Transport TIASTICA
 * Incluir en cualquier página: <script src="/ai-light/chat.js"></script>
 */

(function() {
  'use strict';

  const CONFIG = {
    endpoint: '/ai-light/chat.php',
    leadsEndpoint: '/ai-light/leads.php',
    primaryColor: '#E8881A',
    botName: 'GEMA',
    botSubtitle: 'Asistente ERP Transport',
    greeting: '¡Hola! Soy <strong>GEMA</strong>, tu asistente de ERP Transport 🚛<br>¿En qué puedo ayudarte hoy?',
    quickReplies: [
      { label: '¿Qué módulos incluye?', msg: '¿Cuáles son los módulos del ERP?' },
      { label: '¿Cómo funciona el GPS?', msg: '¿Cómo funciona el rastreo satelital?' },
      { label: '¿Qué versión necesito?', msg: '¿Qué versión o plan necesito para mi empresa?' },
      { label: 'Quiero una demo gratuita', msg: 'Quiero agendar una demo gratuita' },
      { label: '¿Tienen dashcam con IA?', msg: '¿Tienen dashcam con inteligencia artificial?' }
    ]
  };

  let history = [];
  let isOpen = false;
  let leadData = {};
  let collectingLead = false;
  let leadStep = 0;

  const leadQuestions = [
    { key: 'empresa',   q: '¿Cómo se llama tu empresa de transporte?' },
    { key: 'unidades',  q: '¿Cuántas unidades tienen aproximadamente?' },
    { key: 'pais',      q: '¿En qué país operan principalmente?' },
    { key: 'whatsapp',  q: '¿Cuál es tu número de WhatsApp o email para que te contacte un asesor?' }
  ];

  // ——— INJECT STYLES ———
  const style = document.createElement('style');
  style.textContent = `
    #gema-btn{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:50%;background:${CONFIG.primaryColor};border:none;cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 20px rgba(232,136,26,.45);transition:transform .25s,box-shadow .25s;animation:gema-bounce 4s 3s infinite;}
    #gema-btn:hover{transform:scale(1.1);}
    @keyframes gema-bounce{0%,70%,100%{transform:translateY(0)}35%{transform:translateY(-7px)}}
    #gema-badge{position:absolute;top:-3px;right:-3px;width:19px;height:19px;background:#E74C3C;border-radius:50%;font-size:11px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
    #gema-win{position:fixed;bottom:100px;right:28px;width:355px;height:510px;background:#fff;border-radius:16px;box-shadow:0 16px 50px rgba(0,0,0,.22);z-index:9999;display:flex;flex-direction:column;overflow:hidden;transform:scale(0) translateY(16px);transform-origin:bottom right;transition:all .32s cubic-bezier(.34,1.56,.64,1);opacity:0;}
    #gema-win.gema-open{transform:scale(1) translateY(0);opacity:1;}
    .gema-hdr{background:${CONFIG.primaryColor};padding:14px 18px;display:flex;align-items:center;gap:11px;flex-shrink:0;}
    .gema-av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;font-family:sans-serif;flex-shrink:0;}
    .gema-hi h4{font-size:14px;font-weight:700;color:#fff;margin:0;font-family:sans-serif;}
    .gema-hi p{font-size:11px;color:rgba(255,255,255,.78);margin:0;font-family:sans-serif;display:flex;align-items:center;gap:4px;}
    .gema-hi p::before{content:'';width:6px;height:6px;border-radius:50%;background:#4CD964;display:inline-block;}
    .gema-cls{margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
    .gema-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fafaf9;}
    .gema-msg{max-width:84%;word-wrap:break-word;}
    .gema-msg.bot{align-self:flex-start;}
    .gema-msg.usr{align-self:flex-end;}
    .gema-bubble{padding:9px 13px;border-radius:12px;font-size:13.5px;line-height:1.55;font-family:sans-serif;}
    .gema-msg.bot .gema-bubble{background:#EEEDE9;color:#1a1a1a;border-bottom-left-radius:3px;}
    .gema-msg.usr .gema-bubble{background:${CONFIG.primaryColor};color:#fff;border-bottom-right-radius:3px;}
    .gema-qr-wrap{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:#fafaf9;}
    .gema-qr{background:#fff;border:1.5px solid ${CONFIG.primaryColor};color:${CONFIG.primaryColor};border-radius:100px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;font-family:sans-serif;}
    .gema-qr:hover{background:${CONFIG.primaryColor};color:#fff;}
    .gema-typing{display:flex;align-items:center;gap:5px;padding:9px 13px;background:#EEEDE9;border-radius:12px;border-bottom-left-radius:3px;width:fit-content;}
    .gema-dot{width:6px;height:6px;border-radius:50%;background:#999;animation:gema-td 1.2s infinite;}
    .gema-dot:nth-child(2){animation-delay:.2s;}
    .gema-dot:nth-child(3){animation-delay:.4s;}
    @keyframes gema-td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    .gema-inp{padding:10px 14px;border-top:1px solid #e8e8e8;display:flex;gap:8px;background:#fff;flex-shrink:0;}
    #gema-input{flex:1;border:1.5px solid #ddd;border-radius:8px;padding:8px 12px;font-size:13.5px;font-family:sans-serif;outline:none;background:#fff;color:#1a1a1a;}
    #gema-input:focus{border-color:${CONFIG.primaryColor};}
    #gema-send{background:${CONFIG.primaryColor};border:none;color:#fff;width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s;}
    #gema-send:hover{background:#F5A623;}
    .gema-fade{animation:gema-fi .22s ease;}
    @keyframes gema-fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  `;
  document.head.appendChild(style);

  // ——— INJECT HTML ———
  document.body.insertAdjacentHTML('beforeend', `
    <button id="gema-btn" title="Chatea con GEMA" onclick="GEMAChat.toggle()">
      💬<div id="gema-badge">1</div>
    </button>
    <div id="gema-win">
      <div class="gema-hdr">
        <div class="gema-av">G</div>
        <div class="gema-hi">
          <h4>${CONFIG.botName}</h4>
          <p>${CONFIG.botSubtitle}</p>
        </div>
        <button class="gema-cls" onclick="GEMAChat.toggle()">✕</button>
      </div>
      <div class="gema-msgs" id="gema-msgs"></div>
      <div class="gema-qr-wrap" id="gema-qr"></div>
      <div class="gema-inp">
        <input type="text" id="gema-input" placeholder="Escribe tu pregunta..." />
        <button id="gema-send" onclick="GEMAChat.send()">➤</button>
      </div>
    </div>
  `);

  document.getElementById('gema-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') GEMAChat.send();
  });

  // ——— CORE FUNCTIONS ———
  function addMsg(who, html) {
    const msgs = document.getElementById('gema-msgs');
    const d = document.createElement('div');
    d.className = `gema-msg ${who} gema-fade`;
    d.innerHTML = `<div class="gema-bubble">${html}</div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('gema-msgs');
    const d = document.createElement('div');
    d.className = 'gema-msg bot';
    d.id = 'gema-typing';
    d.innerHTML = '<div class="gema-typing"><div class="gema-dot"></div><div class="gema-dot"></div><div class="gema-dot"></div></div>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('gema-typing')?.remove();
  }

  function showQR(replies) {
    const qr = document.getElementById('gema-qr');
    qr.innerHTML = '';
    replies.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'gema-qr';
      btn.textContent = r.label || r;
      btn.onclick = () => {
        qr.innerHTML = '';
        addMsg('usr', r.label || r);
        processInput(r.msg || r);
      };
      qr.appendChild(btn);
    });
  }

  async function processInput(text) {
    if (collectingLead) {
      handleLeadCollection(text);
      return;
    }

    history.push({ role: 'user', content: text });
    if (history.length > 20) history = history.slice(-20);

    showTyping();

    try {
      const res = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) })
      });
      const data = await res.json();
      removeTyping();

      if (data.error) {
        addMsg('bot', 'Lo siento, tuve un problema técnico. Por favor contáctanos directamente: <a href="https://wa.link/5fwr4k" target="_blank" style="color:#E8881A">WhatsApp</a> o llama al <strong>55 1947 5252</strong>');
      } else {
        const botReply = data.message.replace(/\n/g, '<br>');
        addMsg('bot', botReply);
        history.push({ role: 'assistant', content: data.message });

        if (data.lead_intent) {
          setTimeout(() => {
            addMsg('bot', '¿Te gustaría que un asesor especializado te contacte? Puedo tomar tus datos ahora mismo 📋');
            showQR([
              { label: 'Sí, quiero que me contacten', msg: '__START_LEAD__' },
              { label: 'No por ahora, gracias', msg: 'Solo quiero información por ahora' }
            ]);
          }, 800);
        } else {
          setTimeout(() => showQR(CONFIG.quickReplies), 300);
        }
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', 'Parece que hay un problema de conexión. Contáctanos directamente: <strong>55 1947 5252</strong>');
      showQR(CONFIG.quickReplies);
    }
  }

  function handleLeadCollection(answer) {
    if (leadStep > 0) {
      leadData[leadQuestions[leadStep - 1].key] = answer;
    }
    if (leadStep < leadQuestions.length) {
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMsg('bot', leadQuestions[leadStep].q);
        leadStep++;
      }, 600);
    } else {
      collectingLead = false;
      saveLead();
    }
  }

  function saveLead() {
    showTyping();
    fetch(CONFIG.leadsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...leadData, origen: 'chat_gema' })
    }).catch(() => {});

    setTimeout(() => {
      removeTyping();
      addMsg('bot', `✅ ¡Perfecto, <strong>${leadData.empresa || 'empresa'}</strong>! Un asesor de TIASTICA te contactará en menos de <strong>24 horas</strong> para tu demostración personalizada.<br><br>También puedes escribirnos directamente: <a href="https://wa.link/5fwr4k" target="_blank" style="color:#E8881A;font-weight:600">💬 WhatsApp ahora</a>`);
      showQR([
        { label: '¿Qué módulos recomiendas?', msg: '¿Qué módulos recomiendas según mi operación?' },
        { label: 'Ver versiones y planes', msg: '¿Cuáles son las versiones disponibles?' }
      ]);
    }, 1000);
  }

  // ——— PUBLIC API ———
  window.GEMAChat = {
    toggle() {
      isOpen = !isOpen;
      document.getElementById('gema-win').classList.toggle('gema-open', isOpen);
      document.getElementById('gema-badge').style.display = 'none';
      if (isOpen && !history.length) {
        setTimeout(() => {
          addMsg('bot', CONFIG.greeting);
          showQR(CONFIG.quickReplies);
        }, 200);
      }
    },
    send() {
      const input = document.getElementById('gema-input');
      const text = input.value.trim();
      if (!text) return;
      document.getElementById('gema-qr').innerHTML = '';
      if (text === '__START_LEAD__') {
        collectingLead = true;
        leadStep = 0;
        leadData = {};
        handleLeadCollection('');
        input.value = '';
        return;
      }
      addMsg('usr', text);
      input.value = '';
      processInput(text);
    }
  };

})();
