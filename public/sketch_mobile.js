let socket;
let permissionGranted = false;
let shockwaves = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io();
  
  if (typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function') {
    let btn = createButton("TAP TO START");
    btn.position(width/2 - 80, height/2 - 25);
    btn.size(160, 50);
    // Frosted glass texture style
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
  // Advanced crimson gradient background
  setGradient(0, 0, width, height, color(20, 0, 5), color(40, 0, 10));
  
  if (!permissionGranted) return;

  // Draw the shock wave
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    shockwaves[i].update();
    shockwaves[i].display();
    if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
  }

  // === UI ===
  push();
  translate(width/2, height/2);
  textAlign(CENTER, CENTER);
  
  // Main Title: Breathing Light Effect
  let glow = 20 + sin(frameCount * 0.05) * 10;
  drawingContext.shadowBlur = glow;
  drawingContext.shadowColor = color(255, 215, 0, 150);
  
  fill(255, 215, 0);
  noStroke();
  textSize(40);
  textStyle(BOLD);
  textFont('Helvetica');
  text("SHAKE", 0, -15);
  
  // Subtitle
  drawingContext.shadowBlur = 0; 
  textSize(12);
  textStyle(NORMAL);
  fill(255, 255, 255, 100); 
  text("TO RELEASE FORTUNE", 0, 25);
  pop();

  // Shake detection
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  if (shake > 35) { 
    triggerThrow();
  }
}

// Linear gradient helper function
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
    strokeWeight(2); 
    ellipse(width/2, height/2, this.size); 
  }
}