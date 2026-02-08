let socket;
let permissionGranted = false;
let bubbles = []; 
let shockwaves = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  // 初始化背景气泡
  for(let i=0; i<50; i++) {
    bubbles.push(new Bubble());
  }

  // === 英文按钮 ===
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("✨ TAP TO START ✨");
    btn.position(width/2 - 90, height/2 - 25);
    btn.size(180, 50);
    btn.style("background", "rgba(0,0,0,0.3)"); // 半透明黑底
    btn.style("border", "2px solid #FFD700");
    btn.style("color", "#FFD700");
    btn.style("font-family", "Arial");
    btn.style("font-weight", "bold");
    btn.style("border-radius", "25px");
    btn.style("backdrop-filter", "blur(5px)");
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(r => { if (r == 'granted') { permissionGranted = true; btn.hide(); } });
    });
  } else { permissionGranted = true; }
}

function draw() {
  background(20, 0, 5); // 深邃背景
  
  for(let b of bubbles) {
    b.update();
    b.display();
  }
  
  if (!permissionGranted) return;

  for (let i = shockwaves.length - 1; i >= 0; i--) {
    shockwaves[i].update();
    shockwaves[i].display();
    if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
  }

  // === 英文 UI 排版 ===
  push();
  translate(width/2, height/2);
  textAlign(CENTER, CENTER);
  
  // 发光的主标题
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = color(255, 50, 50);
  
  fill(255, 215, 0);
  textSize(50);
  textStyle(BOLD);
  text("SHAKE", 0, -20); // 改成了 SHAKE
  
  // 副标题
  textSize(16);
  textStyle(NORMAL);
  fill(255, 255, 255, 200);
  noStroke();
  drawingContext.shadowBlur = 0;
  text("TO TOSS LUCK", 0, 35); // 改成了英文提示
  pop();

  // 摇动检测
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  if (shake > 35) { 
    triggerThrow();
  }
}

let lastThrow = 0;
function triggerThrow() {
  if (millis() - lastThrow > 300) { // 冷却时间缩短，可以疯狂摇
    socket.emit('throw', { type: 'chaos' }); 
    if (navigator.vibrate) navigator.vibrate(50);
    shockwaves.push(new Shockwave());
    lastThrow = millis();
  }
}

class Bubble {
  constructor() { this.reset(); this.y = random(height); }
  reset() {
    this.x = random(width); this.y = height + 10;
    this.size = random(2, 6); this.speed = random(1, 4);
    this.alpha = random(50, 150);
  }
  update() { this.y -= this.speed; if (this.y < -10) this.reset(); }
  display() { noStroke(); fill(255, 215, 0, this.alpha); ellipse(this.x, this.y, this.size); }
}

class Shockwave {
  constructor() { this.size = 10; this.alpha = 255; }
  update() { this.size += 25; this.alpha -= 10; } // 扩散得更快
  display() { noFill(); stroke(255, 215, 0, this.alpha); strokeWeight(8); ellipse(width/2, height/2, this.size); }
}