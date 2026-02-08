let socket;
let envelopes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();

  // 监听服务器发来的 'new_envelope' 信号
  socket.on('new_envelope', (data) => {
    // 生成一个新红包
    envelopes.push(new RedPacket());
  });
}

function draw() {
  background(20); // 黑色背景，也可以换成你朋友的窗花图
  
  for (let i = envelopes.length - 1; i >= 0; i--) {
    envelopes[i].update();
    envelopes[i].display();
    
    // 掉出屏幕就删掉
    if (envelopes[i].y > height + 50) {
      envelopes.splice(i, 1);
    }
  }
  
  fill(255);
  textAlign(CENTER);
  text("等待手机投喂...", width/2, height - 20);
}

class RedPacket {
  constructor() {
    this.x = random(width);
    this.y = -50;
    this.speed = random(5, 12);
    this.size = random(40, 80);
    this.angle = random(TWO_PI);
  }
  
  update() {
    this.y += this.speed;
    this.angle += 0.05;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // 红包样子
    fill(230, 0, 0);
    stroke(255, 215, 0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size * 1.4);
    
    // 中间的字
    fill(255, 215, 0);
    noStroke();
    textSize(this.size * 0.5);
    textAlign(CENTER, CENTER);
    text("￥", 0, 0);
    
    pop();
  }
}