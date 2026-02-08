let socket;
let permissionGranted = false;
let energy = 0; // 能量值

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  colorMode(HSB, 360, 100, 100, 100); // 使用 HSB 颜色模式，颜色更高级
  
  // 极简的授权点击区域（整个屏幕）
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    // 创建一个全屏透明按钮
    let btn = createButton("");
    btn.position(0, 0);
    btn.size(width, height);
    btn.style("background", "transparent");
    btn.style("border", "none");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r == 'granted') { permissionGranted = true; btn.hide(); } });
    });
  } else { permissionGranted = true; }
}

function draw() {
  // 1. 高级渐变背景 (深朱红 -> 深紫红)
  drawGradient();

  if (!permissionGranted) {
    fill(45, 100, 100);
    textAlign(CENTER);
    textSize(16);
    text("Tap screen to start", width/2, height/2);
    return;
  }

  // 2. 计算摇动强度
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  
  // 能量衰减（平滑过渡）
  energy = lerp(energy, 0, 0.1);

  // 3. 核心交互：光环
  // 摇动越强，圆圈越大，颜色越亮
  if (shake > 30) {
    energy = 100;
    triggerThrow();
  }

  // 画中心的光晕
  noStroke();
  // 外层光晕
  fill(45, 80, 100, 20); // 金色，低透明度
  ellipse(width/2, height/2, 150 + energy * 2);
  
  // 内层核心
  fill(45, energy, 100, 80); // 摇动时变白
  ellipse(width/2, height/2, 100 + energy);

  // 文字
  fill(0, 0, 100, 50); // 淡淡的白色
  textSize(14);
  textAlign(CENTER, CENTER);
  text("SHAKE TO SEND LUCK", width/2, height - 50);
}

// 辅助：画背景
function drawGradient() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    // HSB: 350(深红) -> 330(深紫红)
    let c = color(340, 90, map(y, 0, height, 20, 10)); 
    stroke(c);
    line(0, y, width, y);
  }
}

let lastThrow = 0;
function triggerThrow() {
  if (millis() - lastThrow > 400) { // 稍微快一点的频率
    socket.emit('throw', { force: 1 }); 
    if (navigator.vibrate) navigator.vibrate(50); // 短促有力的震动
    lastThrow = millis();
  }
}