var worldMap = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 2],
  [1, 0, 2, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 0, 4, 4, 1],
  [2, 0, 0, 0, 0, 0, 2],
  [1, 1, 1, 1, 1, 1, 1]
];

export function setWorldMap(array) {
  worldMap = array;
}

export const rayNode = (x,y,color) => {
  if(worldMap[y][x] == 0) {
    let block = new Node(x*50, y*50,50,50,color);
    block.addPhysicbody(false);
    worldMap[y][x] = color;
  }
}

export const mapTextures = [
  "#ff0000", // Cor 0 - Vermelho Puro
  "#ff4500", // Cor 1 - Laranja Avermelhado
  "#ff6347", // Cor 2 - Tomate
  "#ff1493", // Cor 3 - Rosa Escuro
  "#ff69b4", // Cor 4 - Rosa Claro
  "#ff8c00", // Cor 5 - Laranja Forte
  "#ffa500", // Cor 6 - Laranja
  "#ffd700", // Cor 7 - Dourado
  "#ffff00", // Cor 8 - Amarelo
  "#adff2f", // Cor 9 - Verde Limão
  "#32cd32", // Cor 10 - Verde
  "#00ff00", // Cor 11 - Verde Puro
  "#00ced1", // Cor 12 - Turquesa Escuro
  "#1e90ff", // Cor 13 - Azul Real
  "#0000ff", // Cor 14 - Azul Puro
  "#4b0082", // Cor 15 - Índigo
  "#800080", // Cor 16 - Roxo
  "#8b0000", // Cor 17 - Carmim
  "#2f4f4f", // Cor 18 - Cinza Escuro Esverdeado
  "#000000", // Cor 19 - Preto
];

// Câmera
export const camera = {
  x: 3.5,   // Posição inicial X
  y: 3.5,   // Posição inicial Y
  angle: 0, // Ângulo de visão inicial (em radianos)
  fov: Math.PI / 3, // Campo de visão (FOV)
  depth: 16 // Profundidade máxima dos raios
};

export function drawWorld() {
  const screenWidth = canvas.width;
  const screenHeight = canvas.height;
  const rays = [];

  for (let x = 0; x < screenWidth; x++) {
    const rayAngle = (camera.angle - camera.fov / 2) + (x / screenWidth) * camera.fov;
    const [rayX, rayY, hitDist, color] = castRay(rayAngle);
    const wallHeight = Math.min(screenHeight / hitDist, screenHeight);
    ctx.beginPath();
    ctx.globalAlpha = 0;
    ctx.fillStyle = mapTextures[color-1];
    ctx.globalAlpha = 1 - hitDist/12;
    ctx.fillRect(x, (screenHeight - wallHeight) / 2, 1, wallHeight);
    ctx.restore();
  }
}

// Função de lançamento de raio
function castRay(angle) {
  let dist = 0;
  let hit = false;
  let rayX = camera.x;
  let rayY = camera.y;
  let color = 1;

  // Deslocamento do raio
  const stepSize = 0.1;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  // Move o raio até colidir com uma parede
  while (!hit && dist < camera.depth) {
    dist += stepSize;
    rayX = camera.x + dx * dist;
    rayY = camera.y + dy * dist;

    // Checa se o raio atingiu uma parede
    const mapX = Math.floor(rayX);
    const mapY = Math.floor(rayY);

    if(worldMap[mapY] && worldMap[mapX]) if (worldMap[mapY] != 0 && worldMap[mapY][mapX] != 0) {
      hit = true; // O raio atingiu uma parede
      color = worldMap[mapY][mapX];
    }
  }

  return [rayX, rayY, dist, color];
}
