let socket;
let particles = [];
// 我们要用的素材库：不用加载图片，直接用 Emoji！
const EMOJIS = ["🧧", "💰", "🍊", "🧨", "✨", "🐉", "💎"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  textAlign(CENTER, CENTER);
  
  socket.on('new_envelope', () => {
    fireworks();
  });
}

function draw() {
  // 这里的透明度决定了“拖尾”的长短。20比较长，50比较短。
  background(10, 5, 20, 40); // 深邃的夜空紫黑色

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// === 触发烟花爆炸 ===
function fireworks() {
  // 一次生成 30-50 个粒子
  let count = random(30, 50);
  let startX = random(width * 0.2, width * 0.8);
  let startY = height + 50; // 从屏幕底部冲上来，或者从中间炸开
  
  // 也可以改为从屏幕上方掉落，看你喜好。这里设定为从中间炸开：
  startX = random(width);
  startY = -50; 

  for (let i = 0; i < count; i++) {
    particles.push(new EmojiParticle(startX, startY));
  }
}

// === 粒子类 ===
class EmojiParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // 随机选择一个 Emoji
    this.content = random(EMOJIS);
    this.size = random(24, 60); // 大小随机
    
    // 物理属性：向四周炸开
    this.vx = random(-8, 8); 
    this.vy = random(0, 15); // 向下冲
    
    this.gravity = 0.4; // 重力
    this.friction = 0.96; // 空气阻力
    this.life = 255; // 寿命
    
    this.angle = random(TWO_PI); // 初始角度
    this.rotSpeed = random(-0.2, 0.2); // 旋转速度
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.friction; // 慢慢减速
    
    this.angle += this.rotSpeed;
    this.life -= 2; // 慢慢消失

    // === 地面反弹效果 ===
    if (this.y > height - this.size) {
      this.y = height - this.size;
      this.vy *= -0.6; // 反弹，并且损失一点能量
      this.rotSpeed *= 0.5; // 地面摩擦让旋转变慢
    }
    
    // === 墙壁反弹 ===
    if (this.x < 0 || this.x > width) {
      this.vx *= -0.8;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // 让它稍微有点发光的感觉
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(255, 215, 0); // 金色光晕
    
    textSize(this.size);
    // 根据寿命设置透明度
    fill(255, 255, 255, this.life); 
    text(this.content, 0, 0);
    
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}