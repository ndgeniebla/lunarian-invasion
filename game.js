
'use strict';
const levelSize = vec2(200,200);
objectMaxSpeed = 4;
objectDefaultFriction = 1;
objectDefaultMass = 0.000001;
tileSizeDefault = vec2(24);
setFontDefault("Pixels");

const defaultEntitySize = 12 * 2; // in pixels
const defaultItemProjSize = 8 * 2;
const defaultTileSize = 12 * 2;

let playerHealth = 0;
let player;

let spawnOnce = false;
let waveInProgress = false;
let gameStart = false;
let gameStarted = false;
let gameOver = false;
let waveNum = 1;
let totalEnemies = 0;
let totalMaxEnemies = 0;
let timeStopped = false;
let totalPoints = 0;
let startMaxPower = false;

let screenShake = 0;

// ===== MAIN MENU VARIABLES ======
let cursor;
let endlessButton = new Button(vec2(-1000, -1000));
let reimuButton = new Button(vec2(-1000, -1000));
let sakuyaButton = new Button(vec2(-1000, -1000));
let youmuButton = new Button(vec2(-1000, -1000));
let customGameButton = new Button(vec2(-1000, -1000));
let add1WaveButton = new Button(vec2(-1000, -1000));
let add5WaveButton = new Button(vec2(-1000, -1000));
let add25WaveButton = new Button(vec2(-1000, -1000));
let sub1WaveButton = new Button(vec2(-1000, -1000));
let sub5WaveButton = new Button(vec2(-1000, -1000));
let sub25WaveButton = new Button(vec2(-1000, -1000));
let maxPowerButton = new Button(vec2(-1000, -1000));
let creditsButton = new Button(vec2(-1000, -1000));
let startGameButton = new Button(vec2(-1000, -1000));
let backButton = new Button(vec2(-1000, -1000));

const menuStates = {
    mainScreen: "mainScreen",
    characterSelect: "characterSelect",
    customGame: "customGame",
    credits: "credits"
}

let menuState = "";
let characterSelected = "";
    
let characters = {
    reimu: "Reimu",
    sakuya: "Sakuya",
    youmu: "Youmu",
}

let menuButtons = [ endlessButton, 
                    reimuButton, sakuyaButton, youmuButton, 
                    customGameButton, add1WaveButton, add5WaveButton, add25WaveButton, sub1WaveButton, sub5WaveButton, sub25WaveButton,
                    creditsButton,
                    startGameButton,
                    backButton
                  ];

// ==================================


const tileTable = {
    //tiles.png (textureIndex = 0)
    sakuyaNormal: vec2(0, defaultEntitySize * 0),
    sakuyaTimeStop: vec2(0, defaultEntitySize * 1),
    reimu: vec2(0, defaultEntitySize * 2),
    youmu: vec2(0, defaultEntitySize * 3),

    swarmer: vec2(0, defaultEntitySize * 4),
    electricPillar: vec2(defaultEntitySize * 2, defaultEntitySize * 4),
    gunner: vec2(0, defaultEntitySize * 5),
    shotGunner: vec2(0, defaultEntitySize * 6),
    railGunner: vec2(0, defaultEntitySize * 7),

    bg1: vec2(0, defaultTileSize * 8),
    
    //==============================
    
    //projectileItems.png (textureIndex = 1)
    playerProjectiles: vec2(0, defaultItemProjSize * 0),
    enemyProjectiles: vec2(0, defaultItemProjSize * 1),
    items: vec2(0, defaultItemProjSize * 2),
    
    
    //==============================
    //particles.png (textureIndex = 2)
    playerParticles: vec2(0, defaultItemProjSize * 0),

    //==============================
    //bgTiles.png (textureIndex = 3)
};
// (0,0) starts at the bottom left (???)

const bgDrawSize = 24;
const bgTile = tile(tileTable.bg1, vec2(bgDrawSize));

function createPlayer() {
    switch (characterSelected) {
        case characters.reimu:
            player = new PlayerReimu;
            break;
        case characters.sakuya:
            player = new PlayerSakuya;
            break;
        case characters.youmu:
            player = new PlayerYoumu;
            break;
    }
}
function prepGame() {
    createPlayer();
    if (startMaxPower) {
        player.power = player.maxPower;
    }

    new Wall(vec2(-levelSize.x/2, 0), vec2(1, levelSize.y)); //left wall
    new Wall(vec2(levelSize.x/2, 0), vec2(1, levelSize.y)); // right wall
    new Wall(vec2(0, levelSize.y/2), vec2(levelSize.x, 1)); // top wall
    new Wall(vec2(0, -levelSize.y/2), vec2(levelSize.x, 1)); // bottom wall
   
    gameStarted = true;
}

function startGame() {
    if (!waveInProgress) {
        const waveDetails = getWaveDetails(waveNum);
        totalEnemies = waveDetails.enemies;
        totalMaxEnemies = totalEnemies;
        console.log(`Wave ${waveNum} started.`);
        console.log(waveDetails);
        waveInProgress = true;
        startWave(waveNum);
    } else if (totalEnemies === 0) {
        waveInProgress = false;
        waveNum++;
    }   
    
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // called once after the engine starts up
    // setup the game
    canvasFixedSize = vec2(2100, 1920);
    cameraPos = vec2(0, 0);
    cameraScale = 16 * 2;

    
    // draw main menu
    drawRect(vec2(0, 0), levelSize.scale(2), new Color(0.2, 0, 0.2, 1));
    makeMenuScreen(menuStates.mainScreen);
    cursor = new Cursor();
       
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    //position of rect is the middle of its shape
    // drawRect(vec2(0,0), levelSize, (new Color).setHex("#1e4a2a"));
    // console.log(totalEnemies)
    drawRect(vec2(0, 0), levelSize.scale(2), new Color(0.2, 0, 0.2, 1));
    menuSelectionHandler();
    
    if (startGameButton.selected && !gameStarted) {
        if (!characterSelected) {
            drawText("Please select a character!", vec2(0, -15), 6, new Color(1, 0, 0), 0.4);
        } else {
            prepGame();
            clearCurrentMenu();
        }
    }
    
    if (menuState === menuStates.customGame && !gameStarted) {
        drawText("Starting Wave", vec2(-15, -3), 6, new Color(1, 1, 1), 0.4);
        drawText(waveNum, vec2(-15, -7), 10, new Color(1, 1, 1), 0.4);
    }

    if (screenShake > 0) {
        cameraPos.x += rand(-1, 1);
        cameraPos.y += rand(-1, 1);
        screenShake--;
    }
    
    if (gameStarted) {
        startGame();
        drawGround(); //it's bad to have this here
        //but railgun lasers stop rendering if you drawGround() in gameRender() instead of gameUpdate()
        //Such a STUPID error/bug, but you gotta do what you gotta do.
        //Splitting the ground and the barrier rendering seems to have helped with the screen-tearing at least
    }
}


///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    // called after physics and objects are updated
    // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    // called before objects are rendered
    // draw any background effects that appear behind objects
    if (gameStarted) {
        drawBarrier();
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // called after objects are rendered
    // draw effects or hud that appear above all objects
    if (gameStarted) {
        playerHud();

        if (player.health <= 0) {
            drawRect(vec2(0), levelSize.scale(2), (new Color).setHex("#520000").scale(1, 0.6));
            drawTextScreen("Game Over!", vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2.7), 500, new Color(1, 0, 0), 20);
            drawTextScreen(`Score: ${totalPoints}`, vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2.0), 200, (new Color).setHex("#ffd52b"), 20);
            gameOver = true;
        }
    }
    // drawTextScreen(player.health, vec2(mainCanvasSize.x/2, mainCanvasSize.y - 40), 60, new Color(255, 0, 0));
    // drawTextScreen(`Damage: ${player.weapon.damage.toFixed(2)}`, vec2(205, 150), 60, new Color(255, 255, 255));
    // drawTextScreen(totalEnemies, vec2(mainCanvasSize.x/2, 40), 60, new Color(255, 0, 0));
    // drawTextScreen(`Points: ${totalPoints}`, vec2(mainCanvasSize.x/2 + 400, 40), 60, new Color(255, 255, 255));
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['assets/tiles.png', 'assets/projectileItems.png', 'assets/particles.png', 'assets/bgTiles.png']);