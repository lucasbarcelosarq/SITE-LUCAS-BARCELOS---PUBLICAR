// Topo e menu do celular
const topo = document.querySelector('.topo'), menu = document.querySelector('.menu');
const rolar = () => topo.classList.toggle('solido', scrollY > 40);
addEventListener('scroll', rolar, { passive: true }); rolar();
const abrir = a => { topo.classList.toggle('aberto', a); menu.setAttribute('aria-expanded', String(a)); };
menu.addEventListener('click', () => abrir(!topo.classList.contains('aberto')));
topo.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => abrir(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });

// Capa rotativa
const slides = [...document.querySelectorAll('#slides picture')];
if (slides.length) {
  const nomes = ['Residência AE10', 'Residência S20', 'Residência AR10'];
  const links = ['residencia-ae10', 'residencia-s20', 'residencia-ar10'];
  const leg = document.getElementById('leg'), pausa = document.getElementById('pausa');
  let at = 0, tocando = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ir = d => {
    const px = (at + d + slides.length) % slides.length, im = slides[px].querySelector('img');
    const trocar = () => {
      slides[at].classList.remove('on'); at = px; slides[at].classList.add('on');
      document.querySelectorAll('.barras i').forEach((b, i) => b.classList.toggle('on', i === at)); leg.textContent = nomes[at]; leg.href = 'projetos/' + links[at] + '.html';
    };
    const so = slides[px].querySelector('source[data-srcset]');
    if (so) { so.srcset = so.dataset.srcset; so.removeAttribute('data-srcset'); }
    if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; im.decode().then(trocar, trocar); } else trocar();
  };
  const rot = () => pausa.textContent = tocando ? 'Pausar' : 'Reproduzir';
  rot();
  const barra = document.querySelector('.barras i');
  if (barra) barra.classList.add('on');
  setInterval(() => { if (tocando && !document.hidden) ir(1); }, 6500);
  pausa.onclick = () => { tocando = !tocando; rot(); };
  document.getElementById('ant').onclick = () => { tocando = false; rot(); ir(-1); };
  document.getElementById('prox').onclick = () => { tocando = false; rot(); ir(1); };
}

// Filtro de projetos
const botoes = [...document.querySelectorAll('.filtros button')], itens = document.querySelectorAll('#todos .lista li'), conta = document.querySelector('.conta');
const mais = document.querySelector('.mais');
let filtro = '', tudo = false;
const LIMITE = 12;
const filtrar = f => {
  if (f !== filtro) tudo = false;
  filtro = f;
  botoes.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.f === f)));
  let n = 0;
  itens.forEach(i => {
    const serve = !f || i.dataset.cat === f;
    if (serve) n++;
    i.hidden = !serve || (!tudo && n > LIMITE);
  });
  mais.hidden = tudo || n <= LIMITE;
  mais.textContent = 'Ver os ' + n + ' projetos';
  conta.textContent = mais.hidden ? n + ' projetos' : 'Mostrando ' + LIMITE + ' de ' + n + ' projetos';
};
if (mais) {
  mais.addEventListener('click', () => { tudo = true; filtrar(filtro); itens[LIMITE].querySelector('a').focus({ preventScroll: true }); });
  filtrar('');
}
botoes.forEach(b => b.addEventListener('click', () => filtrar(b.dataset.f)));
document.querySelectorAll('.portas a').forEach(a => a.addEventListener('click', () => filtrar(a.dataset.cat)));

// Formulário: monta a mensagem do WhatsApp (nada fica salvo no site)
const form = document.getElementById('briefing');
const montar = d => ['Olá, Lucas! Vi seu site e gostaria de conversar sobre um projeto.', 'Nome: ' + d.get('nome'),
  'Tipo: ' + d.get('tipo'), 'Fase: ' + d.get('fase'), d.get('cidade') && 'Local: ' + d.get('cidade'),
  d.get('area') && 'Área: ' + d.get('area') + ' m²', d.get('msg')].filter(Boolean).join('\n');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  window.open('https://wa.me/5551996606933?text=' + encodeURIComponent(montar(new FormData(form))), '_blank', 'noopener');
});

// Imagem ampliada
const lupa = document.getElementById('lupa');
if (lupa) {
  const fotos = [...document.querySelectorAll('.ampliar img, .ob-ver img')], g = lupa.querySelector('img');
  let k = 0;
  const ver = d => { k = (k + d + fotos.length) % fotos.length; g.src = fotos[k].src; g.alt = fotos[k].alt; };
  document.querySelectorAll('.ampliar, .ob-ver').forEach((b, i) => b.addEventListener('click', () => { k = i; ver(0); lupa.showModal(); }));
  lupa.querySelectorAll('button').forEach(b => {
    if (fotos.length < 2 && b.dataset.d !== '0') b.hidden = true;
    b.addEventListener('click', () => b.dataset.d === '0' ? lupa.close() : ver(+b.dataset.d));
  });
  lupa.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') ver(-1); if (e.key === 'ArrowRight') ver(1); });
}

// Comparadores de três momentos (0, 100 e 200); data-rotulos traz os nomes
document.querySelectorAll('.comp').forEach(comp => {
  const tres = comp.querySelector('.tres'), r = tres.querySelector('input'), bts = [...comp.querySelectorAll('.momentos button')];
  const rot = (comp.dataset.rotulos || 'Traço|Projeto|Obra').split('|');
  const pintar = v => {
    tres.style.setProperty('--t', Math.max(0, 100 - v) + '%');
    tres.style.setProperty('--p', Math.max(0, Math.min(100, 200 - v)) + '%');
    tres.classList.toggle('v1', v > 0 && v < 100);
    tres.classList.toggle('v2', v > 100 && v < 200);
    r.setAttribute('aria-valuetext', v < 50 ? rot[0] : v < 150 ? rot[1] : rot[2]);
    bts.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === Math.round(v))));
  };
  let anim = 0;
  const ir = alvo => {
    cancelAnimationFrame(anim);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { r.value = alvo; pintar(alvo); return; }
    const de = +r.value, t0 = performance.now(), dur = 500 + Math.abs(alvo - de) * 9;
    const passo = t => {
      const k = Math.min(1, (t - t0) / dur), v = de + (alvo - de) * (1 - Math.pow(1 - k, 3));
      r.value = v; pintar(k === 1 ? alvo : v);
      if (k < 1) anim = requestAnimationFrame(passo);
    };
    anim = requestAnimationFrame(passo);
  };
  r.addEventListener('input', () => { cancelAnimationFrame(anim); pintar(+r.value); });
  bts.forEach(b => b.addEventListener('click', () => ir(+b.dataset.v)));
  // Arrastar: a linha acompanha o dedo; para a esquerda avança, para a direita volta
  let x0 = null, v0 = 0;
  tres.addEventListener('pointerdown', e => { cancelAnimationFrame(anim); x0 = e.clientX; v0 = +r.value; tres.setPointerCapture(e.pointerId); });
  tres.addEventListener('pointermove', e => {
    if (x0 === null) return;
    const v = Math.max(0, Math.min(200, v0 - (e.clientX - x0) / tres.clientWidth * 100));
    r.value = v; pintar(v);
  });
  ['pointerup', 'pointercancel'].forEach(n => tres.addEventListener(n, () => { x0 = null; }));
  r.value = 145; pintar(145);
});

// Planta interativa: uma aba por pavimento (sem script, aparecem todas)
const abas = document.querySelector('.abas');
if (abas) {
  const pavs = [...document.querySelectorAll('.pav')], bs = [...abas.querySelectorAll('button')];
  const mostrar = p => {
    pavs.forEach(x => x.hidden = x.dataset.p !== p);
    bs.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === p)));
  };
  bs.forEach(b => b.addEventListener('click', () => mostrar(b.dataset.p)));
  abas.hidden = false;
  mostrar('0');
}

// Entrada suave das seções (sem script ou com movimento reduzido, tudo já aparece)
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ok'); ob.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.manifesto p, .faixa > h2, .dest figure, .servicos article, .sobre > *, .fase, .obra, .ob-gal figure, .galeria > *').forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('surge'); ob.observe(el); }
  });
}
