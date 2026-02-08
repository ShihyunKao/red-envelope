let socket;
let objects = []; // 存放红包和金币

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  socket.on('new_envelope', (data) => {
    // 每次收到信号，生成一个红包
    objects.push(new BigEnvelope());
  });
}

function draw() {
  // 这种写法会产生“残影/拖尾”效果，非常有动感
  background(0, 0, 0, 25); 

  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].update();
    objects[i].display();
    
    // 如果完成了使命（比如金币掉出屏幕，或红包炸裂了），就删掉
    if (objects[i].isDead()) {
      // 如果是红包死掉了，就生成一堆小金币（爆炸效果）
      if (objects[i] instanceof BigEnvelope) {
        spawnGoldRain(objects[i].x, objects[i].y);
      }
      objects.splice(i, 1);
    }
  }
}

// 产生金币雨的函数
function spawnGoldRain(x, y) {
  for (let i = 0; i < 20; i++) { // 每次炸出20个金币
    objects.push(new GoldCoin(x, y));
  }
}

// === 类：大红包 ===
class BigEnvelope {
  constructor() {
    this.x = random(100, width - 100);
    this.y = -100;
    this.vx = random(-2, 2); // 水平稍微漂移
    this.vy = random(5, 10); // 下落速度
    this.angle = random(TWO_PI);
    this.rotSpeed = random(-0.1, 0.1);
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.rotSpeed;
    
    // 碰到地面就“死掉”（触发爆炸）
    if (this.y > height - 100) {
      this.dead = true;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // 红包样子
    fill(220, 20, 60);
    stroke(255, 215, 0);
    strokeWeight(3);
    rect(0, 0, 80, 120, 5);
    
    // 金色“福”字
    fill(255, 215, 0);
    noStroke();
    textSize(40);
    text("福", 0, 0);
    pop();
  }

  isDead() {
    return this.dead;
  }
}

// === 类：小金币 ===
class GoldCoin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-5, 5); // 向四周炸开
    this.vy = random(-10, -5); // 向上弹起
    this.gravity = 0.4; // 重力
    this.life = 255; // 寿命（透明度）
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; // 受到重力影响加速下落
    this.life -= 4; // 慢慢消失
  }

  display() {
    noStroke();
    fill(255, 215, 0, this.life); // 金色，带透明度
    ellipse(this.x, this.y, 15, 15);
  }

  isDead() {
    return this.life < 0 || this.y > height;
  }
}