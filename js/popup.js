class TamagotchiPet {
  constructor() {
    this.hunger = 100;
    this.happiness = 100;
    this.energy = 100;
    this.initializeControls();
    this.loadState();
    this.createPet();
  }

  initializeControls() {
    document.getElementById('feed').addEventListener('click', () => this.feed());
    document.getElementById('play').addEventListener('click', () => this.play());
    document.getElementById('sleep').addEventListener('click', () => this.sleep());
  }

  createPet() {
    const grid = document.querySelector('.pixel-grid');
    grid.innerHTML = '';

    const petShape = [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ];

    petShape.forEach((row, i) => {
      row.forEach((pixel, j) => {
        const div = document.createElement('div');
        if (pixel === 1) {
          div.className = 'pixel body';
        } else if (pixel === 2) {
          div.className = 'pixel eye';
        } else if (pixel === 3) {
          div.className = 'pixel highlight';
        }
        grid.appendChild(div);
      });
    });
  }

  async loadState() {
    const state = await chrome.storage.local.get(['petState']);
    if (state.petState) {
      Object.assign(this, state.petState);
    }
    this.updateDisplay();
  }

  updateDisplay() {
    document.getElementById('hunger-value').textContent = this.hunger;
    document.getElementById('happiness-value').textContent = this.happiness;
    document.getElementById('energy-value').textContent = this.energy;
  }

  feed() {
    this.hunger = Math.min(100, this.hunger + 20);
    this.updateDisplay();
    this.saveState();
  }

  play() {
    this.happiness = Math.min(100, this.happiness + 20);
    this.energy = Math.max(0, this.energy - 10);
    this.updateDisplay();
    this.saveState();
  }

  sleep() {
    this.energy = Math.min(100, this.energy + 50);
    this.updateDisplay();
    this.saveState();
  }

  async saveState() {
    await chrome.storage.local.set({
      petState: {
        hunger: this.hunger,
        happiness: this.happiness,
        energy: this.energy
      }
    });
  }
}

// Initialize pet when popup opens
document.addEventListener('DOMContentLoaded', () => {
  new TamagotchiPet();
}); 