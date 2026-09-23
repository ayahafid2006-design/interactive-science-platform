const canvas = document.getElementById('beakerCanvas');
canvas.width = 300; // strictly match exact inner coordinates of the 300px beaker
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const concSlider = document.getElementById('concentration');
const currentReadout = document.getElementById('current-readout');
const concReadout = document.getElementById('conc-readout');
const dissocReadout = document.getElementById('dissoc-readout');
const equationContainer = document.getElementById('equation-container');
const bulbGlow = document.getElementById('bulb-glow');

let particles = [];
let currentSubstance = null;
let concentration = parseFloat(concSlider.value);

// Scale: 400 molecules represents 1.0M concentration
const BASE_PARTICLES = 400;

class Particle {
    constructor(x, y, type, radius, color) {
        this.x = x;
        this.y = y;
        this.type = type; // 'pos', 'neg'
        this.radius = radius;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
    }

    update() {
        this.vx += (Math.random() - 0.5) * 0.4;
        this.vy += (Math.random() - 0.5) * 0.4;
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        if(Math.abs(this.vx) < 0.1) this.vx += (Math.random() > 0.5 ? 0.2 : -0.2);
        if(Math.abs(this.vy) < 0.1) this.vy += (Math.random() > 0.5 ? 0.2 : -0.2);

        // Electrodes attraction (Anode is left, Cathode is right in our HTML layout)
        if (this.type === 'pos') {
            this.vx += 0.05; // attract right (cathode -)
        } else if (this.type === 'neg') {
            this.vx -= 0.05; // attract left (anode +)
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < this.radius) { this.x = this.radius; this.vx *= -1; }
        if (this.x > width - this.radius) { this.x = width - this.radius; this.vx *= -1; }
        if (this.y < this.radius) { this.y = this.radius; this.vy *= -1; }
        if (this.y > height - this.radius) { this.y = height - this.radius; this.vy *= -1; }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = this.type === 'pos' ? '+' : '-';
        if (currentSubstance) {
            const chem = currentSubstance.dataset.chem;
            if (chem === 'NaCl') label = this.type === 'pos' ? 'Na⁺' : 'Cl⁻';
            else if (chem === 'HCl') label = this.type === 'pos' ? 'H⁺' : 'Cl⁻';
            else if (chem === 'CH3COOH') label = this.type === 'pos' ? 'H⁺' : 'CH₃COO⁻';
            else if (chem === 'NH4OH') label = this.type === 'pos' ? 'NH₄⁺' : 'OH⁻';
        }
        
        let fontSize = 11;
        ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = ctx.measureText(label).width;
        
        // Ion circle is 16px wide (radius 8). Max text width ~ 14px.
        while (textWidth > 14 && fontSize > 6) {
            fontSize -= 0.5;
            ctx.font = `bold ${fontSize}px Arial`;
            textWidth = ctx.measureText(label).width;
        }
        
        ctx.fillText(label, this.x, this.y);
    }
}

class NeutralCluster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = 'neutral';
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }
    
    update() {
        this.vx += (Math.random() - 0.5) * 0.3;
        this.vy += (Math.random() - 0.5) * 0.3;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 12) { this.x = 12; this.vx *= -1; }
        if (this.x > width - 12) { this.x = width - 12; this.vx *= -1; }
        if (this.y < 12) { this.y = 12; this.vy *= -1; }
        if (this.y > height - 12) { this.y = height - 12; this.vy *= -1; }
    }

    draw(ctx) {
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y, 6, 0, Math.PI*2);
        ctx.arc(this.x + 5, this.y, 6, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('0', this.x, this.y);
    }
}

function updateSimulation() {
    concentration = parseFloat(concSlider.value);
    concReadout.textContent = concentration.toFixed(3);
    
    if (!currentSubstance) return;

    let alpha = 0;
    
    if (currentSubstance.dataset.type === 'strong') {
        alpha = 1.0;
    } else if (currentSubstance.dataset.type === 'none') {
        alpha = 0.0;
    } else if (currentSubstance.dataset.type === 'weak') {
        const Ka = parseFloat(currentSubstance.dataset.ka);
        // Ostwald's dilution law calculation
        if (concentration > 0) {
            alpha = (-Ka + Math.sqrt(Ka*Ka + 4 * concentration * Ka)) / (2 * concentration);
        }
    }

    dissocReadout.textContent = (alpha * 100).toFixed(2);
    
    // Strict mathematical calculation for current (mA)
    const activeIonsConcentration = concentration * alpha;
    const current_mA = activeIonsConcentration * 1000;
    currentReadout.textContent = current_mA.toFixed(2);
    
    // Bulb glow visually scales, capping around 1000mA
    let glowOpacity = Math.min(current_mA / 1000, 1.0);
    if (current_mA > 0) {
        glowOpacity = Math.max(0.3, glowOpacity);
    }
    bulbGlow.style.opacity = glowOpacity;

    // Strict proportional mapping for visual molecules
    const totalVisualMolecules = Math.max(1, Math.round(concentration * BASE_PARTICLES));
    let numIonsPairs = Math.round(totalVisualMolecules * alpha);
    let numNeutrals = Math.floor((totalVisualMolecules - numIonsPairs) * 0.6); // Reduced by 40%
    
    // Strict enforcement for strong electrolytes
    if (currentSubstance.dataset.type === 'strong' || alpha === 1.0) {
        numNeutrals = 0;
        numIonsPairs = totalVisualMolecules;
    }

    let currentIons = particles.filter(p => p.type === 'pos' || p.type === 'neg');
    let currentNeutrals = particles.filter(p => p.type === 'neutral');

    // Adjust Ions Pairs (+ and -)
    const currentPairs = currentIons.length / 2;
    if (currentPairs > numIonsPairs) {
        let diff = currentPairs - numIonsPairs;
        let removedPos = 0, removedNeg = 0;
        particles = particles.filter(p => {
            if (p.type === 'pos' && removedPos < diff) { removedPos++; return false; }
            if (p.type === 'neg' && removedNeg < diff) { removedNeg++; return false; }
            return true;
        });
    } else if (currentPairs < numIonsPairs) {
        let diff = numIonsPairs - currentPairs;
        for(let i=0; i<diff; i++) {
            particles.push(new Particle(Math.random()*width, Math.random()*height, 'pos', 8, '#ff4a4a'));
            particles.push(new Particle(Math.random()*width, Math.random()*height, 'neg', 8, '#4a8bff'));
        }
    }

    // Adjust Neutral Clusters
    if (currentNeutrals.length > numNeutrals) {
        let diff = currentNeutrals.length - numNeutrals;
        let removed = 0;
        particles = particles.filter(p => {
            if (p.type === 'neutral' && removed < diff) { removed++; return false; }
            return true;
        });
    } else if (currentNeutrals.length < numNeutrals) {
        let diff = numNeutrals - currentNeutrals.length;
        for(let i=0; i<diff; i++) {
            particles.push(new NeutralCluster(Math.random()*width, Math.random()*height));
        }
    }
}

function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let p of particles) {
            p.update();
            p.draw(ctx);
        }
        requestAnimationFrame(animate);
    }

animate();

document.querySelectorAll('.bottle').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.bottle').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        currentSubstance = e.currentTarget;
        const chem = currentSubstance.dataset.chem;
        
        let equation = '';
        if (chem === 'NaCl') equation = 'NaCl (s) → Na⁺ (aq) + Cl⁻ (aq)';
        else if (chem === 'HCl') equation = 'HCl (aq) → H⁺ (aq) + Cl⁻ (aq)';
        else if (chem === 'CH3COOH') equation = 'CH₃COOH (aq) ⇌ H⁺ (aq) + CH₃COO⁻ (aq)';
        else if (chem === 'NH4OH') equation = 'NH₃ (aq) + H₂O (l) ⇌ NH₄⁺ (aq) + OH⁻ (aq)';
        else if (chem === 'Sugar') equation = 'C₁₂H₂₂O₁₁ (s) → C₁₂H₂₂O₁₁ (aq)';
        else if (chem === 'C2H5OH') equation = 'C₂H₅OH (l) → C₂H₅OH (aq)';
        
        equationContainer.innerHTML = `<span class="equation-text">${equation}</span>`;
        
        // Clear old particles when switching substance
        particles = [];
        updateSimulation();
    });
});

// Initialize readout to match default slider value
concReadout.textContent = parseFloat(concSlider.value).toFixed(3);
concSlider.addEventListener('input', updateSimulation);
