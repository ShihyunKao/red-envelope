let socket;
let particles = [];
// Emoji
const EMOJIS = ["🧧", "💰", "✨", "🍊", "💎"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  textAlign(CENTER, CENTER);
  
  socket.on('new_envelope', () => {
    explode();
  });
}

function draw() {
  // 1. trailing effect
  background(0, 0, 0, 30); 

  // 2. Enable the glow blending mode (making emojis look like neon lights)
  blendMode(ADD);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // 3. Draw background text
  blendMode(BLEND);
  drawBackgroundText();
}

function drawBackgroundText() {
  push();
  translate(width/2, height/2);
  noStroke();
  fill(255, 255, 255, 15); 
  textSize(min(width, height) * 0.4);
  text("福", 0, 0); 
  pop();
}

function explode() {
  // 15 particles are ejected each time
  for (let i = 0; i < 15; i++) {
    particles.push(new NeonParticle());
  }
}

// === Neon Particle Class ===
class NeonParticle {
  constructor() {
    // Launch from a random position at the bottom of the screen
    this.pos = createVector(random(width * 0.3, width * 0.7), height + 20);
    
    // === Powerfully jetting upward ===
    // random(-25, -12) ensures that they can rush to the top of the screen
    this.vel = createVector(random(-10, 10), random(-25, -12)); 
    
    this.acc = createVector(0, 0.4); // Moderate gravity
    
    this.content = random(EMOJIS);
    this.size = random(30, 60);
    this.life = 255;
    this.angle = random(TWO_PI);
    this.rotSpeed = random(-0.1, 0.1);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    this.angle += this.rotSpeed;
    this.life -= 1.5; 

    // === Wall rebound (let them fly around) ===
    
    // Rebound left and right
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -0.8; 
      this.pos.x = constrain(this.pos.x, 0, width);
    }
    
    // Ceiling rebound (prevents flying out of the screen)
    if (this.pos.y < 0) {
      this.vel.y *= -0.6; // Hit the top and fall down
      this.pos.y = 0;
    }

    // Ground rebound
    if (this.pos.y > height) {
      this.vel.y *= -0.7;
      this.pos.y = height;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    
    // Golden halo
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(255, 100, 50, this.life); // 偏红橙色的暖光
    
    textSize(this.size);
    // Use life to control transparency and make it fade away gradually.
    fill(255, 255, 255, this.life);
    text(this.content, 0, 0);
    pop();
  }

  isDead() {
    return this.life < 0;
  }
}