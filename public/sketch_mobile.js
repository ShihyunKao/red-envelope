let socket;
let permissionGranted = false;
let shockwaves = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  // 极简英文按钮
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("TAP TO START");
    btn.position(width/2 - 80, height/2 - 25);
    btn.size(160, 50);
    // 磨砂玻璃质感样式
    btn.style("background", "rgba(255, 215, 0, 0.1)");
    btn.style("border", "1px solid rgba(255, 215, 0, 0.5)");
    btn.style("color", "#FFD700");
    btn.style("font-family", "Helvetica, Arial, sans-serif");
    btn.style("letter-spacing", "2px");
    btn.style("font-size", "14px");
    btn.style("border-radius", "2px");
    btn.style("backdrop-filter", "blur(4px)");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r == 'granted') { permissionGranted = true; btn.hide(); } });
    });
  } else { permissionGranted = true; }
}

function draw() {
  // 高级深红渐变背景
  setGradient(0, 0, width, height, color(20, 0, 5), color(40, 0, 10));
  
  if (!permissionGranted) return;

  // 绘制冲击波
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    shockwaves[i].update();
    shockwaves[i].display();
    if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
  }

  // === 英文 UI 排版 (极简) ===
  push();
  translate(width/2, height/2);
  textAlign(CENTER, CENTER);
  
  // 主标题：呼吸发光效果
  let glow = 20 + sin(frameCount * 0.05) * 10;
  drawingContext.shadowBlur = glow;
  drawingContext.shadowColor = color(255, 215, 0, 150);
  
  fill(255, 215, 0);
  noStroke();
  textSize(40);
  textStyle(BOLD);
  textFont('Helvetica');
  text("SHAKE", 0, -15);
  
  // 副标题
  drawingContext.shadowBlur = 0; //这行很重要，防止小字模糊
  textSize(12);
  textStyle(NORMAL);
  fill(255, 255, 255, 100); // 降低透明度，拉开层次
  text("TO RELEASE FORTUNE", 0, 25);
  pop();

  // 摇动检测
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  if (shake > 35) { 
    triggerThrow();
  }
}

// 线性渐变辅助函数
function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

let lastThrow = 0;
function triggerThrow() {
  if (millis() - lastThrow > 300) {
    socket.emit('throw', { type: 'glow' }); 
    if (navigator.vibrate) navigator.vibrate(50);
    shockwaves.push(new Shockwave());
    lastThrow = millis();
  }
}

class Shockwave {
  constructor() { this.size = 10; this.alpha = 200; }
  update() { this.size += 20; this.alpha -= 8; }
  display() { 
    noFill(); 
    stroke(255, 215, 0, this.alpha); 
    strokeWeight(2); // 线条变细，更精致
    ellipse(width/2, height/2, this.size); 
  }
}