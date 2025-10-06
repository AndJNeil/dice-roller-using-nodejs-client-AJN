// Configuration for API server
const API_URL = 'http://localhost:3000'; // Update this with your Azure Node.js server URL

// Wake up the server when page loads
async function wakeUpServer() {
    try {
        console.log('Waking up server...');
        const response = await fetch(`${API_URL}/api/wake`);
        const data = await response.json();
        console.log('Server wake response:', data);
        return true;
    } catch (error) {
        console.error('Failed to wake server:', error);
        console.warn('Using local random numbers as fallback');
        return false;
    }
}

// Get random number from server instead of Math.random()
async function getServerRandom() {
    try {
        const response = await fetch(`${API_URL}/api/random`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.random;
    } catch (error) {
        console.error('Failed to get random number from server:', error);
        // Fallback to local random if server fails
        return Math.random();
    }
}

function createDice(number) {
    const dotPositionMatrix = {
        1: [
            [50, 50]
        ],
        2: [
            [20, 20],
            [80, 80]
        ],
        3: [
            [20, 20],
            [50, 50],
            [80, 80]
        ],
        4: [
            [20, 20],
            [20, 80],
            [80, 20],
            [80, 80]
        ],
        5: [
            [20, 20],
            [20, 80],
            [50, 50],
            [80, 20],
            [80, 80]
        ],
        6: [
            [20, 20],
            [20, 50],
            [20, 80],
            [80, 20],
            [80, 50],
            [80, 80]
        ]
    };

    const dice = document.createElement("div");
    dice.classList.add("dice");

    for (const dotPosition of dotPositionMatrix[number]) {
        const dot = document.createElement("div");
        dot.classList.add("diceDot");
        dot.style.setProperty("--top", dotPosition[0] + "%");
        dot.style.setProperty("--left", dotPosition[1] + "%");
        dice.appendChild(dot);
    }

    return dice;
}

async function randomizeDice(diceContainer, numDice) {
    diceContainer.innerHTML = "";
    
    for (let i = 0; i < numDice; i++) {
        // Get random number from server
        const random = await getServerRandom();
        const diceValue = Math.floor(random * 6) + 1;
        const dice = createDice(diceValue);
        diceContainer.appendChild(dice);
    }
}

// Test CORS failure by calling the no-cors endpoint
async function testCORSFailure() {
    try {
        console.log('Testing CORS failure...');
        const response = await fetch(`${API_URL}/api/no-cors`);
        const data = await response.json();
        console.log('CORS test (should fail):', data);
    } catch (error) {
        console.error('CORS failure (expected):', error.message);
        alert('CORS Test: Request blocked as expected! Check console for details.');
    }
}

const numDice = 2;
const diceContainer = document.querySelector(".diceContainer");
const rollDice = document.querySelector(".rollDice");

// Wake up server when page loads
wakeUpServer();

// Initial dice roll
randomizeDice(diceContainer, numDice);

rollDice.addEventListener("click", () => {
    const interval = setInterval(async () => {
        await randomizeDice(diceContainer, numDice);
    }, 50);
    
    setTimeout(() => clearInterval(interval), 500);
});

// Add button to test CORS failure (optional - for demonstration)
const corsTestButton = document.createElement('button');
corsTestButton.textContent = 'Test CORS Failure';
corsTestButton.className = 'rollDice';
corsTestButton.style.marginTop = '15px';
corsTestButton.style.background = '#dc3545';
corsTestButton.onclick = testCORSFailure;
document.querySelector('.diceContainer').parentElement.appendChild(corsTestButton);