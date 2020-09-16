// ********************************* //
// ** VARIABLES DANS OBJET GLOBAL ** //
// ********************************* //

// On sélectionne le canvas
var canvas = document.getElementById('myCanvas')
// Pour dessiner dessus on doit sélectionner le contexte
// c'est un objet HTML pré-défini avec des propriétés et des méthodes pour dessiner sur le canvas
// Comme on part toujours de canvas.getContetx('2d') pour dessiner ou effacer => on le store dans une variable
var ctx = canvas.getContext('2d');

// définit point de départ centré en bas
var x = canvas.width / 2;   // x=240
var y = canvas.height - 30; // y=290
// nouvelle position de la balle chaque 10ms = déplacement x / déplacement y
var dx = 2;
var dy = -2;
// Rayon de la balle
var ballRadius = 10;
// Raquette (paddle)
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;     // au centre = début du paddle en x
var paddleY = canvas.height - paddleHeight;         // tout en bas
// Boutons
var rightPressed = false;
var leftPressed = false;
// colors
var color = "#0095DD";
// var for setInterval() + delay for setInterval()
var timerId;
var delay = 10;
// score
var score = 0;
// lives
var lives = 3;
// game over
var gameOverNotify = document.querySelector(".game-over-notify");

// Briques
var brickHeight = 20;       // Hauteur d'une brique
var brickWidth = 75;        // Largeur d'une brique
var brickRowCount = 3;      // Lignes de briques
var brickColumnCount = 5;   // Colonnes de briques
var brickPadding = 10;      // Padding autour d'une brique
var brickOffsetTop = 30;    // Décalage sur y par rapport à la brique précédente
var brickOffsetLeft = 30;   // Décalage sur x par rapport à la brique précédente

// ********************************* //
// ************ BRIQUES ************ //
// ********************************* //

// Tableau à 2 dimensions
// "c = colonnes de briques" qui contiennent "r = lignes de briques" qui continnent des briques "x + y"
var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = []; // on a nos 5 colonnes => [ [] [] [] [] [] ]
    for (var r = 0; r < brickRowCount; r++) { // for() dans un for() => pour chaque 1er for() on fait tous les 2e for(), donc c = 0 et dedans r = 0 à r = 2
        bricks[c][r] = { x: 0, y: 0, status: 1 }; // On a nos 3 lignes dans chaque colonne => [ [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}] [...] [...] [...] [...] ]
    }
}
// Pour accéder aux coordonnées de chacune des briques => bricks[0][1].x et bricks[0][1].y


function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            // Chaque position brickX est définie par sa (largeur + padding) fois le nombre de colonnes (c) + un décalage brickOffsetLeft
            // Afin qu'aucune brique ne touche le bord de gauche
            // Pareil pour brickY => (hauteur + padding) et la valeur pour les lignes (r) + brickOffsetTop pour ne pas toucher le haut
            if (bricks[c][r].status == 1) { // si status = 0 alors on n'affiche pas la brique
                var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft; // 5 colonnes de 3 MAIS 3 colonnes de 5 si on inverse c et r
                var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Détection de la collision avec les briques
// on parcoure toutes les briques 1 par 1
// Si le centre de la balle se trouve à l'intérieur des coordonnées d'une de nos briques, nous changerons la direction de la balle.
// Pour que le centre de la balle soit à l'intérieur de la brique, les quatre affirmations suivantes doivent être vraies :

// La position x de la balle est supérieure à la position x de la brique.
// La position x de la balle est inférieure à la position x de la brique plus sa largeur.
// La position y de la balle est supérieure à la position y de la brique.
// La position y de la balle est inférieure à la position y de la brique plus sa hauteur

function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var brique = bricks[c][r]; // ici brique correspond à chacune des briques
            if (brique.status == 1) {
                if (x > brique.x && x < brique.x + brickWidth && y > brique.y && y < brique.y + brickHeight) {
                    dy = -dy;
                    brique.status = 0;
                    score++;
                    // paddleWidth -= 4;
                    color = "red";
                    setTimeout(function () {
                        color = "#0095DD"
                    }, 250);
                    if (score == brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                        // clearInterval(timerId); // Needed for Chrome to end game
                    }
                }
            }
        }
    }
}

// Score
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = color; // color of the font
    ctx.fillText("Score: " + score, 8, 20); // the text itself + coordinates
}

// lives
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}


// ********************************* //
// ********* BALL & PADDLE ********* //
// ********************************* //

// Dessine le paddle (raquette)
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Dessine la balle, coordonnées x et y du centre du cercle, le rayon du cercle, l'angle de départ et de fin
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// On affiche et supprime la balle en continu avec un setInterval() pour la déplacer
function draw() {
    // Chaque fois qu'on relance la fonction, alors on enlève l'image dernière créée
    // x et y de l'emplacement de début coin supérieur gauche du rectangle à effacer, puis x et y du coin inférieur droit
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Donc ici on clear le canvas entier pour redessiner dessus

    // Fonctions qui dessinent la balle et la raquette avec les nouvelles coordonnées
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // Variables pour collision
    // Mur du haut => 0 sur y correspond au mur du haut, et 320 au mur du bas, si "<0" ou >320 on inverse la direction
    // On ajoute ballRadius qui est équivalent à la moitié du diamètre de la balle,
    // car sinon elle s'enfonce de la valeur de son rayon dans le mur,
    // car nous calculions la collision à partir des coordonnées x et y qui sont le centre de la balle !
    if (y + dy < ballRadius) { // y + dy < 0 + ballRadius
        dy = -dy;

    } // Rebondir sur le paddle => si la balle est à la hauteur du paddle et qu'ils sont sur le même x, alors ça rebondit !
    // Ci-dessous on peut aussi tester quelque chose dans ce style-là : ball.body.velocity.x = -1*5*(paddle.x-ball.x);
    if (y + dy > canvas.height - ballRadius - paddleHeight && x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
        if (x < paddleX + paddleWidth / 4 || x > paddleX + 3/4*paddleWidth) {
            dx = dx * 1.5;
        } else {
            dx = dx / 1.3;
        }
        // On accélère le timer dès qu'on touche avec la barre => clear + relancer sinon ça ne modifie pas
        // clearInterval(timerId);
        // delay = delay - 1;
        // console.log("delay:", delay)
        // timerId = setInterval(draw, delay);
    }
    // Si on va en bas alors on perd et on relance le jeu
    if (y + dy > canvas.height - ballRadius) {
        lives--;
        if (!lives) {
            gameOverNotify.innerHTML += `<span style="color:#0095DD">Score = ${score}</span>`
            gameOverNotify.style.display = 'flex';
            // clearInterval(timerId);
            return; // ça fait sortir de la fonction et donc la boucle s'arrête et plus rien ne bouge
        } else {
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
        // document.location.reload();
        // alert("GAME OVER");
        // clearInterval(timerId); // Needed for Chrome to end game
    }
    // Même principe pour gauche/droite
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        dx = -dx;
    }
    x += dx;
    y += dy;

    if (rightPressed && (paddleX < canvas.width - paddleWidth)) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // ********************************* //
    // **** requestAnimationFrame() **** //
    // ********************************* // 
    
    // "requestAnimationFrame()" helps the browser render the game better than the fixed framerate we currently have implemented using setInterval()
    // So I replace my timerId = setInterval(draw, delay); with simply draw(); to call the function once + requestAnimationFrame(draw); at the end of the function to call it undefinitely
    // And I remove all the clearInterval(timerId); of course since they are useless now
    requestAnimationFrame(draw);

    // The draw() function is now getting executed again and again within a requestAnimationFrame() loop, but instead of the fixed 10 milliseconds frame rate,
    // we are giving control of the framerate back to the browser. It will sync the framerate accordingly and render the shapes only when needed.
    // This produces a more efficient, smoother animation loop than the older setInterval() method.
}

draw();
// timerId = setInterval(draw, delay); // 10ms


////////////////////////////////////////////////////////////


// ********************************* //
// ******** EVENT LISTENERS ******** //
// ********************************* //

// 1) KEYBOARD CONTROLS

// event listeners qui écoutent lorsqu'on a besoin d'eux et déclenchent chacun une fonction appelée event handler
// useCapture is the name of the Boolean at the end that specifies whether the event should be executed in the capturing
// or in the bubbling phase => default is false = bubbling phase / true = bubbling phase
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// keydown = une touche est enfoncée, ça déclenche la fonction qui vérifie si c'est la touche "bas" ou "haut"
// keyup = la touche est relâchée

// event handlers
function keyDownHandler(event) {
    if (event.keyCode == 39) {
        rightPressed = true;
    } else if (event.keyCode == 37) {
        leftPressed = true;
    }
}
// Quelle touche on relâche pour les remettre directement à "false"
function keyUpHandler(event) {
    if (event.keyCode == 39) {
        rightPressed = false;
    } else if (event.keyCode == 37) {
        leftPressed = false;
    }
}


// 2) MOUSE CONTROLS => mettre le milieu du paddle au niveau de la souris sur x (on ne touche jamais au y)
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(event) {
    // MouseEvent.clientX est une fonction de javascript qui est read-only ! Elle donne les coordonnées de l'événement à la souris dans l'application/viewport (et non dans la page)
    // par exemple, cliquer en haut à gauche donnera la valeur clientX = 0, même si la page est scrollée
    // Si on veut la position réelle dans la page alors il faut utiliser "event.screenX" "event.screenY" et non "event.clientX" et "event.clientY"
    // Voici comment ça s'écrit selon MDN =>    var x = instanceOfMouseEvent.clientX

    // For block-level elements, offsetTop, offsetLeft, offsetWidth, and offsetHeight describe the border box of an element relative to the offsetParent.
    // MORE DIFFICULT FOR INLINE ELEMENTS => https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft

    var relativeX = event.clientX - canvas.offsetLeft; // position horizontale de la souris dans le viewport - la distance entre le bord gauche du canvas et le bord gauche du viewport
    // If the relative X pointer position is greater than zero and lower than the Canvas width = the pointer is within the Canvas boundaries
    if (relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
        paddleX = relativeX - paddleWidth / 2;  // paddleX est le début du paddle = position du curseur de la souris - la largeur du paddle/2
    }
}


// 3) GAME OVER
gameOverNotify.addEventListener("click", function () {
    document.location.reload();
});















// ************************** //
// ********* CANVAS ********* //
// ************************** // 

// // Instructions entre beginPath() et closePath()
// ctx.beginPath();

// // Définit un rectangle avec début X + Y puis taille X + Y (ici carré)
// ctx.rect(20, 40, 50, 50);
// // La propriété fillStyle stocke une couleur
// // qui sera utilisée par la méthode fill() pour peindre le carré en rouge.
// ctx.fillStyle = "#FF0000";
// ctx.fill();

// ctx.closePath();


// // Faire un cercle
// ctx.beginPath();
// // x + y + rayon + start angle + end angle (toujours Math.PI * 2 pour fermer le cercle)
// // Direction du dessin par défaut "false" = sens des aiguilles d'une montre (facultatif)
// ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
// ctx.fillStyle = "green";
// ctx.fill();
// ctx.closePath();


// // Faire un rectangle aux contours bleus
// ctx.beginPath();
// ctx.rect(160, 10, 100, 40);

// // fillStyle est pour remplir !== strokeStyle pour la bordure
// ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
// // Du coup on met .stroke() et non .fill() sinon ça remplit tout
// ctx.stroke();

// ctx.closePath();