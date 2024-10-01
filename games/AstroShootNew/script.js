const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variablen
let gameOver = false;
let score = 0;
let lives = 3;
let playerX = 50;
let playerY = 100;
let playerAngle = 0;
let playerFlameHeight = 20;
let playerFlameWidth = 20;
let backgroundX = 0;
const backgroundSpeed = 0.5;
const playerWidth = 30;
const playerHeight = 30;
const meteorWidth = 20;
const meteorHeight = 20;
const sunWidth = 100;
const sunHeight = 100;
const attractionDistance = 500;
const maxAttractionForce = 2.7;
const planetWidth = 40;
const planetHeight = 40;

let meteors = [];
let suns = [];
let planets = [];

// Lade images
const playerImg = new Image();
playerImg.src = "img/player.png";
const flameImg = new Image();
flameImg.src = "img/flame.png";
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

// Kollisionserkennung
function collision(x1, y1, width1, height1, x2, y2, width2, height2) {
    return (
        x1 < x2 + (width2 * 0.50) &&
        x1 + width1 > x2 &&
        y1 < y2 + (height2 * 0.50) &&
        y1 + height1 > y2
    );
}

// Draw Functions
function drawPlayer() {
	ctx.save();
	ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2); // Setze den Ursprung auf die Mitte des Spielers
    ctx.rotate(playerAngle * Math.PI / 180); // Drehe den Kontext in Radiant
    ctx.drawImage(playerImg, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight); // Zeichne das Bild in der Mitte
    ctx.restore(); // Stelle den vorherigen Zustand des Canvas wieder her
}
function drawFlame() {
	ctx.save();
	ctx.translate(playerX + playerWidth / 2, playerY + playerHeight / 2); // Setze den Ursprung auf die Mitte des Spielers
    ctx.rotate(playerAngle * Math.PI / 180); // Drehe den Kontext in Radiant
    ctx.drawImage(flameImg, -playerWidth, -playerHeight / 2 + 3, playerFlameWidth, playerFlameHeight);
	ctx.restore();
}

function drawMeteor(meteor) {
	ctx.save();
	ctx.translate(meteor.x + meteorWidth / 2, meteor.y + meteorHeight / 2);
	ctx.rotate(meteor.rotation * Math.PI / 180);
	ctx.drawImage(meteorImg, -meteorWidth / 2, -meteorHeight / 2, meteorWidth, meteorHeight);
	ctx.restore();
}

function drawSun(sun){
	ctx.save();
	ctx.translate(sun.x + sunWidth / 2, sun.y + sunHeight / 2);
	ctx.rotate(sun.rotation * Math.PI / 180);
	ctx.drawImage(sunImg, -sunWidth / 2, -sunHeight / 2, sunWidth, sunHeight);
	ctx.restore();
}

function drawPlanet(planet) {
    ctx.drawImage(planetImg, planet.x, planet.y, planetWidth, planetHeight);
}

// Generate Function
function generateMeteor() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - meteorHeight);
    const speed = Math.random() * 4 + 1; // Zufällige Geschwindigkeit zwischen 1 und 6
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
        const radius = 250 + i * 70; // Abstand von der Sonne, hier vergrößert für besseren Orbit
        const planet = { angle, radius, sun: newSun }; // Speichere die Umlaufbahn-Informationen

        planets.push(planet); // Füge den Planeten zur Liste hinzu
    }
}

function updatePlanets() {
    planets.forEach(planet => {
        // Berechne die neue Position des Planeten
        planet.angle += 0.01; // Geschwindigkeit des Umlaufs
        planet.x = planet.sun.x + (sunWidth / 2) + Math.cos(planet.angle) * planet.radius - planetWidth / 2; // Berechne X-Position
        planet.y = planet.sun.y + (sunHeight / 2) + Math.sin(planet.angle) * planet.radius - planetHeight / 2; // Berechne Y-Position
    });
}

function applyAttraction(){
	suns.forEach(sun => {
	// Spieler-Anziehungskraft
        const distance = getDistance(playerX, playerY, sun.x + sunWidth / 2, sun.y + sunHeight / 2);
        if (distance < attractionDistance) {
            const attractionForce = Math.max(maxAttractionForce * (1 - distance / attractionDistance), 0);
            const angle = Math.atan2(sun.y + sunHeight / 2 - playerY, sun.x + sunWidth / 2 - playerX);
            playerX += Math.cos(angle) * attractionForce;
            playerY += Math.sin(angle) * attractionForce;
        }

        // Anziehungskraft auf Meteoriten
        meteors.forEach(meteor => {
            const meteorDistance = getDistance(meteor.x, meteor.y, sun.x + sunWidth / 2, sun.y + sunHeight / 2);
            if (meteorDistance < attractionDistance) {
                const meteorAttractionForce = Math.max(maxAttractionForce * (1 - meteorDistance / attractionDistance), 0);
                const meteorAngle = Math.atan2(sun.y + sunHeight / 2 - meteor.y, sun.x + sunWidth / 2 - meteor.x);
                meteor.x += Math.cos(meteorAngle) * meteorAttractionForce;
                meteor.y += Math.sin(meteorAngle) * meteorAttractionForce;
            }
        });
    });
}

// Update
function update() {
	// Teste ob spieler = tot
	if (gameOver) return;
	
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
	// Hintergrund zeichnen
    ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height); // Zeichne den Hintergrund
    ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height); // Zeichne den Hintergrund erneut für unendliches Scrollen
	// Bewege den Hintergrund
    backgroundX -= backgroundSpeed; // Bewege den Hintergrund nach links
    if (backgroundX <= -canvas.width) { // Wenn der Hintergrund außerhalb des Canvas ist
        backgroundX = 0; // Setze die Position zurück
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
	if (keys.down == false && keys.up == false){
		playerAngle = 0;
	}
	
    // Anziehungskraft anwenden
    applyAttraction();
	// Aktualisiere Planetenpositionen
    updatePlanets();

    // Bewege und Zeichne Meteore
    meteors.forEach((meteor, index) => {
        meteor.x -= meteor.speed; // Verwende die individuelle Geschwindigkeit
        meteor.rotation += meteor.rotationSpeed;
		drawMeteor(meteor);
        
		// Kollisionserkennung
		if (collision(playerX, playerY, playerWidth, playerHeight, meteor.x, meteor.y, meteorWidth, meteorHeight)) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
			meteors.splice(index, 1);
        }
		
        // Lösche meteor nach rausflug
        if (meteor.x < -meteorWidth) {
            meteors.splice(index, 1);
			score += 1;
        }
    });
	
	// Bewege und Zeichne Sonnen
	suns.forEach((sun, index) => {
		// Zeichne Sonne
		sun.x -= sun.speed;
		sun.rotation += sun.rotationSpeed;
		drawSun(sun);
		
		// Kollisionserkennung
		if (collision(playerX, playerY, playerWidth, playerHeight, sun.x, sun.y, sunWidth, sunHeight)) {
            lives = 0;
            if (lives <= 0) {
                gameOver = true;
            }
			suns.splice(index, 1);
		}
		
		// Lösche sonne nach rausflug
		if (sun.x < -sunWidth) {
			suns.splice(index, 1);
			score += 10;
		}
	});
	
	// Zeichne Planeten
    planets.forEach(planet => {
        drawPlanet(planet);
    });
	planets.forEach ((planet, index) => {
		// Kollisionserkennung
		if (collision(playerX, playerY, playerWidth, playerHeight, planet.x, planet.y, planetWidth, planetHeight)) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
			planets.splice(index, 1);
        }
		
		if (planet.x < -planetWidth) {
			planets.splice(index, 1);
			score += 5;
		}
	});

    // Lade Content
	drawFlame();
    drawPlayer();
	ctx.fillStyle = "white";
	ctx.font = "20px Arial";
	ctx.fillText("Material: 0", 10 ,20);
	ctx.fillText("Score: " + score, 10, 40);
	ctx.fillText("Life: " + lives, 10, 60);
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

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// set spawn Interval
setInterval(generateMeteor, 1000);
setInterval(generateSun, 12000);
gameLoop();