let socket;
let particles = [];
const EMOJIS = ["🧧", "💰", "✨", "🍊", "🧨", "💎", "🐉"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  textAlign(CENTER, CENTER);
  textFont('Arial'); 
  
  socket.on('new_envelope', () => {
    explode();
  });
}

function draw() {
  // 拖尾效果
  background(10, 5, 20, 30); 

  // 开启高亮混合模式
  blendMode(ADD);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  blendMode(BLEND);
  drawBackgroundText();
}

function drawBackgroundText() {
  push();
  translate(width/2, height/2);
  noStroke();
  fill(255, 255, 255, 10); // 极淡的背景
  // 计算字体大小，保证不撑破屏幕
  textSize(min(width, height) * 0.5);
  text("福", 0, 0); // 唯一保留的中文
  pop();
}

function explode() {
  // 每次发射一大把
  for (let i = 0; i < 20; i++) {
    particles.push(new CrazyParticle());
  }
}

// === 疯狂粒子类 ===
class CrazyParticle {
  constructor() {
    // 1. 从屏幕底部随机位置发射
    this.pos = createVector(random(width * 0.2, width * 0.8), height + 20);
    
    // 2. 初始速度：非常快！向上冲！
    // X轴随机散开，Y轴强力向上 (根据屏幕高度比例)
    this.vel = createVector(random(-15, 15), random(-height * 0.04, -height * 0.025));
    
    // 3. 较低的重力，让它们飞得更高
    this.acc = createVector(0, 0.25); 
    
    this.content = random(EMOJIS);
    this.size = random(40, 80); // 更大的图标
    this.life = 255;
    this.rotateSpeed = random(-0.2, 0.2);
    this.angle = random(TWO_PI);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    // 旋转起来
    this.angle += this.rotateSpeed;
    this.life -= 1.5; // 寿命更长，飞得更久

    // === 核心：四面反弹逻辑 ===
    
    // 1. 左右墙壁反弹
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -0.8; // 反弹并损失一点点能量
      // 把它拉回屏幕内，防止卡住
      this.pos.x = constrain(this.pos.x, 0, width);
    }

    // 2. 天花板反弹 (撞到顶部弹回来)
    if (this.pos.y < 0) {
      this.vel.y *= -0.8;
      this.pos.y = 0;
    }

    // 3. 地面反弹 (撞到底部再弹起来！)
    if (this.pos.y > height) {
      this.vel.y *= -0.7; // 地面摩擦大一点
      this.pos.y = height;
      
      // 如果速度太慢了，就不弹了，防止无限抖动
      if (abs(this.vel.y) < 2) {
        this.vel.y = 0;
      }
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    
    // 金色光晕
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = color(255, 200, 0, this.life);
    
    textSize(this.size);
    fill(255, 255, 255, this.life);
    text(this.content, 0, 0);
    pop();
  }

  isDead() {
    return this.life < 0;
  }
}