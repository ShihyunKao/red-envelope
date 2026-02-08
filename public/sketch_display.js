let socket;
let particles = [];
// 只要这几个高颜值的 Emoji
const EMOJIS = ["🧧", "💰", "✨", "🍊", "💎"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  textAlign(CENTER, CENTER);
  
  socket.on('new_envelope', () => {
    explode();
  });
}

function draw() {
  // 1. 拖尾效果 (保留这个！这是产生流动感的关键)
  // 这里的 30 是透明度，数值越小拖尾越长
  background(0, 0, 0, 30); 

  // 2. 开启发光混合模式 (让 Emoji 像霓虹灯一样)
  blendMode(ADD);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // 3. 绘制背景字 (切换回正常混合模式，否则字看不清)
  blendMode(BLEND);
  drawBackgroundText();
}

function drawBackgroundText() {
  push();
  translate(width/2, height/2);
  noStroke();
  fill(255, 255, 255, 15); // 极淡的白色，不抢眼
  textSize(min(width, height) * 0.4);
  text("福", 0, 0); 
  pop();
}

function explode() {
  // 每次喷射 15 个粒子
  for (let i = 0; i < 15; i++) {
    particles.push(new NeonParticle());
  }
}

// === 霓虹粒子类 ===
class NeonParticle {
  constructor() {
    // 从屏幕底部随机位置发射
    this.pos = createVector(random(width * 0.3, width * 0.7), height + 20);
    
    // === 关键修正：强力向上喷射 ===
    // random(-25, -12) 保证了它们能冲到屏幕最顶端
    this.vel = createVector(random(-10, 10), random(-25, -12)); 
    
    this.acc = createVector(0, 0.4); // 适中的重力
    
    this.content = random(EMOJIS);
    this.size = random(30, 60);
    this.life = 255;
    this.angle = random(TWO_PI);
    this.rotSpeed = random(-0.1, 0.1);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    this.angle += this.rotSpeed;
    this.life -= 1.5; // 寿命

    // === 关键修正：墙壁反弹 (让它们乱飞) ===
    
    // 左右反弹
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -0.8; 
      this.pos.x = constrain(this.pos.x, 0, width);
    }
    
    // 天花板反弹 (防止飞出屏幕)
    if (this.pos.y < 0) {
      this.vel.y *= -0.6; // 撞到顶掉下来
      this.pos.y = 0;
    }

    // 地面反弹
    if (this.pos.y > height) {
      this.vel.y *= -0.7;
      this.pos.y = height;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    
    // 金色光晕 (保留这个高级感)
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(255, 100, 50, this.life); // 偏红橙色的暖光
    
    textSize(this.size);
    // 使用 life 控制透明度，慢慢消失
    fill(255, 255, 255, this.life);
    text(this.content, 0, 0);
    pop();
  }

  isDead() {
    return this.life < 0;
  }
}