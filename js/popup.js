class TamagotchiPet {
  constructor() {
    try {
      this.hunger = 100;
      this.happiness = 100;
      this.energy = 100;
      this.faces = {
        happy: '^-^',
        hungry: '°-°',
        sleepy: '-_-',
        playing: '^o^',
        sad: ';-;'
      };

      // Check if we're in a Chrome extension context
      if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
      }

      this.initializeControls();
      this.loadState();
      this.updateFace();
      this.startLifeTimer();
    } catch (error) {
      console.error('Failed to initialize Tamagotchi:', error);
    }
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

  updateFace() {
    const face = document.getElementById('face');
    face.className = '';

    if (this.hunger < 30 && this.energy < 30) {
      face.textContent = this.faces.sad;
      face.classList.add('critical-wobble');
    }
    else if (this.hunger < 30) {
      face.textContent = this.faces.hungry;
      face.classList.add('hungry-wobble');
    }
    else if (this.energy < 30) {
      face.textContent = this.faces.sleepy;
      face.classList.add('sleepy-sway');
    }
    else if (this.happiness < 30) {
      face.textContent = this.faces.sad;
      face.classList.add('sad-bounce');
    }
    else if (this.happiness > 80 && this.hunger > 70 && this.energy > 70) {
      face.textContent = this.faces.happy;
      face.classList.add('happy-bounce');
    }
    else {
      face.textContent = this.faces.happy;
      face.classList.add('gentle-float');
    }
  }

  showMessage(message) {
    // Remove any existing messages first
    const existingMessage = document.querySelector('.pet-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'pet-message';
    messageDiv.textContent = message;

    // Add to the device-frame instead of pet-display for better positioning
    document.querySelector('.device-frame').appendChild(messageDiv);

    // Remove the message after 2 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 2000);
  }

  feed() {
    if (this.energy < 10) {
      this.showMessage("Too tired to eat!");
      return;
    }

    const face = document.getElementById('face');
    face.className = '';
    face.textContent = this.faces.happy;
    face.style.animation = 'eat-animation 0.5s ease';

    face.addEventListener('animationend', () => {
      face.style.animation = '';
      this.updateFace();
    }, { once: true });

    this.hunger = Math.min(100, this.hunger + 20);
    this.energy = Math.max(0, this.energy - 5);
    this.updateDisplay();
    this.saveState();
  }

  play() {
    if (this.energy < 20 || this.hunger < 20) {
      this.showMessage(this.energy < 20 ? "Too tired to play!" : "Too hungry to play!");
      return;
    }

    const face = document.getElementById('face');
    face.className = '';
    face.textContent = this.faces.playing;
    face.style.animation = 'play-animation 0.8s ease';

    face.addEventListener('animationend', () => {
      face.style.animation = '';
      this.updateFace();
    }, { once: true });

    this.happiness = Math.min(100, this.happiness + 20);
    this.energy = Math.max(0, this.energy - 15);
    this.hunger = Math.max(0, this.hunger - 10);
    this.updateDisplay();
    this.saveState();
  }

  sleep() {
    const face = document.getElementById('face');
    face.className = '';
    face.textContent = this.faces.sleepy;
    face.style.animation = 'sleep-animation 2s ease';

    face.addEventListener('animationend', () => {
      face.style.animation = '';
      this.updateFace();
    }, { once: true });

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

  startLifeTimer() {
    // Update pet state every 10 seconds
    setInterval(() => {
      this.updatePetState();
    }, 10000);
  }

  updatePetState() {
    // Natural decrease in stats
    this.hunger = Math.max(0, this.hunger - 2);
    this.energy = Math.max(0, this.energy - 1);

    // Happiness decreases based on conditions
    let happinessDecrease = 1; // Base decrease

    // More unhappy if hungry
    if (this.hunger < 30) {
      happinessDecrease += 2;
    }

    // More unhappy if tired
    if (this.energy < 30) {
      happinessDecrease += 2;
    }

    // Very unhappy if both hungry and tired
    if (this.hunger < 30 && this.energy < 30) {
      happinessDecrease += 3;
    }

    this.happiness = Math.max(0, this.happiness - happinessDecrease);

    // Update display and save state
    this.updateDisplay();
    this.saveState();
  }
}

// For the extension
document.addEventListener('DOMContentLoaded', () => {
  try {
    new TamagotchiPet();
  } catch (error) {
    console.error('Failed to create Tamagotchi:', error);
  }
});

// For testing
if (typeof exports !== 'undefined') {
  exports.TamagotchiPet = TamagotchiPet;
} 