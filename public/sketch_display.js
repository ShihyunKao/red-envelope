let socket;
let particles = [];
const MAX_PARTICLES = 800; // 粒子上限，防止卡顿

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  colorMode(HSB, 360, 100, 100, 100);
  background(0); // 纯黑底色，突出金色
  noCursor(); // 隐藏鼠标，纯展示

  socket.on('new_envelope', () => {
    explode();
  });
}

function draw() {
  // 关键技巧：不要每次都清空背景。
  // 而是画一层极高透明度的黑色。这会产生“长曝光”的光轨效果。
  fill(0, 0, 0, 10); // 透明度 10/100
  noStroke();
  rect(0, 0, width, height);

  // 启用叠加混合模式，让粒子重叠的地方发光（Bloom效果）
  blendMode(ADD);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  // 恢复默认混合模式，否则背景画不上去
  blendMode(BLEND);
  
  // 画一个极其淡的“福”字在背景里，像水印一样
  drawBackgroundText();
}

function drawBackgroundText() {
  push();
  translate(width/2, height/2);
  textAlign(CENTER, CENTER);
  textSize(min(width, height) * 0.4);
  fill(350, 80, 80, 2); // 极淡的红色，几乎看不见
  text("福", 0, 0);
  pop();
}

function explode() {
  // 每次爆发产生 100 个粒子
  let startX = random(width * 0.2, width * 0.8);
  let startY = random(height * 0.2, height * 0.8);
  
  // 或者是从屏幕中心爆发
  // startX = width/2; startY = height/2;

  for (let i = 0; i < 100; i++) {
    particles.push(new GoldParticle(startX, startY));
  }
}

// === 金沙粒子类 ===
class GoldParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // 随机向四周爆发
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 10)); // 爆发速度
    this.acc = createVector(0, 0);
    
    this.life = 255.0;
    this.decay = random(1, 3); // 消失速度
    
    // 颜色：在金色(45)到橙色(30)之间浮动
    this.hue = random(35, 50); 
    this.size = random(2, 6);
  }

  update() {
    this.vel.mult(0.96); // 摩擦力，粒子会慢慢停下来
    this.life -= this.decay;
    
    // 加一点点随机流动感（布朗运动），让它像烟雾一样
    this.vel.x += random(-0.1, 0.1);
    this.vel.y += random(-0.1, 0.1);
    
    // 稍微向下的重力，像金粉洒落
    this.vel.y += 0.05; 

    this.pos.add(this.vel);
  }

  display() {
    // 粒子越死越小
    let r = map(this.life, 0, 255, 0, this.size);
    
    // 颜色设置：高亮度，透明度随生命值变化
    fill(this.hue, 80, 100, map(this.life, 0, 255, 0, 100));
    noStroke();
    ellipse(this.pos.x, this.pos.y, r);
  }

  isDead() {
    return this.life < 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}