
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const cockpitContent = {

  geointeligencia:{
    title:'Geointeligencia Estratégica',
    subtitle:'Mapas inteligentes y analítica territorial.',
    html:`
      <h2>Geointeligencia</h2>
      <p>Sistema territorial avanzado.</p>
    `
  },

  erp:{
    title:'ERP Transporte',
    subtitle:'Control financiero y operativo.',
    html:`
      <h2>ERP Transporte</h2>
      <p>Dashboard operativo inteligente.</p>
    `
  },

  'ultima-milla':{
    title:'Última Milla',
    subtitle:'Optimización de entregas.',
    html:`
      <h2>Última Milla</h2>
      <p>Tracking y secuenciación dinámica.</p>
    `
  },

  ia:{
    title:'IA Logística',
    subtitle:'Automatización y predicción.',
    html:`
      <h2>IA Logística</h2>
      <p>Modelos inteligentes y análisis predictivo.</p>
    `
  }

};

window.openCockpit = function(platformId){

  const overlay = $('#cockpitOverlay');

  if(!overlay) return;

  const data = cockpitContent[platformId];

  if(!data) return;

  $('#cockpitTitle').textContent = data.title;
  $('#cockpitSubtitle').textContent = data.subtitle;
  $('#cockpitDynamicContent').innerHTML = data.html;

  overlay.hidden = false;

  requestAnimationFrame(() => {

    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden','false');

    document.body.style.overflow = 'hidden';

  });

};

window.closeCockpit = function(){

  const overlay = $('#cockpitOverlay');

  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden','true');

  document.body.style.overflow = '';

  setTimeout(() => {
    overlay.hidden = true;
  },450);

};

$('#cockpitCloseBtn').addEventListener('click', closeCockpit);

$$('.orb-btn').forEach(btn => {

  btn.addEventListener('click', () => {

    const platform = btn.dataset.platform;
    const target = document.getElementById(platform);

    if(!target) return;

    target.scrollIntoView({
      behavior:'smooth',
      block:'start'
    });

    setTimeout(() => {

      openCockpit(platform);

    }, 850);

  });

});
