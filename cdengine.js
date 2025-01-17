const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.position = "fixed";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.border = "none";
canvas.style.zIndex = "-1";
canvas.style.backgroundColor = "#111";
canvas.style.imageRendering = "pixelated";

let _pause = true; // Variavel de controle para pausar o jogo

const Gui = [];
const Scenes = [];

const splashscreen = document.createElement("div");
splashscreen.setAttribute(
  "style",
  `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 9999;
    cursor: pointer;
    font-family: Arial, sans-serif;
    margin: 0;
  `
);
splashscreen.innerHTML = `
  <h1 style="
    font-size: 2.5rem;
    margin: 0.5em 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  ">Made in CD Engine</h1>
  <p style="
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.8;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  ">Click to play!!!</p>
`;
document.body.appendChild(splashscreen);

splashscreen.addEventListener("click", (e) => {
  document.body.removeChild(splashscreen);
  onStart();
  mainLoop();
  game.play(); // Inicia p jogo
})

const pressedKeys = [];
addEventListener("keydown", (e) => {
  if (!pressedKeys.includes(e.key)) pressedKeys.push(e.key);
});
addEventListener("keyup", (e) => {
  if (pressedKeys.includes(e.key)) pressedKeys.splice(pressedKeys.indexOf(e.key));
});

const pointView = {
  node: undefined
};

const getRandom = (min = 0, max = 1) => {
  return Math.floor(Math.random() * (max - min) + min);
}

const setBackgroundColor = (color = "#111") => {
  canvas.style.backgroundColor = color;
}

const setBackgroundSprite = (sprite) => {
  canvas.style.backgroundImage = `url(${sprite})`;
}

const setBackgroundPosition = (x = 0, y = 0) => {
  canvas.style.backgroundPosition = `${x}px ${y}px`;
}

var onUpdate = () => {};
var onStart = () => {};





const changeWorld = (world = MainWorld) => {
  if (Scenes.includes(MainWorld)) {
    ThisWorld.onEnd();
    ThisWorld = world.
    ThisWorld.onStart();
  }
}

class World {
  constructor() {
    this.world = [];
    this.space = new p2.World({
      gravity: [0, 500],
    });

    this.onStart = () => {};
    this.onUpdate = () => {};
    this.onEnd = () => {};

    Scenes.push(this);
  }

  update() {
    this.onUpdate();
    this.space.step(1 / 60);
    for (let index in this.world) {
      if (this.world[index].step) this.world[index].step();
    }
  }
}
const MainWorld = new World();
var ThisWorld = MainWorld;

const checkCollision = (obj1, obj2, precision) => {
  return (
    obj1.x + precision < obj2.x + precision + obj2.width + precision &&
    obj1.x + precision + obj1.width + precision > obj2.x + precision &&
    obj1.y + precision < obj2.y + precision + obj2.height + precision &&
    obj1.y + precision + obj1.height + precision > obj2.y + precision
  );
}

class Node {
  constructor(x = 0, y = 0, w = 50, h = 50, c = undefined, s = MainWorld) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.sprite = c;
    this.rotation = 0;
    this.img = new Image();
    this.Scene = s;
    this.fixedAngle = false;

    this.attributes = [];

    if (Scenes.includes(s)) s.world.push(this);
    else MainWorld.world.push(this);

    // Adiciona os Listeners
    this.isPressed = false;
    this.lastTouch = false;
    canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
    canvas.addEventListener('touchend', this._onTouchEnd.bind(this));
  }

  addPhysicbody(isDinamic = 1) {
    this.body = new p2.Body({
      mass: isDinamic,
      position: [this.x, this.y],
    });

    this.shape = new p2.Box({
      width: this.width,
      height: this.height,
    });

    this.body.addShape(this.shape);
    this.Scene.space.addBody(this.body);
  }

  defineVelocity(x = this.body.velocity[0], y = this.body.velocity[1]) {
    let xx = x;
    let yy = y;
    if (this.body) {
      if (x == null) xx = this.body.velocity[0];
      if (y == null) yy = this.body.velocity[1];

      this.body.velocity = [xx, yy];
    } else {
      console.log("Coloque um corpo de física nesse objeto!!!");
    }
  }

  remove() {
    if (this.body) {
      this.body.removeShape(this.body.shapes[0]);
      this.Scene.space.removeBody(this.body);
    }

    this.Scene.world.splice(this.Scene.world.indexOf(this), 1);
  }

  definePosition(x = this.body.position[0], y = this.body.position[1]) {
    let xx = x;
    let yy = y;
    if (this.body) {
      if (x == null) xx = this.body.position[0];
      if (y == null) yy = this.body.position[1];

      this.body.position = [xx, yy];
    } else {
      console.log("Coloque um corpo de física nesse objeto!!!");
    }
  }

  step() {
    if (this.body) {
      this.x = this.body.position[0];
      this.y = this.body.position[1];
      this.rotation = this.body.angle;
      this.body.fixedRotation = this.fixedAngle;
    }

    ctx.save();
    if (pointView.node != undefined) {
      if (pointView.node == this) {
        ctx.translate(innerWidth / 2, innerHeight / 2);
      } else {
        ctx.translate(this.x + innerWidth / 2 - pointView.node.x, this.y + innerHeight / 2 - pointView.node.y);
      }
    } else {
      ctx.translate(this.x + innerWidth / 2, this.y + innerHeight / 2);
    }
    ctx.rotate(this.rotation);
    this.img.src = this.sprite;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  onTouch(callback) {
    if (this.isPressed && typeof callback == 'function') {
      callback()
      this.lastTouch = true;
    }
  }

  onRelease(callback) {
    if (!this.isPressed && this.lastTouch && typeof callback == 'function') {
      callback();
    }
  }

  // Evento touchstart
  _onTouchStart(event) {
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (touchX - rect.left) - window.innerWidth / 2;
    const canvasY = (touchY - rect.top) - window.innerHeight / 2;

    if (this.isPointInside(canvasX, canvasY)) {
      this.isPressed = true;
      if (typeof callback == 'function') {
        callback();
      }
    }
  }


  // Evento touchend
  _onTouchEnd(event) {
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (touchX - rect.left) - window.innerWidth / 2;
    const canvasY = (touchY - rect.top) - window.innerHeight / 2;

    if (this.isPointInside(canvasX, canvasY)) {
      this.isPressed = false;
      if (typeof callback == 'function') {
        callback();
      }
    }
  }


  // Verifica se o toque tá dentro do objeto
  isPointInside(x, y) {
    return (
      x >= this.x - this.width / 2 &&
      x <= this.x + this.width / 2 &&
      y >= this.y - this.height / 2 &&
      y <= this.y + this.height / 2
    );
  }
}

class Interface {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;

    this.element = document.createElement("div");
    document.body.appendChild(this.element);

    this.element.style.position = "fixed";
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.style.backgroundColor = this.color;
    this.element.style.color = "#fff";
    this.element.style.display = "flex";
    this.element.style.textAlign = "center";
    this.element.style.justifyContent = "center";
    this.element.style.alignItems = "center";
    this.element.style.fontFamily = "arial";
    this.element.style.cursor = "default";
    this.element.style.border = "none";
    this.element.style.outline = "none";
    this.element.style.transition = ".2s";

    Gui.push(this);
  }

  setText(text) {
    this.element.textContent = text;
  }

  hide() {
    this.element.style.display = "none";
  }

  show() {
    this.element.style.display = "block";
  }

  setSprite(sprite) {
    this.element.style.backgroundImage = `url(${sprite})`;
    this.element.style.backgroundSize = "100% 100%";
  }

  setColor(color) {
    this.element.style.backgroundColor = color;
    this.color = color;
  }

  addClickEvent(event) {
    this.clicked = false;
    this.touched = false;
    this.activeTouches = new Set(); // Usar Set para armazenar toques ativos

    this.element.addEventListener("mousedown", () => {
      event();
      this.clicked = true;
    });

    this.element.addEventListener("mouseup", () => {
      this.clicked = false;
    });

    this.element.addEventListener("touchstart", (e) => {
        [...e.changedTouches].forEach((touch) => {
        this.activeTouches.add(touch.identifier); // Adiciona o toque ao conjunto
      });
      this.touched = true;
      event();
    });

    this.element.addEventListener("touchend", (e) => {
        [...e.changedTouches].forEach((touch) => {
        this.activeTouches.delete(touch.identifier); // Remove o toque do conjunto
      });
      if (this.activeTouches.size === 0) {
        this.touched = false; // Atualiza somente se não houver toques ativos
      }
    });

    this.element.addEventListener("touchcancel", (e) => {
        [...e.changedTouches].forEach((touch) => {
        this.activeTouches.delete(touch.identifier);
      });
      if (this.activeTouches.size === 0) {
        this.touched = false;
      }
    });

    this.element.style.cursor = "pointer";
  }

  render() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.style.color = "#fff";
  }
}

class Sound {
  constructor(src, loop = false) {
    this.element = new Audio();
    this.element.src = this.src;
    this.element.volume = 100;
  }

  play() {
    this.element.play();
  }

  stop() {
    this.element.pause();
    this.element.currentTime = 0;
  }
}



function mainLoop() {
  let lastTime = 0; // Armazena o tempo do ultimo frame
  function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000; // Calcula o Delta Time, o tempo entre o frame atual e o ultimo frame

    if (!_pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let index in Scenes) {
        if (Scenes[index].update && Scenes[index] == ThisWorld) Scenes[index].update();
      }

      if (typeof onUpdate == 'function') {
        onUpdate(dt); // Se a função existir será chamada pasando o Delta Timecomo parâmetro
      }

      for (let index in Gui) {
        if (Gui[index].render) Gui[index].render();
      }
      for (let i in analogs) {
        if (typeof analogs[i].draw() == 'function') {
          analogs[i].draw();
        }
      }

    }
    lastTime = timestamp; // Atualiza o tempo do ultimo frame
    requestAnimationFrame(loop);

  }
  requestAnimationFrame(loop);
}

// Controla o ciclo de vida do jogo com pause e play
const game = {
  pause() {
    return _pause = true;
  },
  play() {
    return _pause = false;
  },
  isPaused() {
    return _pause;
  }
}

function wait(seconds, callback) {
  if (isNaN(seconds) || seconds < 0) {
    alert("O parâmetro 'seconds' deve ser um numero não negativo");
    return;
  }
  if (typeof callback !== 'function') {
    alert('O parâmetro "callback deve ser uma função');
    return;
  }
  setTimeout(() => {
    callback();
  }, seconds * 1000);
}


function print(text, x = 0, y = 0, size = 14, color = 'white', font = 'Arial', type = 'normal', align = 'left') {
  if (!text) {
    alert('O parâmetro "text" não pode ser vazio');
  }
  ctx.font = `${type} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function loadFont(font) {
  let url = font;
  let fontName = url.split('/').pop().split('.')[0];
  let fontFace;
  if (url.endsWith('.ttf')) {
    fontFace = `@font-face {
    font-family: '${fontName}';
    src: url('${url}') format('truetype');
  }`;
  } else if (url.endsWith('.woff')) {
    fontFace = `@font-face {
    font-family: '${fontName}';
    src: url('${url}') format('woff');
  }`;
  } else if (url.endsWith('.woff2')) {
    fontFace = `@font-face {
    font-family: '${fontName}';
    src: url('${url}') format('woff2');
  }`;
  }
  const style = document.querySelector("style");
  style.innerHTML += fontFace;
}


// -------------------------------------

/*
class Analog {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.raio = r;
    this.posX = x;
    this.posY = y;
    this.dirX = 0;
    this.dirY = 0;
    this.isPressed = false;

    this.draw();
    this.event();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.raio, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
  }

  updateDir(x, y) {
    this.dirX = x - this.x;
    this.dirY = y - this.y;
    const distancia = Math.sqrt(this.dirX ** 2 + this.dirY ** 2);
    if (distancia > this.raio) {
      this.dirX = this.dirX / distancia * this.raio;
      this.dirY = this.dirY / distancia * this.raio;
    }
  }

  event() {
    canvas.addEventListener('touchstart', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) <= this.raio) {
        this.isPressed = true;
        this.updateDir(x, y);
        this.posX = x;
        this.posY = y;
        this.drawAnalog();
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (this.isPressed) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updateDir(x, y);
        this.posX = x;
        this.posY = y;
        this.drawAnalog();
      }
    });

    canvas.addEventListener('touchend', () => {
      this.isPressed = false;
      this.posX = this.x;
      this.posY = this.y;
      this.dirX = 0;
      this.dirY = 0;
      this.draw();
    });
  }

  drawAnalog() {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.draw();
    ctx.beginPath();
    ctx.arc(this.posX, this.posY, this.raio / 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
  }

  getDir() {
    return { x: this.dirX / this.raio, y: this.dirY / this.raio };
  }
}
*/





// Funcionando
const analogs = [];

class Analog {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.X = x;
    this.Y = y;
    this.R = r * 2.5;
    this.dx = 0;
    this.dy = 0;
    this.event();

    this.pos_x = window.innerWidth * (this.x / 100);
    this.pos_y = window.innerHeight * (this.y / 100);
    this.pos_X = window.innerWidth * (this.X / 100);
    this.pos_Y = window.innerHeight * (this.Y / 100);
    analogs.push(this);
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.pos_X, this.pos_Y, this.R, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.pos_x, this.pos_y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ccc";
    ctx.fill();
  }

  drawText() {
    ctx.font = "20px Arial"
    ctx.fillText("x: " + Math.round(this.dx) + " " + "y: " + Math.round(this.dy), 150, 50);
  }

  event() {

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.pos_x = e.touches[0].clientX;
      this.pos_y = e.touches[0].clientY;
    });

    canvas.addEventListener("touchmove", (e) => {
      this.pos_x = e.changedTouches[0].clientX;
      this.pos_y = e.changedTouches[0].clientY;

      // Limita o botao
      let ax = this.pos_x - this.pos_X;
      let ay = this.pos_y - this.pos_Y;

      // Calcula a magnitude de ax e ay
      let mag = Math.sqrt(ax * ax + ay * ay);

      // Calcula o vetor unitário (dx,dy)
      this.dx = ax / mag;
      this.dy = ay / mag;

      if (mag > this.R) {
        this.pos_x = this.pos_X + (this.dx * this.R);
        this.pos_y = this.pos_Y + (this.dy * this.R);
      }
    });

    canvas.addEventListener('touchend', (e) => {
      // redefine quando o botão for solto
      this.pos_x = this.pos_X;
      this.pos_y = this.pos_Y;
      this.dx = 0;
      this.dy = 0;
    });
  }
}

function createAnalog(x, y, radius) {
  return analog = new Analog(x, y, radius);
}
