const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let particles = [];
let mouse = { x: null, y: null };

window.addEventListener("mousemove", e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // mouse repulsion
    let dx = this.x - mouse.x;
    let dy = this.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 120) {
      this.x += dx * 0.02;
      this.y += dy * 0.02;
    }

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#63e6ff";
    ctx.fill();
  }
}

function init() {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function connect() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 140) {
        ctx.strokeStyle = `rgba(139,92,246,${1 - dist / 140})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connect();
  requestAnimationFrame(animate);
}

init();
animate();