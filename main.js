const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
nav.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); } });

const canvas = document.querySelector('#orbits');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const gl = canvas && !reduceMotion.matches && canvas.getContext('webgl', { alpha: true, antialias: true });
if (gl) {
  const shader = (type, source) => { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); return s; };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 position; uniform vec2 resolution; void main(){ gl_Position=vec4(position.x*resolution.y/resolution.x, position.y, 0.0, 1.0); }'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, 'precision mediump float; uniform vec4 color; void main(){ gl_FragColor=color; }'));
  gl.linkProgram(program); gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution'); const color = gl.getUniformLocation(program, 'color');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  canvas.parentElement.classList.add('webgl');
  const method = document.querySelector('#metodologia');
  function draw(time) {
    const ratio = Math.min(devicePixelRatio || 1, 2); const w = canvas.clientWidth * ratio; const h = canvas.clientHeight * ratio;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(resolution, w, h);
    const progress = Math.max(0, Math.min(1, 1 - method.getBoundingClientRect().top / innerHeight));
    for (let ring = 0; ring < 2; ring++) {
      const points = []; const t = time * 0.00012; const angle = (ring ? -0.7 : 0.7) + Math.sin(t * (ring ? 0.7 : 1)) * 0.14 * (1 - progress);
      const offset = (ring ? 1 : -1) * (0.15 + 0.12 * (1 - progress));
      for (let i = 0; i <= 256; i++) { const a = i / 256 * Math.PI * 2; const x = Math.cos(a) * 0.52; const y = Math.sin(a) * 0.72; points.push(x * Math.cos(angle) - y * Math.sin(angle) + offset, x * Math.sin(angle) + y * Math.cos(angle)); }
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW); gl.uniform4f(color, 0.48, 0.30, 0.31, 0.55); gl.drawArrays(gl.LINE_STRIP, 0, 257);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

const story = document.querySelector('.story');
const frames = [...document.querySelectorAll('.story-frame')];
const messages = [...document.querySelectorAll('.story-message')];
const counter = document.querySelector('.story-current');
if (story && frames.length && messages.length && !reduceMotion.matches) {
  story.classList.add('story-animated');
  let ticking = false;
  const updateStory = () => {
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -story.getBoundingClientRect().top / distance));
    const stage = Math.min(messages.length - 1, Math.floor(progress * messages.length));
    messages.forEach((message, i) => {
      message.classList.toggle('is-active', i === stage);
      message.setAttribute('aria-hidden', String(i !== stage));
    });
    // Blend the images continuously, independently of the text changes.
    const imageProgress = progress * (frames.length - 1);
    frames.forEach((frame, i) => {
      frame.style.opacity = i === 0 ? '1' : String(Math.max(0, Math.min(1, imageProgress - (i - 1))));
    });
    counter.textContent = String(stage + 1).padStart(2, '0');
    ticking = false;
  };
  const scheduleStory = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateStory); } };
  addEventListener('scroll', scheduleStory, { passive: true });
  addEventListener('resize', scheduleStory);
  updateStory();
} else if (counter) {
  counter.textContent = '04';
}

