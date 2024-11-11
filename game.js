
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

soundEnable = true;

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

let pauseScreen;
let gamePaused = false;
let pauseScreenCreated = false;

let menuMusicStarted = false;
let failSoundPlayed = false;
let gameStartedNoSound = false;
let userClickStartCount = 0;

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
let instructionsButton = new Button(vec2(-1000, -1000));
let startGameButton = new Button(vec2(-1000, -1000));
let backButton = new Button(vec2(-1000, -1000));
let volumeButton = new Button(vec2(-1000, -1000));

const menuStates = {
    mainScreen: "mainScreen",
    characterSelect: "characterSelect",
    customGame: "customGame",
    instructions: "instructions"
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
                    instructionsButton,
                    startGameButton,
                    backButton
                  ];

let characterInfo = [];

// ==================================
// SOUNDS
// const enemyHitSound = new Sound([,,187,.02,.04,.03,,1.1,,,,,.04,,,,,.79,.02,,-1444]); // Blip 573
const healthUpSound = new Sound([.5,,106,.08,.3,.18,,2.6,,-146,491,.08,.08,,,,,.69,.25,,-1424]); // Powerup 296
const maxPowerUpSound = new Sound([.5,,609,,.14,.2,1,.5,-7,,396,.05,.09,,,,,.7,.22,,-608]); // Powerup 221

const enemyDeathSound = new Sound([.8,.25,,.02,,.05,1,,.4,,,,.04,,,,,0,.01,,-1444]); // Blip 573 
const railgunShootSound = new Sound([.2,,82,,.14,.15,3,1.3,-20,2,,,,,,.1,.17,.83,.19,,1e3]); // Shoot 600
const railgunHitSound = new Sound([1,,45,,.1,.64,4,1.8,-5,-1,,,.14,.1,,.4,,.34,.23,.05,265]); // Explosion 193
const slowedSound = new Sound([1.1,,417,.01,.07,.06,1,1.8,,,,,.03,.4,45,,,.45,.04,.42]); // Hit 1355
const swarmerShootSound = new Sound([.05,,261.6256,.02,.03,.03,1,,,7,,,,,173,,,0,.01]); // Blip 1786
const gunnerShootSound = new Sound([.03,,195.9977,.02,.03,.03,,2.5,,7,,,,,173,,,.52,.01]); // Blip 1786
const shotGunnerSound = new Sound([.4,0,174.6141,.05,,.03,1,.6,,9,,,.02,.2,8.8,,,.97,.01]); // Random 1780 
const boltShootSound = new Sound([0.05,,324,.03,.05,.09,,1.9,-3,-7,,,.04,,,,,.57,.02,,-1497]); // Pickup 1885

const blessingSound = new Sound([1,,398,.03,.24,.09,1,4,,,81,.06,.02,,,,.18,.54,.11]); // Powerup 235
const blessingBreakSound = new Sound([0.7,,284,.01,.05,.09,2,3.8,5,,,,,.5,,.1,,.78,.1,.04,-2489]); // Hit 369

const youmuShootSound = new Sound([,,173,.03,.01,.02,1,.9,,,50,.14,.01,1,2,,,-0.1,.05,,1]); // Hit 894 - Mutation 4 
const spiritSlashSound = new Sound([,,44,.03,,.62,3,1.2,7,-8,,,,.2,,.4,,.4,.13,.33,-3496]); // Explosion 143
const spiritFinalSlashSound = new Sound([,,364,.2,.21,.05,3,.8,-5.2,-18,,,,,32,.1,.35,.5,.09]); // Shoot 1407
const myonBlockSound = new Sound([2.1,,327,.02,,.008,2,1.8,-4,,,,,.8,,.1,.17,.47,.06,,-2231]); // Hit 290
const myonRespawnSound = new Sound([2.0,,278,.02,.05,.11,,2.5,10,,,,,,,,,.56,.05,,897]); // Pickup 342
// const reimuShootSound = new Sound([1.9,.03,349.2282,,.03,.07,,2,,-10,,,.02,,,,,0,.12]); // Pickup 339
//
const reimuShootSound = new Sound([0.3,,510,,.01,.11,,1.4,2.9,-91,-50,,.01,,,,,.54,,,-978]); // Random 155 - Mutation 1 
const reimuBombSound = new Sound([.2,0,540,.05,.3,.07,,3.2,,47,,,.02,,6.7,,,.9,.18,,-525]); // Powerup 1797
const reimuBombDestroySound = new Sound([.6,0,232,.01,.11,.49,1,.4,,,,,.07,,.3,,,.78,.12]); // Powerup 2006
// const youmuShootSound = new Sound([.7,0,285,.01,,.09,,,40.6,,-250,.02,,1.1,2,,,.66,.02,.2,-1166]); // Jump 495

const sakuyaShootSound = new Sound([.7,0,73.41619,,,.09,,,40.6,,-650,,,1.1,2,,,.5,,.2,-1166]); // Jump 495
const sakuyaDamageBoostSound = new Sound([1.1,0,197,.09,.14,.19,,1.2,,,41,.08,.06,,,,,.6,.12,.07]); // Powerup 1046
const timeStopSound = new Sound([1.0,0,130.8128,.05,.03,.3,1,.1,,,,,,.1,,,.18,.93,.11,,-1495]); // Music 1047
const timeStopTick = new Sound([,,523.2511,,,.03,,,,,,-0.02,,,,,,1.5]); // Music 1108
// const timeStopEnd = new Sound([2,0,130.8128,.13,.66,.35,,1.6,,,,,,.1,,,.14,.32,.02,,-1428]); // Music 1123
const timeStopEnd = new Sound([,,652,.05,.19,.47,,2.4,,174,-107,.09,.05,,,,,.54,.18,.43]); // Powerup 1131

const buttonClickSound = new Sound([0.2,0,9,.01,.02,.03,,2.6,16,,,,,.1,,,,.97,.02]); // Blip 1954 
const pickupSound = new Sound([0.6,,523.2511,,,.01]); // Random 1359
const pauseSound = new Sound([1.1,0,43,.01,.04,.03,,4.8,,,,,,,,,,.72,.02]); // Blip 1393
const specialNotReadySound = new Sound([1.2,0,10,.01,.04,.05,1,.5,-81,5,,.01,-0.01,,,,.02,.42,,,-1338]); // Blip 1503 - Mutation 1
const deathSound = new Sound([1.9,,563,.42,.02,.4,1,.3,,,87,.27,,,.1,,.37,.6,.08]); // Random 1768 
const deathSoundExtra = new Sound([,,58,.04,.3,.57,2,2.1,3,6,,,,1.2,,.2,,0,.27]); // Explosion 2011
const menuMusic = new SoundWave("assets/menu.mp3");

// LittleJS has an undocumented(?) issue where if the audio files are too big, it's possible for the player to start the game before the SoundWave file has properly loaded.
// This means that no music will play if the player immediately starts the game before any of the audio files have loaded.
const bgReimu = new SoundWave("assets/reimu-theme.mp3");
const bgSakuya = new SoundWave("assets/sakuya-theme.mp3");
const bgYoumu = new SoundWave("assets/youmu-theme.mp3");

document.addEventListener("click", (e) => {
    if (!menuMusic.isLoading() && soundEnable) userClickStartCount++; // this prevents the user from playing the menu music multiple times
    //since the below function is async, it's possible to make it resume and play multiple times if the user decides to click multiple times on the home screen
    if (!gameStarted && !menuMusicStarted && soundEnable && userClickStartCount === 1) audioContext.resume().then(() => {
        menuMusic.play(null, 1, null, null, true);
        menuMusicStarted = true;
        userClickStartCount = 0;
        // console.log("hello")
    });
});

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
    orb: vec2(0, defaultTileSize * 9),
    
    //==============================
    
    //projectileItems.png (textureIndex = 1)
    playerProjectiles: vec2(0, defaultItemProjSize * 0),
    enemyProjectiles: vec2(0, defaultItemProjSize * 1),
    items: vec2(0, defaultItemProjSize * 2),
    
    
    //==============================
    //particles.png (textureIndex = 2)
    playerParticles: vec2(0, defaultItemProjSize * 0),

};
// (0,0) starts at the bottom left (???)

const bgDrawSize = 24;
const bgTile = tile(tileTable.bg1, vec2(bgDrawSize));

function createPlayer() {
    switch (characterSelected) {
        case characters.reimu:
            player = new PlayerReimu;
            bgReimu.play(null, 1, null, null, true);
            break;
        case characters.sakuya:
            player = new PlayerSakuya;
            bgSakuya.play(null, 1, null, null, true);
            break;
        case characters.youmu:
            player = new PlayerYoumu;
            bgYoumu.play(null, 1, null, null, true);
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

    // cursor.destroy();
    // cursor = undefined;
    
    cursor.setCollision(false, false);
    
    if (!soundEnable) gameStartedNoSound = true;

    menuMusic.stop();
    menuMusicStarted = false;
    
    gameStarted = true;
}

function startGame() {
    if (!waveInProgress) {
        const waveDetails = getWaveDetails(waveNum);
        totalEnemies = waveDetails.enemies;
        totalMaxEnemies = totalEnemies;
        // console.log(`Wave ${waveNum} started.`);
        // console.log(waveDetails);
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
    // document.getElementById('canvas').addEventListener("click", (event) => audioContext.resume());
    // menuMusic.play(null, 0.5, null, null, true);


    
    // draw main menu
    // drawRect(vec2(0, 0), levelSize.scale(2), new Color(0.2, 0, 0.2, 1));
    makeMenuScreen(menuStates.mainScreen);
    cursor = new Cursor();
       
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    //position of rect is the middle of its shape
    // drawRect(vec2(0,0), levelSize, (new Color).setHex("#1e4a2a"));
    // console.log(totalEnemies)
    // drawRect(vec2(0, 0), levelSize.scale(2), new Color(0.2, 0, 0.2, 1));
    // drawMenuBg();
    //
    if (!gameStarted) {
        mainContext.drawImage(menuBg, 0, 0, 2100, 2100);
        if (menuState === menuStates.mainScreen) {
            mainContext.drawImage(logo, 450, 100, 1200, 480);
            drawText("This is a Touhou Project fan game. Touhou Project is the property of Team Shanghai Alice", vec2(0, -28), 2.5, new Color(1, 1, 1), 0.5);
        } 
    }
    menuSelectionHandler();
    
    if (startGameButton.selected && !gameStarted) {
        if (!characterSelected) {
            if (menuState === menuStates.characterSelect) {
                drawText("Please select a character!", vec2(0, -14), 7, new Color(1, 0, 0), 0.4);
            } else {
                drawText("Please select a character!", vec2(0, -18), 5, new Color(1, 0, 0), 0.4);
            }
        } else {
            prepGame();
            clearCurrentMenu();
        }
    }
    failSoundPlayed = false;
    
    if (menuState === menuStates.customGame && !gameStarted) {
        drawText("Custom Game", vec2(0, 27), 10, new Color(1, 1, 1), 0.5);
        drawText("Starting Wave", vec2(-15, -3), 6, new Color(1, 1, 1), 0.4);
        drawText(waveNum, vec2(-15, -7), 10, new Color(1, 1, 1), 0.4);
    } else if (menuState === menuStates.characterSelect && !gameStarted) {
        drawText("Endless Mode", vec2(0, 27), 10, new Color(1, 1, 1), 0.5);
    } else if (menuState === menuStates.instructions && !gameStarted) {
        drawText("How To Play", vec2(0, 27), 10, new Color(1, 1, 1), 0.5);

        drawText("Objective", vec2(-20, 20), 8, new Color(1, 1, 1), 0.4);
        drawText("Survive as many waves as possible and get the highest score!", vec2(-0, 15), 3.5, new Color(1, 1, 1), 0.4);
        drawText("Controls", vec2(-20, 10), 8, new Color(1, 1, 1), 0.4);
        mainContext.drawImage(instructions, 118, 700, 1864, 1072);
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
        pauseHandler();
    }

    // Back to menu handler
    if (gameOver && keyWasPressed("Enter")) {
        gameStarted = false; 
        gameOver = false;
        cameraPos = vec2(0, 0);
        engineObjects.forEach((obj) => {
            obj.destroy();
        })
        waveInProgress = false;
        waveNum = 1;
        totalPoints = 0;
        startGameButton.selected = false;
        makeMenuScreen(menuStates.mainScreen);
        player = undefined; // prevents enemies in the next game from targeting the old dead player's position
        cursor = new Cursor(); //all objects are destroyed so you have to do this, not just setCollision to true
        cursor.setCollision(true, true);
        bgReimu.stop();
        bgSakuya.stop();
        bgYoumu.stop();
        menuMusic.play(null, 1, null, null, true);
        menuMusicStarted = soundEnable ? true : false;
        userClickStartCount = 0;
        // console.log(player);
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
            gameOverScreen();
        }
    }
    // drawTextScreen(player.health, vec2(mainCanvasSize.x/2, mainCanvasSize.y - 40), 60, new Color(255, 0, 0));
    // drawTextScreen(`Damage: ${player.weapon.damage.toFixed(2)}`, vec2(205, 150), 60, new Color(255, 255, 255));
    // drawTextScreen(totalEnemies, vec2(mainCanvasSize.x/2, 40), 60, new Color(255, 0, 0));
    // drawTextScreen(`Points: ${totalPoints}`, vec2(mainCanvasSize.x/2 + 400, 40), 60, new Color(255, 255, 255));
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['assets/tiles.png', 'assets/projectileItems.png', 'assets/particles.png']);