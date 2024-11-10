import { TamagotchiPet } from './../js/popup.js';

describe('TamagotchiPet', () => {
  let pet;

  // Mock DOM elements
  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div class="device-frame">
        <div class="pixel-grid"></div>
        <div id="face"></div>
        <div id="hunger-value"></div>
        <div id="happiness-value"></div>
        <div id="energy-value"></div>
        <button id="feed"></button>
        <button id="play"></button>
        <button id="sleep"></button>
      </div>
    `;

    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue()
        }
      }
    };

    pet = new TamagotchiPet();
  });

  describe('initialization', () => {
    test('should initialize with default values', () => {
      expect(pet.hunger).toBe(100);
      expect(pet.happiness).toBe(100);
      expect(pet.energy).toBe(100);
    });

    test('should load saved state if it exists', async () => {
      const savedState = {
        petState: {
          hunger: 50,
          happiness: 60,
          energy: 70
        }
      };

      chrome.storage.local.get.mockResolvedValueOnce(savedState);
      await pet.loadState();

      expect(pet.hunger).toBe(50);
      expect(pet.happiness).toBe(60);
      expect(pet.energy).toBe(70);
    });
  });

  describe('actions', () => {
    test('feed should increase hunger and decrease energy', () => {
      pet.hunger = 50;
      pet.energy = 50;
      pet.feed();

      expect(pet.hunger).toBe(70);
      expect(pet.energy).toBe(45);
    });

    test('feed should not work when energy is too low', () => {
      pet.hunger = 50;
      pet.energy = 5;
      pet.feed();

      expect(pet.hunger).toBe(50); // Should not change
      expect(pet.energy).toBe(5);
    });

    test('play should increase happiness and decrease energy and hunger', () => {
      pet.happiness = 50;
      pet.energy = 50;
      pet.hunger = 50;
      pet.play();

      expect(pet.happiness).toBe(70);
      expect(pet.energy).toBe(35);
      expect(pet.hunger).toBe(40);
    });

    test('play should not work when energy or hunger is too low', () => {
      pet.happiness = 50;
      pet.energy = 15;
      pet.hunger = 50;
      pet.play();

      expect(pet.happiness).toBe(50); // Should not change
    });

    test('sleep should increase energy', () => {
      pet.energy = 30;
      pet.sleep();

      expect(pet.energy).toBe(80);
    });
  });

  describe('state updates', () => {
    test('updatePetState should decrease stats over time', () => {
      pet.hunger = 50;
      pet.energy = 50;
      pet.happiness = 50;

      pet.updatePetState();

      expect(pet.hunger).toBeLessThan(50);
      expect(pet.energy).toBeLessThan(50);
      expect(pet.happiness).toBeLessThan(50);
    });

    test('happiness should decrease more when hungry and tired', () => {
      pet.hunger = 20;
      pet.energy = 20;
      pet.happiness = 50;

      const initialHappiness = pet.happiness;
      pet.updatePetState();

      expect(pet.happiness).toBeLessThan(initialHappiness - 5);
    });
  });

  describe('UI updates', () => {
    test('should show correct face when pet is hungry', () => {
      pet.hunger = 20;
      pet.energy = 100;
      pet.happiness = 100;

      pet.updateFace();
      const face = document.getElementById('face');

      expect(face.textContent).toBe(pet.faces.hungry);
      expect(face.classList.contains('hungry-wobble')).toBeTruthy();
    });

    test('should show message when action cannot be performed', () => {
      pet.energy = 5;
      pet.feed();

      const message = document.querySelector('.pet-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toBe('Too tired to eat!');
    });
  });
}); 