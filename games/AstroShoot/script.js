const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let lives = 3;
let shipX = 0; // Setze die X-Position des Raumschiffs auf 0 für den linken Rand
let shipY = canvas.height / 2 - 15; // Positioniere das Raumschiff in der Mitte vertikal
const shipWidth = 30; // Breite des Raumschiffs
const shipHeight = 30; // Höhe des Raumschiffs
const meteorWidth = 20; // Breite der Meteoriten (Kometen)
const meteorHeight = 20; // Höhe der Meteoriten (Kometen)
const sunWidth = 80; // Breite der Sonnen
const sunHeight = 80; // Höhe der Sonnen
const planetWidth = 25; // Breite der Planeten
const planetHeight = 25; // Höhe der Planeten
const rocketWidth = 10; // Breite der Raketen
const rocketHeight = 10; // Höhe der Raketen
const enemyWidth = 30; // Breite der Gegner
const enemyHeight = 30; // Höhe der Gegner
const explosionRadius = 30; // Radius der Explosion
const attractionDistance = 300; // Anziehungsfeld
const maxAttractionForce = 5; // Maximale Anziehungskraft

let meteors = [];
let suns = [];
let planets = []; // Array für Planeten
let rockets = []; // Array für Raketen
let enemies = []; // Array für Gegner
let explosions = []; // Array für Explosionen
let gameOver = false;
let mouseX = 0; // X-Position des Mauszeigers
let mouseY = 0; // Y-Position des Mauszeigers

let rocketCooldown = 0; // Cooldown für Raketen in Sekunden
const rocketCooldownDuration = 5; // Cooldown-Dauer in Sekunden

// Status der gedrückten Tasten
const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

const shipImg = new Image();
shipImg.src = "player.png"; // Das Raumschiff

const sunImg = new Image();
sunImg.src = "sonne.png"; // Sonne

const planetImg = new Image();
planetImg.src = "planet.png"; // Planet

const rocketImg = new Image();
rocketImg.src = "rocket.png"; // Bild der Rakete

const enemyImg = new Image();
enemyImg.src = "enemy.png"; // Bild des Gegners

const explosionImg = new Image();
explosionImg.src = "explosion.png"; // Bild der Explosion

function drawShip() {
    ctx.drawImage(shipImg, shipX, shipY, shipWidth, shipHeight);
}

function drawMeteor(meteor) {
    const meteorImg = new Image();
    meteorImg.src = "meteor.png"; // Meteoriten
    ctx.drawImage(meteorImg, meteor.x, meteor.y, meteorWidth, meteorHeight);
}

function drawSun(sun) {
    ctx.drawImage(sunImg, sun.x, sun.y, sunWidth, sunHeight);
}

function drawPlanet(planet) {
    ctx.drawImage(planetImg, planet.x, planet.y, planetWidth, planetHeight);
}

function drawRocket(rocket) {
    ctx.drawImage(rocketImg, rocket.x, rocket.y, rocketWidth, rocketHeight);
}

function drawEnemy(enemy) {
    const enemyImg = new Image();
    enemyImg.src = "enemy.png"; // Bild des Gegners
    const angle = Math.atan2(shipY - enemy.y, shipX - enemy.x); // Berechne den Winkel zur Spielerposition

    ctx.save(); // Aktuellen Zustand des Kontextes speichern
    ctx.translate(enemy.x + enemyWidth / 2, enemy.y + enemyHeight / 2); // Bewege den Ursprung zum Zentrum des Gegners
    ctx.rotate(angle); // Drehe den Kontext um den berechneten Winkel
    ctx.drawImage(enemyImg, -enemyWidth / 2, -enemyHeight / 2, enemyWidth, enemyHeight); // Zeichne den Gegner zentriert
    ctx.restore(); // Wiederherstellen des vorherigen Kontextzustands
}

function drawExplosion(explosion) {
    ctx.drawImage(explosionImg, explosion.x - explosionRadius / 2, explosion.y - explosionRadius / 2, explosionRadius, explosionRadius);
}

function generateMeteor() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - meteorHeight);
    meteors.push({ x, y });
}

function generateSun() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - sunHeight);
    const sun = { x, y, angle: 0 }; // Sonnenposition und Winkel
    suns.push(sun);

    // Erzeuge eine zufällige Anzahl von Planeten (1 bis 3)
    const numberOfPlanets = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numberOfPlanets; i++) {
        planets.push({ sun, angle: Math.random() * 2 * Math.PI, radius: 100 + i * 40 }); // Unterschiedlicher Radius für jeden Planeten
    }
}

function generateEnemy() {
    const x = canvas.width; // Gegner erscheinen am rechten Rand
    const y = Math.random() * (canvas.height - enemyHeight);
    enemies.push({ x, y });
}

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bewegung des Raumschiffs basierend auf den gedrückten Tasten
    if (keys.left && shipX > 0) {
        shipX -= 5;
    }
    if (keys.right && shipX < canvas.width - shipWidth) {
        shipX += 5;
    }
    if (keys.up && shipY > 0) {
        shipY -= 5;
    }
    if (keys.down && shipY < canvas.height - shipHeight) {
        shipY += 5;
    }

    // Anziehungslogik für die Sonne
    suns.forEach(sun => {
        const distance = getDistance(shipX, shipY, sun.x, sun.y);

        // Grauer Bereich anzeigen, wo das Anziehungsfeld beginnt
        if (distance < attractionDistance) {
            ctx.fillStyle = "rgba(128, 128, 128, 0.5)"; // Graue Farbe
            ctx.beginPath();
            ctx.arc(sun.x + sunWidth / 2, sun.y + sunHeight / 2, attractionDistance, 0, Math.PI * 2);
            ctx.fill();
        }

        if (distance < attractionDistance) {
            // Berechne die Anziehungskraft
            const attractionForce = Math.max(maxAttractionForce * (1 - distance / attractionDistance), 0);
            const angle = Math.atan2(sun.y - shipY, sun.x - shipX);
            shipX += Math.cos(angle) * attractionForce; // Ziehe das Raumschiff in Richtung Sonne
            shipY += Math.sin(angle) * attractionForce;
        }

        // Meteoriten von der Sonne beeinflussen
        meteors.forEach((meteor, meteorIndex) => {
            const meteorDistance = getDistance(meteor.x, meteor.y, sun.x, sun.y);
            if (meteorDistance < attractionDistance) {
                const attractionForce = Math.max(maxAttractionForce * (1 - meteorDistance / attractionDistance), 0);
                const angle = Math.atan2(sun.y - meteor.y, sun.x - meteor.x);
                meteor.x += Math.cos(angle) * attractionForce; // Ziehe die Meteoriten in Richtung Sonne
                meteor.y += Math.sin(angle) * attractionForce;
            }

            // Überprüfen, ob Meteoriten die Sonne berühren
            if (collision(meteor.x, meteor.y, meteorWidth, meteorHeight, sun.x, sun.y, sunWidth, sunHeight)) {
                meteors.splice(meteorIndex, 1); // Meteoriten verschwinden
                score++; // Erhöhe den Score
            }
        });
    });

    // Planetenbewegung um die Sonnen
    planets.forEach(planet => {
        planet.angle += 0.05; // Geschwindigkeit der Planetenrotation
        planet.x = planet.sun.x + sunWidth / 2 + planet.radius * Math.cos(planet.angle);
        planet.y = planet.sun.y + sunHeight / 2 + planet.radius * Math.sin(planet.angle);

        drawPlanet(planet);

        // Kollision mit dem Planeten prüfen
        if (collision(shipX, shipY, shipWidth, shipHeight, planet.x, planet.y, planetWidth, planetHeight)) {
            lives--; // Raumschiff ist mit einem Planeten kollidiert, ziehe ein Leben ab
            planets = planets.filter(p => p !== planet); // Entferne den Planeten nach der Kollision
        }
    });

    drawShip();

    meteors.forEach((meteor, index) => {
        meteor.x -= 5;

        if (meteor.x < -meteorWidth) {
            meteors.splice(index, 1);
            score++;
        }

        if (collision(shipX, shipY, shipWidth, shipHeight, meteor.x, meteor.y, meteorWidth, meteorHeight)) {
            meteors.splice(index, 1);
            lives--;
            if (lives <= 0) {
                gameOver = true;
            }
        }

        drawMeteor(meteor);
    });

    suns.forEach((sun, index) => {
        sun.x -= 3;

        if (sun.x < -sunWidth) {
            suns.splice(index, 1);
            score++;
        }

        drawSun(sun);
    });

    // Gegner bewegen sich in Richtung des Raumschiffs und versuchen Kollisionen zu vermeiden
    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(shipY - enemy.y, shipX - enemy.x);
        const enemySpeed = 2; // Geschwindigkeit des Gegners

        // Überprüfen, ob der Gegner mit Meteoriten oder Planeten kollidiert
        let avoidingCollision = false;
        meteors.forEach(meteor => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, meteor.x, meteor.y, meteorWidth, meteorHeight)) {
                avoidingCollision = true; // Vermeide Meteoriten
            }
        });

        planets.forEach(planet => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, planet.x, planet.y, planetWidth, planetHeight)) {
                avoidingCollision = true; // Vermeide Planeten
            }
        });

        if (!avoidingCollision) {
            enemy.x += Math.cos(angle) * enemySpeed; // Bewege den Gegner in Richtung Raumschiff
            enemy.y += Math.sin(angle) * enemySpeed;
        } else {
            // Versuche, eine andere Richtung zu finden
            enemy.x += (Math.random() - 0.5) * enemySpeed;
            enemy.y += (Math.random() - 0.5) * enemySpeed;
        }

        // Kollision mit dem Raumschiff
        if (collision(shipX, shipY, shipWidth, shipHeight, enemy.x, enemy.y, enemyWidth, enemyHeight)) {
            lives--; // Raumschiff ist mit einem Gegner kollidiert, ziehe ein Leben ab
            enemies.splice(index, 1); // Entferne den Gegner nach der Kollision
            if (lives <= 0) {
                gameOver = true;
            }
        }

        // Kollision mit Raketen
        rockets.forEach((rocket, rocketIndex) => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, rocket.x, rocket.y, rocketWidth, rocketHeight)) {
                explosions.push({ x: enemy.x + enemyWidth / 2, y: enemy.y + enemyHeight / 2 }); // Explosion hinzufügen
                enemies.splice(index, 1); // Gegner verschwinden
                rockets.splice(rocketIndex, 1); // Rakete verschwinden
                score++; // Erhöhe den Score
            }
        });

        // Kollision mit Kometen
        meteors.forEach((meteor, meteorIndex) => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, meteor.x, meteor.y, meteorWidth, meteorHeight)) {
                explosions.push({ x: enemy.x + enemyWidth / 2, y: enemy.y + enemyHeight / 2 }); // Explosion hinzufügen
                enemies.splice(index, 1); // Gegner verschwinden
                meteors.splice(meteorIndex, 1); // Meteoriten verschwinden
                score++; // Erhöhe den Score
            }
        });

        // Kollision mit Planeten
        planets.forEach((planet, planetIndex) => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, planet.x, planet.y, planetWidth, planetHeight)) {
                explosions.push({ x: enemy.x + enemyWidth / 2, y: enemy.y + enemyHeight / 2 }); // Explosion hinzufügen
                enemies.splice(index, 1); // Gegner verschwinden
                planets.splice(planetIndex, 1); // Planeten verschwinden
                score++; // Erhöhe den Score
            }
        });

        // Kollision mit Sonnen
        suns.forEach((sun) => {
            if (collision(enemy.x, enemy.y, enemyWidth, enemyHeight, sun.x, sun.y, sunWidth, sunHeight)) {
                explosions.push({ x: enemy.x + enemyWidth / 2, y: enemy.y + enemyHeight / 2 }); // Explosion hinzufügen
                enemies.splice(index, 1); // Gegner verschwinden
                score++; // Erhöhe den Score
            }
        });

        drawEnemy(enemy);
    });

    // Raketen bewegen sich
    rockets.forEach((rocket, index) => {
        const angle = Math.atan2(mouseY - rocket.y, mouseX - rocket.x); // Richtung zur Maus
        rocket.x += Math.cos(angle) * 12; // Rakete bewegt sich in Richtung Maus (schneller)
        rocket.y += Math.sin(angle) * 12;

        // Überprüfen, ob die Rakete Meteoriten oder Planeten trifft
        meteors.forEach((meteor, meteorIndex) => {
            if (collision(rocket.x, rocket.y, rocketWidth, rocketHeight, meteor.x, meteor.y, meteorWidth, meteorHeight)) {
                explosions.push({ x: rocket.x, y: rocket.y }); // Explosion hinzufügen
                meteors.splice(meteorIndex, 1); // Meteoriten verschwinden
                rockets.splice(index, 1); // Rakete verschwinden
                score++; // Erhöhe den Score
            }
        });

        planets.forEach((planet, index) => {
            planet.angle += 0.05; // Geschwindigkeit der Planetenrotation
            planet.x = planet.sun.x + sunWidth / 2 + planet.radius * Math.cos(planet.angle);
            planet.y = planet.sun.y + sunHeight / 2 + planet.radius * Math.sin(planet.angle);

            drawPlanet(planet);

            // Kollision mit dem Planeten prüfen
            if (collision(shipX, shipY, shipWidth, shipHeight, planet.x, planet.y, planetWidth, planetHeight)) {
                lives--; // Raumschiff ist mit einem Planeten kollidiert, ziehe ein Leben ab
                planets.splice(index, 1); // Entferne den Planeten nach der Kollision
            }

            // Überprüfen, ob der Planet den Bildschirm verlässt
            if (planet.x < -planetWidth || planet.x > canvas.width + planetWidth || planet.y < -planetHeight || planet.y > canvas.height + planetHeight) {
                planets.splice(index, 1); // Entferne den Planeten, wenn er den Bildschirm verlässt
            }
        });

        // Überprüfen, ob die Rakete die Sonne berührt
        suns.forEach((sun) => {
            if (collision(rocket.x, rocket.y, rocketWidth, rocketHeight, sun.x, sun.y, sunWidth, sunHeight)) {
                rockets.splice(index, 1); // Rakete verschwinden
            }
        });

        // Überprüfen, ob die Rakete aus dem Bildschirm fliegt
        if (rocket.x < 0 || rocket.x > canvas.width || rocket.y < 0 || rocket.y > canvas.height) {
            rockets.splice(index, 1); // Entferne die Rakete, wenn sie den Bildschirm verlässt
        }

        drawRocket(rocket);
    });

    // Explosionen zeichnen
    explosions.forEach((explosion, index) => {
        drawExplosion(explosion);
        // Explosionen nach kurzer Zeit verschwinden
        setTimeout(() => {
            explosions.splice(index, 1);
        }, 500); // Explosion für 0,5 Sekunden anzeigen
    });

    // Cooldown-Anzeige für Raketen
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Leben: " + lives, 10, 40);

    // Cooldown-Anzeige für Raketen
    ctx.fillText("Raketen Cooldown: " + Math.max(0, rocketCooldown.toFixed(1)) + "s", 10, 60);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over! Dein Score: " + score, canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Hilfsfunktionen
function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// Steuerung mit WASD
document.addEventListener("keydown", (event) => {
    if (event.key === "a") {
        keys.left = true;
    } else if (event.key === "d") {
        keys.right = true;
    } else if (event.key === "w") {
        keys.up = true;
    } else if (event.key === "s") {
        keys.down = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "a") {
        keys.left = false;
    } else if (event.key === "d") {
        keys.right = false;
    } else if (event.key === "w") {
        keys.up = false;
    } else if (event.key === "s") {
        keys.down = false;
    }
});

// Mausbewegung erfassen
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left; // Berechnung der Mausposition relativ zum Canvas
    mouseY = event.clientY - rect.top;
});

// Rakete abfeuern mit Cooldown
document.addEventListener("click", () => {
    if (rocketCooldown <= 0) {
        rockets.push({ x: shipX + shipWidth / 2 - rocketWidth / 2, y: shipY + shipHeight / 2 - rocketHeight / 2 }); // Rakete wird beim Klicken erzeugt
        rocketCooldown = rocketCooldownDuration; // Setze den Cooldown
    }
});

// Spiel-Loop
function gameLoop() {
    if (rocketCooldown > 0) {
        rocketCooldown -= 0.016; // Reduziere den Cooldown alle Frame (ca. 60 FPS)
    }

    update();
    requestAnimationFrame(gameLoop);
}

// Meteoriten, Sonnen und Gegner erzeugen
setInterval(generateMeteor, 500); // Meteoriten erzeugen alle 0.5 Sekunden
setInterval(generateSun, 3000); // Sonnen erzeugen alle 3 Sekunden
setInterval(generateEnemy, 2000); // Gegner erzeugen alle 2 Sekunden
gameLoop();
