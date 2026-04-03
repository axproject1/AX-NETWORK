/* ==========================================================================
   Inicialización — se ejecuta cuando el DOM y todos los scripts están listos
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // ── EmailJS ──────────────────────────────────────────────────────────────
  // INSTRUCCIONES:
  // 1. Ve a https://www.emailjs.com y crea una cuenta gratuita
  // 2. Crea un Email Service (Gmail) y un Email Template
  // 3. Reemplaza los valores de abajo con tus credenciales reales
  if (typeof emailjs !== 'undefined') {
    emailjs.init('YOUR_PUBLIC_KEY'); // <-- reemplaza con tu Public Key de EmailJS
  }

  // ── Scroll Reveal ─────────────────────────────────────────────────────────
  // Observa los elementos con clases reveal y les añade 'visible' al entrar en pantalla
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

  // ── CSS de animación @spin (para el spinner del botón de envío) ───────────
  // Se inyecta dinámicamente para no añadir un archivo CSS extra solo por esto
  const spinStyle = document.createElement('style');
  spinStyle.textContent = '@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }';
  document.head.appendChild(spinStyle);

}); // fin DOMContentLoaded

/**
 * Función para manejar el envío del formulario de contacto
 * Utiliza EmailJS con un fallback a WhatsApp si falla.
 */
async function sendEmail(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMsg');
  
  // Deshabilitar botón mientras se envía
  btn.disabled = true;
  btn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg> Enviando...';
  
  const form = document.getElementById('contactForm');

  // Valores para fallback o para enviar
  const name = form.from_name.value;
  const email = form.reply_to.value;
  const service = form.service.value;
  const message = form.message.value;

  try {
    // Intenta enviar por EmailJS
    await emailjs.sendForm(
      "YOUR_SERVICE_ID",   // <-- reemplaza con tu Service ID
      "YOUR_TEMPLATE_ID",  // <-- reemplaza con tu Template ID
      form
    );
    msg.className = 'form-msg success';
    msg.textContent = '✅ Mensaje enviado correctamente. Te responderemos en menos de 24 horas.';
    form.reset();
  } catch(err) {
    // Fallback a WhatsApp si EmailJS no está configurado (por ejemplo falten keys)
    const waText = encodeURIComponent(`Hola AX Network,\n\nNombre: ${name}\nEmail: ${email}\nServicio: ${service}\nMensaje: ${message}`);
    msg.className = 'form-msg error';
    msg.innerHTML = '⚠️ Para completar el envío, <a href="https://wa.me/50769110901?text='+waText+'" target="_blank" style="color:#3b9eff">haz clic aquí para enviar por WhatsApp</a> o escríbenos a ax.studios01@gmail.com';
  }
  
  // Restaurar el botón
  btn.disabled = false;
  btn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg> Enviar mensaje';
}

/* ==========================================================================
   Tabs de Servicios
   ========================================================================== */
/**
 * Alterna entre las diferentes secciones de servicios.
 */
function showPanel(id, el) {
  // Ocultar todos los paneles y remover la clase "active" de los botones
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  
  // Mostrar el panel seleccionado y activar el botón
  document.getElementById('panel-' + id).classList.add('active');
  el.classList.add('active');
}

/* ==========================================================================
   WhatsApp
   ========================================================================== */
/**
 * Abre el chat de WhatsApp corporativo en una nueva pestaña
 */
function wa() { 
  window.open("https://wa.me/50769110901", "_blank"); 
}

/* ==========================================================================
   Navegación Efecto Scroll
   ========================================================================== */
// Añade la clase "scrolled" al nav cuando bajamos más de 40px
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
});

/* ==========================================================================
   Scroll Reveal (Animaciones al hacer Scroll)
   ========================================================================== */
// Observador global — detecta elementos visibles en pantalla y les añade 'visible'
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
// Nota: el querySelectorAll se llama dentro de DOMContentLoaded (al inicio del archivo)

/* ==========================================================================
   Widget de Chat (Bot Básico de Atención)
   ========================================================================== */
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatBox').classList.toggle('open', chatOpen);
  document.getElementById('chatNotif').style.display = 'none';
}

function addMsg(text, type) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.innerHTML = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const val = input.value.trim();
  if(!val) return;
  
  // Agregar mensaje del usuario
  addMsg(val, 'user');
  input.value = '';
  document.getElementById('quickReplies').style.display = 'none';
  
  // Simular tipeo del bot
  setTimeout(() => {
    const typing = addMsg('<span></span><span></span><span></span>', 'bot typing');
    
    // Responder basado en la entrada
    setTimeout(() => {
      typing.remove();
      const r = getBotReply(val.toLowerCase());
      addMsg(r, 'bot');
    }, 1200);
  }, 300);
}

function quickSend(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

/**
 * Lógica básica del bot de respuestas predeterminadas.
 */
function getBotReply(t) {
  if (t.includes('precio') || t.includes('costo') || t.includes('cotiz') || t.includes('cuánto'))
    return 'Los precios varían según el servicio. Te recomendamos completar el formulario de contacto o escribirnos directamente al <a href="https://wa.me/50769110901" target="_blank" style="color:var(--accent)">+507 6911-0901</a> para una cotización sin compromiso. 💰';
  
  if (t.includes('red') || t.includes('wifi') || t.includes('router') || t.includes('lan'))
    return 'Ofrecemos instalación LAN, configuración de routers, WiFi empresarial y monitoreo de redes. ¿Tienes una empresa o local específico? Cuéntanos más. 📡';
  
  if (t.includes('seguridad') || t.includes('cctv') || t.includes('cámara') || t.includes('camara'))
    return 'Instalamos sistemas de cámaras IP, DVR/NVR, control de acceso y alarmas. Todo con acceso remoto desde tu celular. 📷 ¿Quieres más información?';
  
  if (t.includes('web') || t.includes('página') || t.includes('pagina') || t.includes('sitio'))
    return 'Desarrollamos sitios web corporativos, tiendas online y sistemas internos. ¿Tienes una idea en mente? Cuéntanos. 💻';
  
  if (t.includes('soporte') || t.includes('técnico') || t.includes('tecnico') || t.includes('reparar') || t.includes('laptop') || t.includes('pc') || t.includes('compu'))
    return 'Brindamos diagnóstico, reparación y mantenimiento de equipos. Atendemos en sitio en Panamá. ¿Cuál es el problema con tu equipo?';
  
  if (t.includes('hola') || t.includes('buenas') || t.includes('hey') || t.includes('buenos'))
    return '¡Hola! 👋 Gracias por contactar a AX Network. ¿En qué podemos ayudarte hoy?';
  
  if (t.includes('horario') || t.includes('hora') || t.includes('atienden'))
    return 'Atendemos de lunes a sábado de 8:00 AM a 6:00 PM. Para emergencias fuera de horario, escríbenos por WhatsApp. ⏰';
  
  if (t.includes('ubicac') || t.includes('donde') || t.includes('dirección'))
    return 'Estamos en Ciudad de Panamá y ofrecemos servicio en toda el área metropolitana. También atendemos de forma remota. 📍';
  
  return 'Gracias por tu mensaje. Para una atención más rápida, puedes escribirnos directamente al <a href="https://wa.me/50769110901" target="_blank" style="color:var(--accent)">WhatsApp +507 6911-0901</a> o completar el formulario de contacto. 🙌';
}

// Nota: el CSS de @keyframes spin se inyecta dentro del bloque DOMContentLoaded al inicio del archivo.
