const starCanvas = document.getElementById("stars");
const sctx = starCanvas.getContext("2d");

starCanvas.width = innerWidth;
starCanvas.height = innerHeight;

let stars = [];

class Star {
  constructor() {
    this.x = Math.random() * starCanvas.width;
    this.y = Math.random() * starCanvas.height;
    this.z = Math.random() * 2;
    this.size = Math.random() * 1.5;
  }

  update() {
    this.z += 0.002;
    this.x += (innerWidth / 2 - this.x) * 0.0005 * this.z;
    this.y += (innerHeight / 2 - this.y) * 0.0005 * this.z;

    if (this.z > 2) {
      this.x = Math.random() * innerWidth;
      this.y = Math.random() * innerHeight;
      this.z = 0;
    }
  }

  draw() {
    sctx.beginPath();
    sctx.arc(this.x, this.y, this.size * this.z, 0, Math.PI * 2);
    sctx.fillStyle = "white";
    sctx.fill();
  }
}

function initStars() {
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

function animateStars() {
  sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);

  stars.forEach(s => {
    s.update();
    s.draw();
  });

  requestAnimationFrame(animateStars);
}

initStars();
animateStars();