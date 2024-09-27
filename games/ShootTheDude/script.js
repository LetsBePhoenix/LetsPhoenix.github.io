const ball = document.getElementById('ball');
const pointer = document.getElementById('pointer');
const gameContainer = document.querySelector('.game-container');
const speed = 4;  // Bewegungsgeschwindigkeit erhöht
const projectileSpeed = 6; // Geschwindigkeit der neuen Kugel
const enemySpeed = 2; // Geschwindigkeit der Gegner
const enemyProjectileSpeed = 4; // Geschwindigkeit der Geschosse der Gegner
const projectileLifetime = 10000; // Lebensdauer der Kugeln in Millisekunden

let ballX = 490;  // Startposition der Kugel
let ballY = 490;
let mouseX = 0;   // Maus-X-Position
let mouseY = 0;   // Maus-Y-Position

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

const enemies = []; // Array für die Gegner
const targets = []; // Array für die gelben Vierecke
const greenTriangles = []; // Array für die grünen Dreiecke
let enemySpawnInterval; // Intervall für das Erzeugen von Gegnern
let targetSpawnInterval; // Intervall für das Erzeugen der gelben Vierecke
let greenTriangleSpawnInterval; // Intervall für das Erzeugen der grünen Dreiecke

// Tasten drücken
document.addEventListener('keydown', function (event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

// Tasten loslassen
document.addEventListener('keyup', function (event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

// Mausbewegung verfolgen
document.addEventListener('mousemove', function (event) {
    const rect = gameContainer.getBoundingClientRect();
    mouseX = event.clientX - rect.left; // Mausposition relativ zum Spielfeld
    mouseY = event.clientY - rect.top;   // Mausposition relativ zum Spielfeld
});

// Klick-Event, um neue Kugel zu erzeugen
gameContainer.addEventListener('click', function (event) {
    createProjectile(ballX + 20, ballY + 20, mouseX, mouseY); // Kugel vom Zentrum des Vierecks erzeugen
});

// Funktion zum Erzeugen einer neuen Kugel
function createProjectile(startX, startY, targetX, targetY) {
    const projectile = document.createElement('div');
    projectile.classList.add('projectile');
    projectile.style.position = 'absolute';
    projectile.style.width = '20px';
    projectile.style.height = '20px';
    projectile.style.backgroundColor = 'blue'; // Farbe der Spieler-Projektile
    projectile.style.borderRadius = '50%';
    projectile.style.top = `${startY - 10}px`; // Zentrierung der Kugel
    projectile.style.left = `${startX - 10}px`; // Zentrierung der Kugel
    gameContainer.appendChild(projectile);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    moveProjectile(projectile, angle);

    // Lebensdauer der Kugel festlegen
    setTimeout(() => {
        projectile.remove(); // Entferne die Kugel nach 10 Sekunden
    }, projectileLifetime);
}

// Funktion zum Bewegen der neuen Kugel
function moveProjectile(projectile, angle) {
    const projectileInterval = setInterval(() => {
        const currentTop = parseFloat(projectile.style.top);
        const currentLeft = parseFloat(projectile.style.left);

        projectile.style.top = `${currentTop + projectileSpeed * Math.sin(angle)}px`;
        projectile.style.left = `${currentLeft + projectileSpeed * Math.cos(angle)}px`;

        // Überprüfen, ob das Projektil ein gelbes Viereck oder ein grünes Dreieck getroffen hat
        if (checkTargetHit(projectile, currentTop, currentLeft)) {
            clearInterval(projectileInterval);
            projectile.remove(); // Entferne das Projektil
        }

        // Entferne die Kugel, wenn sie außerhalb des Sichtfelds geht
        if (currentTop < 0 || currentTop > 10000 || currentLeft < 0 || currentLeft > 10000) {
            clearInterval(projectileInterval);
            projectile.remove();
        }
    }, 1000 / 60); // 60 FPS
}

// Überprüfen, ob das Projektil ein gelbes Viereck oder ein grünes Dreieck getroffen hat
function checkTargetHit(projectile, currentTop, currentLeft) {
    // Überprüfen auf gelbe Vierecke
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const targetX = parseFloat(target.style.left);
        const targetY = parseFloat(target.style.top);

        // Überprüfen auf Kollision
        if (currentLeft >= targetX && currentLeft <= targetX + 40 &&
            currentTop >= targetY && currentTop <= targetY + 40) {
            target.remove(); // Zerstöre das gelbe Viereck
            targets.splice(i, 1); // Entferne es aus dem Array
            return true; // Gibt zurück, dass das Projektil getroffen hat
        }
    }

    // Überprüfen auf grüne Dreiecke
    for (let i = 0; i < greenTriangles.length; i++) {
        const triangle = greenTriangles[i];
        const triangleX = parseFloat(triangle.style.left);
        const triangleY = parseFloat(triangle.style.top);

        // Überprüfen auf Kollision
        if (currentLeft >= triangleX && currentLeft <= triangleX + 40 &&
            currentTop >= triangleY && currentTop <= triangleY + 40) {
            triangle.shots++; // Erhöhe den Schusszähler des Dreiecks
            if (triangle.shots >= 3) {
                triangle.remove(); // Zerstöre das grüne Dreieck
                greenTriangles.splice(i, 1); // Entferne es aus dem Array
            }
            return true; // Gibt zurück, dass das Projektil getroffen hat
        }
    }

    return false; // Gibt zurück, dass nichts getroffen wurde
}

// Funktion zum Erzeugen eines neuen Gegners
function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.top = `${Math.random() * 10000}px`;
    enemy.style.left = `${Math.random() * 10000}px`;
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
    moveEnemy(enemy);
}

// Funktion zum Bewegen der Gegner
function moveEnemy(enemy) {
    const enemyInterval = setInterval(() => {
        const enemyX = parseFloat(enemy.style.left) + 20; // Mitte des Gegners
        const enemyY = parseFloat(enemy.style.top) + 20; // Mitte des Gegners

        // Berechne den Winkel zum Spieler
        const angle = Math.atan2(ballY + 20 - enemyY, ballX + 20 - enemyX);

        // Bewege den Gegner in Richtung des Spielers
        enemy.style.top = `${parseFloat(enemy.style.top) + enemySpeed * Math.sin(angle)}px`;
        enemy.style.left = `${parseFloat(enemy.style.left) + enemySpeed * Math.cos(angle)}px`;

        // Gegner schießen alle 1000ms (1 Sekunde)
        if (Math.random() < 0.02) { // 2% Wahrscheinlichkeit pro Frame
            shootEnemyProjectile(enemyX, enemyY);
        }

        // Entferne den Gegner, wenn er außerhalb des Sichtfelds geht
        if (enemyX < 0 || enemyX > 10000 || enemyY < 0 || enemyY > 10000) {
            clearInterval(enemyInterval);
            enemy.remove();
        }
    }, 1000 / 60); // 60 FPS
}

// Funktion, damit der Gegner schießt
function shootEnemyProjectile(startX, startY) {
    const projectile = document.createElement('div');
    projectile.classList.add('projectile');
    projectile.style.position = 'absolute';
    projectile.style.width = '20px';
    projectile.style.height = '20px';
    projectile.style.backgroundColor = 'red'; // Farbe der Gegner-Projektile
    projectile.style.borderRadius = '50%';
    projectile.style.top = `${startY - 10}px`; // Zentrierung der Kugel
    projectile.style.left = `${startX - 10}px`; // Zentrierung der Kugel
    gameContainer.appendChild(projectile);

    const angle = Math.atan2(ballY + 20 - startY, ballX + 20 - startX);
    moveEnemyProjectile(projectile, angle);

    // Lebensdauer der Kugel festlegen
    setTimeout(() => {
        projectile.remove(); // Entferne die Kugel nach 10 Sekunden
    }, projectileLifetime);
}

// Funktion zum Bewegen der Geschosse der Gegner
function moveEnemyProjectile(projectile, angle) {
    const projectileInterval = setInterval(() => {
        const currentTop = parseFloat(projectile.style.top);
        const currentLeft = parseFloat(projectile.style.left);

        projectile.style.top = `${currentTop + enemyProjectileSpeed * Math.sin(angle)}px`;
        projectile.style.left = `${currentLeft + enemyProjectileSpeed * Math.cos(angle)}px`;

        // Überprüfen, ob das Projektil den Spieler getroffen hat
        if (checkPlayerHit(currentTop, currentLeft)) {
            clearInterval(projectileInterval);
            projectile.remove(); // Entferne das Projektil
        }

        // Entferne die Kugel, wenn sie außerhalb des Sichtfelds geht
        if (currentTop < 0 || currentTop > 10000 || currentLeft < 0 || currentLeft > 10000) {
            clearInterval(projectileInterval);
            projectile.remove();
        }
    }, 1000 / 60); // 60 FPS
}

// Überprüfen, ob das Geschoss den Spieler getroffen hat
function checkPlayerHit(currentTop, currentLeft) {
    const playerCenterX = ballX + 20; // Mitte des Spielers
    const playerCenterY = ballY + 20; // Mitte des Spielers
    return (currentLeft >= playerCenterX - 20 && currentLeft <= playerCenterX + 20 &&
        currentTop >= playerCenterY - 20 && currentTop <= playerCenterY + 20);
}

// Funktion zum Erzeugen der gelben Vierecke
function createTarget() {
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.position = 'absolute';
    target.style.width = '40px';
    target.style.height = '40px';
    target.style.backgroundColor = 'yellow';
    target.style.top = `${Math.random() * 10000}px`;
    target.style.left = `${Math.random() * 10000}px`;
    gameContainer.appendChild(target);
    targets.push(target);
}

// Funktion zum Erzeugen der grünen Dreiecke
function createGreenTriangle() {
    const triangle = document.createElement('div');
    triangle.classList.add('green-triangle');
    triangle.style.position = 'absolute';
    triangle.style.width = '0';
    triangle.style.height = '0';
    triangle.style.borderLeft = '20px solid transparent';
    triangle.style.borderRight = '20px solid transparent';
    triangle.style.borderBottom = '40px solid green'; // Farbe des Dreiecks
    triangle.style.top = `${Math.random() * 10000}px`;
    triangle.style.left = `${Math.random() * 10000}px`;
    triangle.shots = 0; // Schusszähler initialisieren
    gameContainer.appendChild(triangle);
    greenTriangles.push(triangle);
}

// Intervall für das Erzeugen von Gegnern
enemySpawnInterval = setInterval(createEnemy, 2000); // Alle 2 Sekunden einen neuen Gegner erzeugen
targetSpawnInterval = setInterval(createTarget, 2000); // Alle 2 Sekunden ein neues gelbes Viereck erzeugen
greenTriangleSpawnInterval = setInterval(createGreenTriangle, 3000); // Alle 3 Sekunden ein neues grünes Dreieck erzeugen

// Hauptspiel Schleife
function update() {
    // Spielerbewegung
    if (keys.w && ballY > 0) {
        ballY -= speed;
    }
    if (keys.s && ballY < 9960) { // 10000 - 40
        ballY += speed;
    }
    if (keys.a && ballX > 0) {
        ballX -= speed;
    }
    if (keys.d && ballX < 9960) { // 10000 - 40
        ballX += speed;
    }

    updateBallPosition();
    updatePointer(); // Pointer-Position hier aktualisieren
    requestAnimationFrame(update);
}

// Funktion zum Aktualisieren der Position des Balles und des Zeigers
function updateBallPosition() {
    ball.style.top = `${ballY}px`;
    ball.style.left = `${ballX}px`;

    // Bewege das Spielfeld, sodass der Ball im Zentrum des Viewports bleibt
    const viewportX = Math.max(0, Math.min(9800, ballX - 600)); // 1200 / 2
    const viewportY = Math.max(0, Math.min(9800, ballY - 400)); // 800 / 2

    gameContainer.style.transform = `translate(-${viewportX}px, -${viewportY}px)`;
}

// Funktion zur Aktualisierung der Pointer-Position
function updatePointer() {
    // Berechne den Winkel zum Mauszeiger
    const angle = Math.atan2(mouseY - (ballY + 20), mouseX - (ballX + 20)); // +20, um die Mitte der Kugel zu bekommen

    // Drehe das Viereck in Richtung des Mauszeigers
    pointer.style.transform = `translate(0, -50%) rotate(${angle}rad)`; // Mitte des Vierecks auf der Kugel zentrieren
    pointer.style.top = `${ballY + 20}px`; // Positioniere das Viereck an der Kugel
    pointer.style.left = `${ballX + 20}px`; // Positioniere das Viereck an der Kugel
}

// Starte die Update-Schleife
requestAnimationFrame(update);
