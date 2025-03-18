import "./styles.css";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = ctx.canvas.width; // (ctx.canvas.width = window.innerWidth);
const height = ctx.canvas.height; // (ctx.canvas.height = window.innerHeight);

const MAX_SPEED = 500;
const BOX_WIDTH = 15;
const BOX_HEIGHT = 100;

const ball = {
  x: width / 2,
  y: height / 2,
  r: 15,
  vx: 500,
  vy: 500,
  speed: 500
};

const player = {
  width: BOX_WIDTH,
  height: BOX_HEIGHT,
  x: 10,
  y: height / 2 - BOX_HEIGHT / 2,
  speed: MAX_SPEED,
  score: 0
};

const computer = {
  width: BOX_WIDTH,
  height: BOX_HEIGHT,
  x: width - BOX_WIDTH - 10,
  y: height / 2 - BOX_HEIGHT / 2,
  speed: MAX_SPEED,
  score: 0
};

const keys = {};

function onKeyDown(e) {
  keys[e.key] = true;
}

function onKeyUp(e) {
  keys[e.key] = false;
}

function checkBorder(box) {
  if (box.y < 0) box.y = 0;
  if (box.y + box.height > height) box.y = height - box.height;
}

function AIMove(box, delta) {
  if (box.y !== ball.y) {
    const diff = ball.y - (box.y + box.height / 2);
    const direction = diff > 0 ? 1 : -1;
    if (Math.abs(diff) <= box.speed * delta) {
      box.y = ball.y - box.height / 2;
    } else {
      box.y += box.speed * delta * direction;
    }
  }
}

function handleMove(delta) {
  if (keys.ArrowUp) {
    player.y -= player.speed * delta;
  }
  if (keys.ArrowDown) {
    player.y += player.speed * delta;
  }
  // AIMove(player, delta);
  checkBorder(player);

  AIMove(computer, delta);
  checkBorder(computer);
}

function setup() {
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  // startFpsCount();
  ctx.fillStyle = "white";
}

function resetBall() {
  ball.x = width / 2;
  ball.y = height / 2;
  ball.speed = 500;
  ball.vx = (ball.vx > 0 ? -1 : 1) * ball.speed;
  ball.vy = 0;
}

function checkCollision(rect, circle) {
  const distX = Math.abs(circle.x - rect.x - rect.width / 2);
  const distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX >= rect.width / 2 + circle.r) {
    return false;
  }
  if (distY >= rect.height / 2 + circle.r) {
    return false;
  }

  if (distX <= rect.width / 2) {
    return true;
  }
  if (distY <= rect.height / 2) {
    return true;
  }

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function update(delta) {
  const current = ball.x > width / 2 ? computer : player;

  if (ball.y - ball.r <= 0) {
    ball.y = ball.r;
    ball.vy = -ball.vy;
  }

  if (ball.y + ball.r >= height) {
    ball.y = height - ball.r;
    ball.vy = -ball.vy;
  }

  if (ball.x < 0) {
    computer.score++;
    resetBall();
  } else if (ball.x > width) {
    player.score++;
    resetBall();
  }

  if (checkCollision(current, ball)) {
    let collidePoint = ball.y - (current.y + current.height / 2);
    collidePoint = collidePoint / (current.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;
    const dir = ball.x > width / 2 ? -1 : 1;

    ball.vx = dir * ball.speed * Math.cos(angleRad);
    ball.vy = ball.speed * Math.sin(angleRad);

    ball.speed += 10;
  }

  handleMove(delta);

  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;
}

function drawBox(box) {
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawText(x, y, text) {
  ctx.font = "50px Arial";
  ctx.fillText(text, x, y);
}

function display() {
  drawBox(player);
  drawBox(computer);
  drawBall();
  drawText(width / 4, height / 10, player.score);
  drawText(width / 1.4, height / 10, computer.score);
}

let fpsInterval,
  fpsCount = 0,
  fps = 0;
function startFpsCount() {
  if (fpsInterval) {
    clearInterval(fpsInterval);
  } else {
    fpsInterval = setInterval(() => {
      fps = fpsCount;
      fpsCount = 0;
    }, 1000);
  }
}

function displayInfo(delta) {
  fpsCount++;
  // const f = (1000 / delta) | 0

  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(width - 75, 0, 100, 40);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(fps, width - 65, 30);
  ctx.closePath();
}

let then = 0;
function loop(now = 0) {
  let d = (now - then) / 1000;
  then = now;

  if (d >= 50) d = 50;

  ctx.clearRect(0, 0, width, height);

  update(d);
  display();
  // displayInfo(d);

  requestAnimationFrame(loop);
}

setup();
loop();
