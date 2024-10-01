const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variablen
let score = 0;
let life = 3;
let playerX = 50;
let playerY = 100;
let playerAngle = 0;
let backgroundX = 0;
const backgroundSpeed = 0.5;
const playerWidth = 30;
const playerHeight = 30;
const meteorWidth = 20;
const meteorHeight = 20;
const sunWidth = 100;
const sunHeight = 100;
const planetWidth = 40;
const planetHeight = 40;

let meteors = [];
let suns = [];
let planets = [];

// Lade images
const playerImg = new Image();
playerImg.src = "img/player.png";
const meteorImg = new Image();
meteorImg.src = "img/meteor.png";
const sunImg = new Image();
sunImg.src = "img/sun.png";
const planetImg = new Image();
planetImg.src = "img/planet.png";
const backgroundImg = new Image();
backgroundImg.src = "img/background.png";

// Tastendruck
const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Distance Function
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Draw Functions
function drawPlayer() {
    ctx.save();
    ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2);
    ctx.rotate(playerAngle * Math.PI / 180);
    ctx.drawImage(playerImg, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
    ctx.restore();
}

function drawMeteor(meteor) {
    ctx.save();
    ctx.translate(meteor.x + meteorWidth / 2, meteor.y + meteorHeight / 2);
    ctx.rotate(meteor.rotation * Math.PI / 180);
    ctx.drawImage(meteorImg, -meteorWidth / 2, -meteorHeight / 2, meteorWidth, meteorHeight);
    ctx.restore();
}

function drawSun(sun) {
    ctx.save();
    ctx.translate(sun.x + sunWidth / 2, sun.y + sunHeight / 2);
    ctx.rotate(sun.rotation * Math.PI / 180);
    ctx.drawImage(sunImg, -sunWidth / 2, -sunHeight / 2, sunWidth, sunHeight);
    ctx.restore();
}

function drawPlanet(planet) {
    ctx.drawImage(planetImg, planet.x, planet.y, planetWidth, planetHeight);
}

// Generate Functions
function generateMeteor() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - meteorHeight);
    const speed = Math.random() * 4 + 1;
    const rotationSpeed = Math.random() * 7 + 1;
    meteors.push({ x, y, speed, rotation: 0, rotationSpeed });
}

function generateSun() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - sunHeight);
    const speed = 2;
    const rotationSpeed = Math.random() * 1 + 0.2;
    const newSun = { x, y, speed, rotation: 0, rotationSpeed };

    // Füge die Sonne zur Liste hinzu
    suns.push(newSun);

    // Erzeuge Planeten um die Sonne
    const numberOfPlanets = Math.floor(Math.random() * 3) + 1; // Anzahl der Planeten zwischen 1 und 3
    for (let i = 0; i < numberOfPlanets; i++) {
        const angle = Math.random() * 2 * Math.PI; // Zufälliger Winkel
        const radius = 100 + i * 60; // Abstand von der Sonne, hier vergrößert für besseren Orbit
        const planet = { angle, radius, sun: newSun }; // Speichere die Umlaufbahn-Informationen

        planets.push(planet); // Füge den Planeten zur Liste hinzu
    }
}

function updatePlanets() {
    planets.forEach(planet => {
        // Berechne die neue Position des Planeten
        planet.angle += 0.02; // Geschwindigkeit des Umlaufs
        planet.x = planet.sun.x + (sunWidth / 2) + Math.cos(planet.angle) * planet.radius - planetWidth / 2; // Berechne X-Position
        planet.y = planet.sun.y + (sunHeight / 2) + Math.sin(planet.angle) * planet.radius - planetHeight / 2; // Berechne Y-Position
    });
}

// Update
function update() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hintergrund zeichnen
    ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    backgroundX -= backgroundSpeed; 
    if (backgroundX <= -canvas.width) { 
        backgroundX = 0; 
    }
    
    // Bewegung Spieler
    if (keys.left && playerX > 0) {
        playerX -= 5;
        playerAngle = 0;
    }
    if (keys.right && playerX < canvas.width - playerWidth) {
        playerX += 5;
        playerAngle = 0;
    }
    if (keys.up && playerY > 0) {
        playerY -= 5;
        playerAngle = -45;
    }
    if (keys.down && playerY < canvas.height - playerHeight) {
        playerY += 5;
        playerAngle = 45;
    }
    if (keys.down == false && keys.up == false) {
        playerAngle = 0;
    }
    
    // Aktualisiere Planetenpositionen
    updatePlanets();

    // Bewege und Zeichne Meteore
    meteors.forEach((meteor, index) => {
        meteor.x -= meteor.speed;
        meteor.rotation += meteor.rotationSpeed;
        drawMeteor(meteor);
        
        if (meteor.x < -meteorWidth) {
            meteors.splice(index, 1);
            score += 1;
        }
    });
    
    // Bewege und Zeichne Sonnen
    suns.forEach((sun, index) => {
        sun.x -= sun.speed;
        sun.rotation += sun.rotationSpeed;
        drawSun(sun);
        
        if (sun.x < -sunWidth) {
            suns.splice(index, 1);
            score += 10;
        }
    });
    
    // Zeichne Planeten
    planets.forEach(planet => {
        drawPlanet(planet);
    });

    // Lade Content
    drawPlayer();
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Material: 0", 10 ,20);
    ctx.fillText("Score: " + score, 10, 40);
    ctx.fillText("Life: " + life, 10, 60);
}

// Event-Listener für Steuerung
document.addEventListener("keydown", (e) => {
    if (e.key === "a") keys.left = true;
    if (e.key === "d") keys.right = true;
    if (e.key === "w") keys.up = true;
    if (e.key === "s") keys.down = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "a") keys.left = false;
    if (e.key === "d") keys.right = false;
    if (e.key === "w") keys.up = false;
    if (e.key === "s") keys.down = false;
});

// Game Loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// Setze Intervall für Meteore und Sonnen
setInterval(generateMeteor, 1000); // Erzeugt alle 1000 ms einen Meteor
setInterval(generateSun, 12000); // Erzeugt alle 12000 ms eine Sonne
gameLoop(); // Starte das Spiel
