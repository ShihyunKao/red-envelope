let socket;
let particles = [];
const EMOJIS = ["🧧", "💰", "✨", "🍊", "🧨", "💎"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  textAlign(CENTER, CENTER);
  
  // 设置文字字体，如果没有特定字体，p5会用默认的
  textFont('Georgia'); 
  
  socket.on('new_envelope', () => {
    explode();
  });
}

function draw() {
  // 1. 关键技巧：不要完全清空背景，而是覆盖一层半透明的黑
  // 这会产生美丽的“长曝光拖尾”效果
  background(10, 5, 20, 40); // 最后的 40 是透明度 (0-255)

  // 2. 开启发光混合模式 (会让颜色越叠越亮)
  blendMode(ADD);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // 3. 恢复正常混合模式绘制背景文字（否则文字会糊掉）
  blendMode(BLEND);
  drawBackgroundText();
}

function drawBackgroundText() {
  push();
  translate(width/2, height/2);
  noStroke();
  fill(255, 255, 255, 5); // 极淡的背景字
  textSize(min(width, height) * 0.4);
  text("福", 0, 0);
  pop();
}

function explode() {
  // 每次爆炸生成 Emoji 和 细小的火花
  let startX = random(width * 0.2, width * 0.8);
  let startY = height; // 从底部发射

  // 生成 Emoji (主粒子)
  for (let i = 0; i < 15; i++) {
    particles.push(new EmojiParticle(startX, startY));
  }
  
  // 生成金色火花 (氛围粒子)
  for (let i = 0; i < 30; i++) {
    particles.push(new Sparkle(startX, startY));
  }
}

// === 主角：Emoji 粒子 ===
class EmojiParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // 向上的爆发力
    this.vel = createVector(random(-6, 6), random(-18, -12)); 
    this.acc = createVector(0, 0.4); // 重力
    this.content = random(EMOJIS);
    this.size = random(30, 60);
    this.life = 255;
    this.rotateSpeed = random(-0.1, 0.1);
    this.angle = random(TWO_PI);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.vel.mult(0.96); // 空气阻力 (关键！让它们炸开后有悬浮感)
    this.life -= 4;
    this.angle += this.rotateSpeed;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    
    // 文字发光效果
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(255, 200, 50, this.life);
    
    textSize(this.size);
    fill(255, 255, 255, this.life);
    text(this.content, 0, 0);
    pop();
  }

  isDead() {
    return this.life < 0;
  }
}

// === 配角：金色火花 ===
class Sparkle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-4, 4), random(-15, -5));
    this.acc = createVector(0, 0.2); // 较轻的重力
    this.life = 255;
    this.color = color(random([ '#FFD700', '#FF4500', '#FFFFFF' ]));
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 6; // 消失得更快
  }

  display() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.life);
    // 随机大小闪烁
    let s = random(2, 5); 
    ellipse(this.pos.x, this.pos.y, s);
  }

  isDead() {
    return this.life < 0;
  }
}