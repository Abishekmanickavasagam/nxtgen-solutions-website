// bg-network.js - Constellation nodes and edges background network for NxtGen-Solutions

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  // Adjusted particle count for performance and visual elegance
  const maxParticles = Math.min(Math.floor((width * height) / 20000), 55);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() * 0.12 - 0.06);
      this.vy = (Math.random() * 0.12 - 0.06);
      this.radius = Math.random() * 2 + 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 184, 166, 0.25)'; // Teal node
      ctx.fill();
    }
  }

  function init() {
    particles.length = 0;
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  function connect() {
    const minDistance = 150;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          const alpha = (1 - dist / minDistance) * 0.12;
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`; // Primary Blue line
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
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    connect();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
  });

  init();
  animate();
});
