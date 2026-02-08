let socket;
let permissionGranted = false;
let bubbles = []; // 背景气泡
let shockwaves = []; // 摇动时的冲击波

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  // 初始化背景气泡
  for(let i=0; i<50; i++) {
    bubbles.push(new Bubble());
  }

  // 授权按钮逻辑（美化版）
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("✨ 解锁除夕 ✨");
    btn.position(width/2 - 80, height/2 - 25);
    btn.size(160, 50);
    btn.style("background", "transparent");
    btn.style("border", "2px solid #FFD700");
    btn.style("color", "#FFD700");
    btn.style("font-size", "18px");
    btn.style("border-radius", "25px");
    btn.style("backdrop-filter", "blur(10px)");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r == 'granted') { permissionGranted = true; btn.hide(); } });
    });
  } else { permissionGranted = true; }
}

function draw() {
  // 1. 深红渐变背景
  background(20, 0, 5); 
  
  // 2. 绘制上升的金色气泡
  for(let b of bubbles) {
    b.update();
    b.display();
  }
  
  if (!permissionGranted) return;

  // 3. 绘制摇动产生的冲击波
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    shockwaves[i].update();
    shockwaves[i].display();
    if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
  }

  // 4. 中央文字 UI
  push();
  translate(width/2, height/2);
  textAlign(CENTER, CENTER);
  
  // 发光文字效果
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = color(255, 50, 50);
  
  fill(255, 215, 0);
  textSize(40);
  text("摇", 0, -20);
  
  textSize(14);
  fill(255, 255, 255, 150);
  noStroke();
  drawingContext.shadowBlur = 0; // 关闭阴影
  text("SHAKE DEVICE", 0, 30);
  pop();

  // === 摇动检测 ===
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  if (shake > 35) { 
    triggerThrow();
  }
}

let lastThrow = 0;
function triggerThrow() {
  if (millis() - lastThrow > 400) {
    socket.emit('throw', { type: 'glow' }); 
    if (navigator.vibrate) navigator.vibrate(50);
    
    // 视觉反馈：添加一个冲击波
    shockwaves.push(new Shockwave());
    lastThrow = millis();
  }
}

// === 装饰类：背景气泡 ===
class Bubble {
  constructor() {
    this.reset();
    this.y = random(height); // 初始满屏分布
  }
  reset() {
    this.x = random(width);
    this.y = height + 10;
    this.size = random(2, 6);
    this.speed = random(1, 3);
    this.alpha = random(50, 150);
  }
  update() {
    this.y -= this.speed;
    if (this.y < -10) this.reset();
  }
  display() {
    noStroke();
    fill(255, 215, 0, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

// === 反馈类：冲击波 ===
class Shockwave {
  constructor() {
    this.size = 10;
    this.alpha = 255;
  }
  update() {
    this.size += 15; // 扩散速度
    this.alpha -= 10; // 消失速度
  }
  display() {
    noFill();
    stroke(255, 215, 0, this.alpha);
    strokeWeight(5);
    ellipse(width/2, height/2, this.size);
  }
}