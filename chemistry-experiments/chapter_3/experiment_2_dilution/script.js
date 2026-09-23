const canvas = document.getElementById('zoomCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const slider = document.getElementById('volumeSlider');
const volReadout = document.getElementById('vol-readout');
const concReadout = document.getElementById('conc-readout');
const alphaReadout = document.getElementById('alpha-readout');
const phReadout = document.getElementById('ph-readout');
const sliderLabel = document.getElementById('sliderLabelWrapper');
const kaBox = document.getElementById('ka-box');
const waterDrop = document.getElementById('waterDrop');
const flaskLiquid = document.getElementById('flaskLiquid');

let particles = [];
const TOTAL_PARTICLES = 50;

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'neutral', 'pos', 'neg'
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.baseRadius = 8;
    }

    update(bounds, scale) {
        this.vx += (Math.random() - 0.5) * 0.4;
        this.vy += (Math.random() - 0.5) * 0.4;
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        if(Math.abs(this.vx) < 0.1) this.vx += (Math.random() > 0.5 ? 0.2 : -0.2);
        if(Math.abs(this.vy) < 0.1) this.vy += (Math.random() > 0.5 ? 0.2 : -0.2);

        this.x += this.vx;
        this.y += this.vy;

        const r = this.baseRadius * scale * (this.type === 'neutral' ? 1.5 : 1);

        if (this.x < r) { this.x = r; this.vx *= -1; }
        if (this.x > width - r) { this.x = width - r; this.vx *= -1; }
        if (this.y < r) { this.y = r; this.vy *= -1; }
        if (this.y > height - r) { this.y = height - r; this.vy *= -1; }
    }

    draw(ctx, scale) {
        const r = this.baseRadius * scale;
        
        if (this.type === 'neutral') {
            ctx.fillStyle = '#9ca3af'; // light gray
            ctx.beginPath();
            ctx.arc(this.x - r*0.8, this.y, r, 0, Math.PI*2);
            ctx.arc(this.x + r*0.8, this.y, r, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('0', this.x, this.y);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            
            if (this.type === 'pos') {
                ctx.fillStyle = '#ef4444'; // red
                ctx.shadowColor = '#ef4444';
            } else {
                ctx.fillStyle = '#3b82f6'; // blue
                ctx.shadowColor = '#3b82f6';
            }
            
            ctx.shadowBlur = 10;
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 10px Arial';
            
            if (this.type === 'pos') {
                ctx.fillText('H⁺', this.x, this.y);
            } else {
                ctx.fillText('CH₃COO⁻', this.x, this.y);
            }
        }
    }
}

// Initialize exactly 100 neutral particles
for (let i = 0; i < TOTAL_PARTICLES; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height, 'neutral'));
}

let dropTimer = null;

function updateSimulation() {
    const v = parseFloat(slider.value); // 0 to 2
    
    // Math interpolations
    const volume = 10 * Math.pow(10, v);
    const concentration = 1.0 * Math.pow(10, -2 * v);
    const alphaPercent = 0.42 * Math.pow(10, v);
    const ph = 2.38 + v;
    
    // Update UI Readouts
    sliderLabel.innerText = "حجم الماء المضاف: " + Math.round(volume) + " مل";
    volReadout.textContent = volume >= 100 ? Math.round(volume) : volume.toFixed(1);
    concReadout.textContent = concentration.toFixed(4);
    alphaReadout.textContent = alphaPercent.toFixed(2);
    phReadout.textContent = ph.toFixed(2);
    
    // Flask Liquid Level (20% to 90%)
    const level = 20 + (v / 2) * 70;
    flaskLiquid.style.height = `${level}%`;

    // Particle logic (Scale shrinks from 1.0 to 0.4 as volume increases)
    const currentScale = 1.0 - (v * 0.3);
    
    const numIonsPairs = Math.round((alphaPercent / 100) * TOTAL_PARTICLES);
    const numNeutrals = TOTAL_PARTICLES - numIonsPairs;
    
    let currentPos = particles.filter(p => p.type === 'pos');
    let currentNeg = particles.filter(p => p.type === 'neg');
    let currentNeutrals = particles.filter(p => p.type === 'neutral');
    
    const currentPairs = currentPos.length;
    
    if (currentPairs < numIonsPairs) {
        // Convert neutrals to ions
        const diff = numIonsPairs - currentPairs;
        for (let i = 0; i < diff; i++) {
            if (currentNeutrals.length > 0) {
                const n = currentNeutrals.pop();
                n.type = 'pos';
                // Add the corresponding negative ion
                particles.push(new Particle(n.x + 10, n.y, 'neg'));
            }
        }
    } else if (currentPairs > numIonsPairs) {
        // Convert ions back to neutrals (though this specific simulation only goes one way since we only add water)
        const diff = currentPairs - numIonsPairs;
        for (let i = 0; i < diff; i++) {
            const pos = currentPos.pop();
            const neg = currentNeg.pop();
            pos.type = 'neutral';
            particles.splice(particles.indexOf(neg), 1); // Remove the negative ion completely to keep total at 100
        }
    }

    // Animation Loop Variables
    window.currentScale = currentScale;
}

// Ka Vibration effect
slider.addEventListener('input', () => {
    updateSimulation();
    
    kaBox.classList.remove('shake-anim');
    void kaBox.offsetWidth; // trigger reflow
    kaBox.classList.add('shake-anim');
    
    // Water drop animation
    if (!waterDrop.classList.contains('drop-animate')) {
        waterDrop.classList.add('drop-animate');
        setTimeout(() => {
            waterDrop.classList.remove('drop-animate');
        }, 500);
    }
});

// Remove vibrate class after animation ends
kaBox.addEventListener('animationend', () => {
    kaBox.classList.remove('shake-anim');
});

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    const scale = window.currentScale || 1.0;
    
    for (let p of particles) {
        p.update(width, scale);
        p.draw(ctx, scale);
    }
    
    requestAnimationFrame(animate);
}

// Initial Call
updateSimulation();
animate();
