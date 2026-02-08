let socket;
let permissionGranted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io(); // 连接服务器

  // iOS 13+ 需要用户点击授权才能用传感器
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("点击授权开始扔红包");
    btn.position(width/2 - 70, height/2);
    btn.size(140, 50);
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
    // 安卓或旧手机直接通过
    permissionGranted = true;
  }
}

function draw() {
  background(180, 0, 0); // 深红色背景
  
  if (!permissionGranted) {
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text("需要授权才能检测动作", width/2, height/2 - 40);
    return;
  }

  // 画一个简单的红包图示
  fill(255, 0, 0);
  stroke(255, 215, 0); // 金色边框
  strokeWeight(5);
  rectMode(CENTER);
  rect(width/2, height/2, 150, 220, 10);
  
  noStroke();
  fill(255, 215, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("福", width/2, height/2);
  
  textSize(16);
  fill(255);
  text("用力挥动手机!", width/2, height - 50);

  // === 检测摇动 ===
  // 计算摇动强度
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  
  // 阈值设为 40 (需要用力甩)
  if (shake > 40) {
    throwEnvelope();
  }
}

let lastThrow = 0;
function throwEnvelope() {
  // 冷却时间 800毫秒，防止一次甩动发出几十个红包
  if (millis() - lastThrow > 800) {
    socket.emit('throw', { color: 'red' }); // 发送信号
    
    // 手机震动反馈 (如果支持)
    if (navigator.vibrate) navigator.vibrate(200);
    
    // 简单的视觉反馈：屏幕闪一下白
    background(255); 
    lastThrow = millis();
  }
}