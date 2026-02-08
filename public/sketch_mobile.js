let socket;
let permissionGranted = false;
let envelopeY; // 红包的Y坐标
let isFlying = false; // 是否正在飞出去

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  // 初始化红包位置在屏幕中间
  envelopeY = height / 2;

  // 这里的授权按钮代码保持不变
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("点击开启撒币模式");
    btn.position(width/2 - 70, height/2);
    btn.size(140, 50);
    btn.style("font-size", "16px");
    btn.style("background", "#ffd700");
    btn.style("border", "none");
    btn.style("border-radius", "10px");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response == 'granted') {
            permissionGranted = true;
            btn.hide();
          }
        })
        .catch(console.error);
    });
  } else {
    permissionGranted = true;
  }
}

function draw() {
  background(160, 0, 0); // 更高级的深红背景
  
  if (!permissionGranted) return;

  // 画红包
  push();
  translate(width / 2, envelopeY);
  
  // 红包身体
  fill(220, 20, 60);
  stroke(255, 215, 0); // 金边
  strokeWeight(4);
  rectMode(CENTER);
  rect(0, 0, 160, 240, 15);
  
  // 红包盖子线条
  noFill();
  stroke(255, 215, 0);
  arc(0, -60, 140, 100, 0, PI);

  // 中间的“福”字
  fill(255, 215, 0);
  noStroke();
  textSize(80);
  textAlign(CENTER, CENTER);
  text("福", 0, 20);
  pop();

  // === 飞出动画逻辑 ===
  if (isFlying) {
    envelopeY -= 30; // 快速向上飞
    if (envelopeY < -150) {
      // 飞出屏幕后重置
      isFlying = false;
      envelopeY = height / 2;
    }
  } else {
    // === 只有没在飞的时候才检测摇动 ===
    let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
    if (shake > 30) { // 稍微降低一点阈值，更灵敏
       triggerThrow();
    }
  }
}

function triggerThrow() {
  if (!isFlying) {
    isFlying = true;
    socket.emit('throw', { type: 'gold' }); // 发送信号
    if (navigator.vibrate) navigator.vibrate(100);
  }
}