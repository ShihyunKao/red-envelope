let socket;
let permissionGranted = false;
let pulse = 0; // 呼吸灯变量

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  // 简单的点击授权逻辑
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("🏮 点击解锁新年运势 🏮");
    btn.position(width/2 - 100, height/2 - 25);
    btn.size(200, 50);
    btn.style("background", "linear-gradient(45deg, #ff0000, #ffcc00)");
    btn.style("border", "none");
    btn.style("border-radius", "25px");
    btn.style("color", "white");
    btn.style("font-weight", "bold");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r == 'granted') { permissionGranted = true; btn.hide(); } });
    });
  } else { permissionGranted = true; }
}

function draw() {
  // 渐变背景
  setGradient(0, 0, width, height, color(100, 0, 0), color(50, 0, 0));
  
  if (!permissionGranted) return;

  // 计算呼吸效果
  pulse = sin(frameCount * 0.1) * 20;

  // 画一个巨大的发光按钮
  push();
  translate(width/2, height/2);
  
  // 外发光圈
  noFill();
  stroke(255, 215, 0, 100);
  strokeWeight(2);
  ellipse(0, 0, 200 + pulse, 200 + pulse);
  stroke(255, 215, 0, 50);
  ellipse(0, 0, 240 + pulse, 240 + pulse);

  // 中心圆
  fill(200, 0, 0);
  noStroke();
  ellipse(0, 0, 180, 180);

  // 文字
  fill(255, 215, 0);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("福", 0, -10);
  textSize(20);
  fill(255, 255, 255, 200);
  text("用力挥动手机!", 0, 60);
  pop();

  // === 摇动检测 ===
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  if (shake > 35) { 
    triggerThrow();
  }
}

// 辅助函数：背景渐变
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
  if (millis() - lastThrow > 600) {
    socket.emit('throw', { type: 'mixed' }); 
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // 更有节奏的震动
    background(255, 215, 0); // 闪一下金色
    lastThrow = millis();
  }
}