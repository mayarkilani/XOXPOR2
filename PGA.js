let player;
let obstacles = [];
let coins = [];
let score = 0;
let gameOver = false;
let gameSpeed = 8; 
let speedIncrease = 0.002; 

let jumpSound, failSound, bgMusic;

function preload() {
  soundFormats('mp3', 'wav');
  // تأكد من وجود الملفات في مجلد المشروع
  jumpSound = loadSound('Mario Jump.mp3'); 
  failSound = loadSound('ganeove.mp3');
  bgMusic = loadSound('music.mp3'); 
}

function setup() {
  // جعل الكانفاس يتناسب مع حجم شاشة الموبايل
  createCanvas(windowWidth, windowHeight > 400 ? 400 : windowHeight);
  
  if (bgMusic) {
    bgMusic.setVolume(0.3);
    bgMusic.loop(); 
  }
  resetGame();
}

// تحديث حجم اللعبة إذا تغير اتجاه الشاشة
function windowResized() {
  resizeCanvas(windowWidth, windowHeight > 400 ? 400 : windowHeight);
}

function resetGame() {
  score = 0;
  gameSpeed = 8;
  obstacles = [];
  coins = [];
  player = new Player();
  gameOver = false;
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.loop();
  }
  loop();
}

// دعم لوحة المفاتيح (للكمبيوتر)
function keyPressed() {
  if (key == ' ' && !gameOver) {
    handleJump();
  }
}

// دعم اللمس (للموبايل)
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (gameOver) {
    // التحقق مما إذا كان اللمس فوق زر إعادة المحاولة
    if (mouseX > width/2 - 80 && mouseX < width/2 + 80 && mouseY > height/2 + 20 && mouseY < height/2 + 70) {
      resetGame();
    }
  } else {
    handleJump();
  }
  return false; // لمنع السحب الافتراضي في المتصفح
}

function handleJump() {
  player.jump();
  if (jumpSound && jumpSound.isLoaded()) {
    jumpSound.play();
  }
}

function draw() {
  background(50, 150, 200);

  if (!gameOver) {
    gameSpeed += speedIncrease; 
  }

  drawRoad(); 

  player.update();
  player.show();

  let spawnRate = Math.max(40, 90 - Math.floor(gameSpeed * 2)); 
  if (frameCount % spawnRate == 0) {
    obstacles.push(new Obstacle());
  }

  if (frameCount % 120 == 0) {
    coins.push(new Coin());
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].move();
    obstacles[i].show();
    if (player.hits(obstacles[i])) endGame();
    if (obstacles[i].x < -50) obstacles.splice(i, 1);
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    coins[i].move();
    coins[i].show();
    if (player.collects(coins[i])) {
      score += 10;
      coins.splice(i, 1);
    }
    if (coins[i] && coins[i].x < -50) coins.splice(i, 1);
  }

  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT);
  text("النقاط: " + score, 20, 30);
}

function drawRoad() {
  fill(80);
  noStroke();
  rect(0, height - 50, width, 50);
  stroke(255);
  strokeWeight(3);
  let lineSpacing = 100;
  let offset = (frameCount * gameSpeed) % lineSpacing;
  for (let x = width + lineSpacing; x > -lineSpacing; x -= lineSpacing) {
    line(x - offset, height - 25, x - offset - 40, height - 25);
  }
  noStroke();
}

function endGame() {
  gameOver = true;
  if (bgMusic && bgMusic.isPlaying()) bgMusic.stop();
  if (failSound && failSound.isLoaded()) failSound.play();
  noLoop();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(35);
  text("انتهت اللعبة!", width / 2, height / 2 - 20);
  fill(255, 204, 0);
  rect(width/2 - 80, height/2 + 20, 160, 50, 15);
  fill(0);
  textSize(20);
  text("إعادة المحاولة", width / 2, height / 2 + 52);
}

class Player {
  constructor() {
    this.r = 50;
    this.x = 40;
    this.y = height - this.r - 50;
    this.vy = 0;
    this.gravity = 1.5; // تقليل الجاذبية قليلاً لتناسب شاشات الموبايل
  }
  jump() { 
    if (this.y == height - this.r - 50) {
      this.vy = -20; 
    }
  }
  update() {
    this.y += this.vy;
    this.vy += this.gravity;
    this.y = constrain(this.y, 0, height - this.r - 50);
  }
  show() {
    fill(255, 204, 0);
    stroke(0);
    rect(this.x, this.y, this.r, this.r, 5);
  }
  hits(obs) { 
    return (this.x + this.r > obs.x && this.x < obs.x + obs.w && this.y + this.r > obs.y); 
  }
  collects(coin) {
    let d = dist(this.x + this.r/2, this.y + this.r/2, coin.x + coin.r/2, coin.y + coin.r/2);
    return (d < this.r/2 + coin.r/2);
  }
}

class Obstacle {
  constructor() {
    this.h = 60;
    this.w = 40;
    this.x = width;
    this.y = height - this.h - 50;
  }
  move() { this.x -= gameSpeed; }
  show() {
    fill(250, 50, 50);
    stroke(0);
    rect(this.x, this.y, this.w, this.h, 3);
  }
}

class Coin {
  constructor() {
    this.r = 25;
    this.x = width;
    this.y = random(height - 200, height - 100);
  }
  move() { this.x -= gameSpeed; }
  show() {
    fill(255, 215, 0);
    stroke(184, 134, 11);
    ellipseMode(CORNER);
    ellipse(this.x, this.y, this.r, this.r);
  }
}