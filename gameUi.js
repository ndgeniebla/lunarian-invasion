class Bar {
    constructor(pos, maxLength, stat, statMax, color, barThickness) {
        this.pos = screenToWorld(pos);
        this.stat = stat;
        this.statMax = statMax;
        this.maxLength = maxLength; 
        this.color = color;
        this.barThickness = barThickness;
    }
    draw() {
        // console.log(this.pos);
        const gauge = this.maxLength * (this.stat/this.statMax);
        drawLine(vec2(this.pos.x - (this.maxLength / 2) - 0.25, this.pos.y), vec2(this.pos.x - (this.maxLength / 2) + this.maxLength + 0.25, this.pos.y), this.barThickness + 0.6, new Color(0, 0, 0));
        drawLine(vec2(this.pos.x - (this.maxLength / 2), this.pos.y), vec2(this.pos.x - (this.maxLength / 2) + gauge, this.pos.y), this.barThickness, this.color);
    }
}


class Button extends EngineObject {
    constructor(pos, size, text, fontSize) {
        super(pos, size);
        this.selected = false;
        this.text = text ? text : "";
        this.setCollision();
        this.renderOrder = 4;
        this.borderChild;
        this.fontSize = fontSize ? fontSize : 8;
    }
    render() {
        const yPadding = this.fontSize / 4;
        drawRect(this.pos, this.size, new Color(0.5, 0.5, 0.5));
        drawText(this.text, vec2(this.pos.x, this.pos.y + yPadding), this.fontSize, new Color(1, 1, 1), 0.4);
        this.velocity = vec2(0, 0);
    }
    collideWithObject(o) {
        if (isOverlapping(cursor.pos, cursor.size, this.pos, this.size) && mouseWasPressed(0)) {
            this.select();
        }
        return 1;
    }
    selectBorder() {
        const xMultiplier = this.size.x / this.size.y >= 1 ? 1.04 : 1.06;
        const yMultiplier = this.size.x / this.size.y >= 1 ? 1.06 : 1.04;
        drawRect(this.pos, vec2(this.size.x * xMultiplier, this.size.y * yMultiplier), new Color(1, 1, 1));
    }
    select() {
        engineObjects.forEach((obj) => {
            if (obj instanceof Button) {
                obj.selected = (obj === maxPowerButton) ? maxPowerButton.selected : false;
            }
        })
        this.selected = true;
        console.log(`${this.constructor.name} selected`);
    }
}

class CharInfo extends EngineObject {
    constructor(parentButton, spriteInfo, dispExtra) {
        const pos = dispExtra ? vec2(parentButton.pos.x, parentButton.pos.y + 6) : parentButton.pos;
        super(pos, vec2(2, 4));
        //for rendering sprites
        this.parentButton = parentButton;
        this.displayExtras = dispExtra ? dispExtra : false;

        this.infoOffset = -8;
        this.infoTextIncrement = -2.5;
        this.infoFontSize = 4;

        this.extraInfo = {
            health: "",
            weaponDetail1: "",
            weaponDetail2: "",
            special: "",
            passive: ""
        }
        
        this.infoColours = {
            health: new Color(1, 1, 1),
            weaponDetail1: new Color(1, 1, 1),
            weaponDetail2: new Color(1, 1, 1),
            special: new Color(1, 1, 1),
            passive: (new Color).setHex("#45ffec")
        }

        this.tileSize = vec2(defaultEntitySize);
        // walking
        this.drawSize = vec2(12);
        this.walkCyclePercent = 0;
        this.walkCycleReset = 8;
        this.walkFrame = 0;
        this.spriteInfo = spriteInfo;
        this.renderOrder = 5;
    }
    doWalkCycle() {
        this.walkCyclePercent += 1;
        if (this.walkCyclePercent >= this.walkCycleReset) {
            this.walkFrame = !this.walkFrame;
            this.walkCyclePercent = 0;
        }
    }
    update() {
        if (this.parentButton.selected) {
            this.doWalkCycle();
        } else {
            this.walkFrame = false;
        }
        if (this.displayExtras) {
            const extraInfoY = this.pos.y + this.infoOffset;
            drawText(this.extraInfo.health, vec2(this.pos.x, extraInfoY), this.infoFontSize, this.infoColours.health, 0.4);
            drawText(this.extraInfo.weaponDetail1, vec2(this.pos.x, extraInfoY + this.infoTextIncrement), this.infoFontSize, this.infoColours.weaponDetail1, 0.4);
            drawText(this.extraInfo.weaponDetail2, vec2(this.pos.x, extraInfoY + this.infoTextIncrement * 2), this.infoFontSize, this.infoColours.weaponDetail2, 0.4);
            drawText(this.extraInfo.special, vec2(this.pos.x, extraInfoY + this.infoTextIncrement * 3.2), this.infoFontSize - 1, this.infoColours.special, 0.4);
            drawText(this.extraInfo.passive, vec2(this.pos.x, extraInfoY + this.infoTextIncrement * 4.2), this.infoFontSize - 1, this.infoColours.passive, 0.4);
        }
    }
    render() {
        const currFrame = this.walkFrame | 0;
        this.tileInfo = tile(this.spriteInfo, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo);
    }
}

class ReimuInfo extends CharInfo {
    constructor(parentButton, dispExtra) {
        const spriteInfo = tileTable.reimu;
        super(parentButton, spriteInfo, dispExtra);
        this.extraInfo = {
            health: "80 HP",
            weaponDetail1: "Long-Range",
            weaponDetail2: "Homing",
            special: "Special: Damage Field",
            passive: "HP Regen when not hit"
        }

        this.infoColours = {
            health: (new Color).setHex("#ff4f4f"),
            weaponDetail1: (new Color).setHex("#4fff67"),
            weaponDetail2: (new Color).setHex("#4f90ff"),
            special: new Color(1, 1, 1),
            passive: (new Color).setHex("#45ffec")
        }
    }
}

class SakuyaInfo extends CharInfo {
    constructor(parentButton, dispExtra) {
        const spriteInfo = tileTable.sakuyaNormal;
        super(parentButton, spriteInfo, dispExtra);
        this.extraInfo = {
            health: "100 HP",
            weaponDetail1: "Medium-Range",
            weaponDetail2: "Piercing",
            special: "Special: Stop Time",
            passive: "Damage Boost When Hit"
        }

        this.infoColours = {
            health: new Color(1, 1, 1),
            weaponDetail1: new Color(1, 1, 1),
            weaponDetail2: (new Color).setHex("#ffc44f"),
            special: new Color(1, 1, 1),
            passive: (new Color).setHex("#45ffec")
        }
    }
}

class YoumuInfo extends CharInfo {
    constructor(parentButton, dispExtra) {
        const spriteInfo = tileTable.youmu;
        super(parentButton, spriteInfo, dispExtra);
        this.fontSize = 4;
        this.extraInfo = {
            health: "120 HP",
            weaponDetail1: "Short-Range",
            weaponDetail2: "Piercing",
            special: "Special: Spirit Slash",
            passive: "Can Block Projectiles"
        }

        this.infoColours = {
            health: (new Color).setHex("#4fff67"),
            weaponDetail1: (new Color).setHex("#ff4f4f"),
            weaponDetail2: (new Color).setHex("#ffc44f"),
            special: new Color(1, 1, 1),
            passive: (new Color).setHex("#45ffec")
        }
    }
}

class PowerButton extends Button {
    constructor(pos, size, text, fontSize) {
        super(pos, size, text, fontSize);
    }
    collideWithObject(o) {
        if (isOverlapping(cursor.pos, cursor.size, this.pos, this.size) && mouseWasPressed(0)) {
            this.toggle();
        }
        return 1;
    }
    toggle() {
        this.selected = !this.selected;
        startMaxPower = !startMaxPower;
    }
}

class IncrementButton extends Button {
    constructor(pos, size, text, fontSize, val) {
        super(pos, size, text, fontSize);
        this.value = val;
    }
    collideWithObject(o) {
        if (isOverlapping(cursor.pos, cursor.size, this.pos, this.size) && mouseWasPressed(0)) {
            this.increment();
        }
        return 1;
    }
    increment() {
        waveNum = waveNum === 1 && this.value !== 1 ? clamp(waveNum + this.value - 1, 1, 999) : clamp(waveNum + this.value, 1, 999);
    }
}

class Cursor extends EngineObject {
    constructor() {
        super(mousePos, vec2(0.2));
        // this.color = new Color(1, 0, 0);
        this.color = new Color(1, 0, 0, 0);
        this.renderOrder = 10;
        this.setCollision();
        // this.mass = 0;
    }
    update() {
        this.pos.x = mousePos.x;
        this.pos.y = mousePos.y;
        
        this.pos.x = clamp(this.pos.x, -levelSize.x, levelSize.x);

        this.pos.y = clamp(this.pos.y, -levelSize.y, levelSize.y);
    }
    
}

function clearCurrentMenu() {
    for (b of menuButtons) {
        b.destroy();
    }
    for (c of characterInfo) {
        c.destroy();
    }
    menuButtons = [];
}

function makeMenuScreen(state) {
    clearCurrentMenu();
    if (state !== menuStates.mainScreen) {
        backButton = new Button(vec2(-28, -25), vec2(10, 10), "Back");
        menuButtons.push(backButton);
    }
    switch (state) {
        case menuStates.mainScreen:
            menuState = menuStates.mainScreen;
            endlessButton = new Button(vec2(0, 10), vec2(30, 10), "Endless Mode");
            customGameButton = new Button(vec2(0, -2), vec2(30, 10), "Custom Game");
            instructionsButton = new Button(vec2(0, -14), vec2(30, 10), "How to Play")
            menuButtons.push(endlessButton);
            menuButtons.push(customGameButton);
            menuButtons.push(instructionsButton);
            break;
        case menuStates.characterSelect:
            menuState = menuStates.characterSelect;
            reimuButton = new Button(vec2(-21, 5), vec2(19, 30)/*, "Reimu"*/);
            reimuInfo = new ReimuInfo(reimuButton, true);
            sakuyaButton = new Button(vec2(0, 5), vec2(19, 30)/*, "Sakuya"*/);
            sakuyaInfo = new SakuyaInfo(sakuyaButton, true);
            youmuButton = new Button(vec2(21, 5), vec2(19, 30)/*, "Youmu"*/)
            youmuInfo = new YoumuInfo(youmuButton, true);
            startGameButton = new Button(vec2(0, -25), vec2(18, 8), "Start")
            
            waveNum = 1; //resets wave number in case the user changed the wave num through the Custom Game screen and then exited it
            
            characterSelected = "";

            menuButtons.push(reimuButton);
            menuButtons.push(reimuInfo);
            menuButtons.push(sakuyaButton);
            menuButtons.push(sakuyaInfo);
            menuButtons.push(youmuButton);
            menuButtons.push(youmuInfo);

            menuButtons.push(startGameButton);

            break;
        case menuStates.customGame:
            menuState = menuStates.customGame;
            reimuButton = new Button(vec2(-20, 10), vec2(18, 20)/*, "Reimu"*/);
            reimuInfo = new ReimuInfo(reimuButton);
            sakuyaButton = new Button(vec2(0, 10), vec2(18, 20)/*, "Sakuya"*/);
            sakuyaInfo = new SakuyaInfo(sakuyaButton);
            youmuButton = new Button(vec2(20, 10), vec2(18, 20)/*, "Youmu"*/)
            youmuInfo = new YoumuInfo(youmuButton);

            startGameButton = new Button(vec2(0, -25), vec2(18, 8), "Start")

            sub1WaveButton = new IncrementButton(vec2(-17.5, -15), vec2(3, 3), "-1", 3, -1);
            sub5WaveButton = new IncrementButton(vec2(-21.5, -15), vec2(3, 3), "-5", 3, -5);
            sub25WaveButton = new IncrementButton(vec2(-25.5, -15), vec2(3, 3), "-25", 3, -25);
            add1WaveButton = new IncrementButton(vec2(-13.5, -15), vec2(3, 3), "+1", 3, 1);
            add5WaveButton = new IncrementButton(vec2(-9.5, -15), vec2(3, 3), "+5", 3, 5);
            add25WaveButton = new IncrementButton(vec2(-5.5, -15), vec2(3, 3), "+25", 3, 25);

            maxPowerButton = new PowerButton(vec2(15, -10), vec2(24, 8), "Max Power")
            
            waveNum = 1;
            characterSelected = "";

            menuButtons.push(reimuButton);
            characterInfo.push(reimuInfo);
            menuButtons.push(sakuyaButton);
            characterInfo.push(sakuyaInfo);
            menuButtons.push(youmuButton);
            characterInfo.push(youmuInfo);

            menuButtons.push(startGameButton);
            menuButtons.push(sub1WaveButton);
            menuButtons.push(sub5WaveButton);
            menuButtons.push(sub25WaveButton);
            menuButtons.push(add1WaveButton);
            menuButtons.push(add5WaveButton);
            menuButtons.push(add25WaveButton);
            menuButtons.push(maxPowerButton);
            break;
        case menuStates.instructions:
            menuState = menuStates.instructions;
            break;
    }
}

function gameOverScreen() {
    drawRect(vec2(0), levelSize.scale(2), (new Color).setHex("#520000").scale(1, 0.6));
    drawTextScreen("Game Over!", vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2.7), 500, new Color(1, 0, 0), 20);
    drawTextScreen(`Score: ${totalPoints}`, vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2.0), 200, (new Color).setHex("#ffd52b"), 20);
    drawTextScreen("Press Enter to go back to main menu", vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 1.6), 150, new Color(1, 1, 1), 15);
    gameOver = true;
}

function menuSelectionHandler() {
    switch (menuState) {
        case menuStates.mainScreen:
            if (endlessButton.selected) {
                makeMenuScreen(menuStates.characterSelect);
            } else if (customGameButton.selected) {
                makeMenuScreen(menuStates.customGame);
            } else if (instructionsButton.selected) {
                makeMenuScreen(menuStates.instructions);
            }
            break;
        case menuStates.characterSelect:
            if (backButton.selected) {
                makeMenuScreen(menuStates.mainScreen);
            } else if (reimuButton.selected) {
                characterSelected = characters.reimu;
                reimuButton.selectBorder();
            } else if (sakuyaButton.selected) {
                characterSelected = characters.sakuya;
                sakuyaButton.selectBorder();
            } else if (youmuButton.selected) {
                characterSelected = characters.youmu;
                youmuButton.selectBorder();
            }
            break;
        case menuStates.customGame:
            if (backButton.selected) {
                makeMenuScreen(menuStates.mainScreen);
            } else if (reimuButton.selected) {
                characterSelected = characters.reimu;
                reimuButton.selectBorder();
            } else if (sakuyaButton.selected) {
                characterSelected = characters.sakuya;
                sakuyaButton.selectBorder();
            } else if (youmuButton.selected) {
                characterSelected = characters.youmu;
                youmuButton.selectBorder();
            }
            
            if (maxPowerButton.selected) {
                maxPowerButton.selectBorder();
                startMaxPower = true;
            }

            break;
        case menuStates.instructions:
            if (backButton.selected) {
                makeMenuScreen(menuStates.mainScreen);
            }
            break;
    }
    
    // console.log(menuButtons);
    // console.log(menuState);
}

class CriticalHitScreen extends EngineObject {
    constructor() {
        super(vec2(0,0), levelSize.scale(2));
        this.alphaScale = 0.3;
        this.color = new Color(1, 0, 0, this.alphaScale);
    }
    update() {
        this.alphaScale -= 0.01;
        this.color = this.color.setHSLA(0, 1, 0.5, this.alphaScale);
        if (this.alphaScale <= 0) {
            console.log("destroyed");
            this.destroy();
        }
    }
}

class PauseScreen extends EngineObject {
    constructor() {
        super(vec2(0,0), levelSize.scale(2));
        this.color = new Color(0.2, 0.2, 0.2, 0.4);
        this.renderOrder = 99;
    }
    update() {
        super.update();
    }
}

function playerHud() {
    const playerHealth = new Bar(vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 60), 16, player.health, player.maxHealth, new Color(0, 1, 0, 1), 2);
    drawTextScreen(`${player.health}/${player.maxHealth}`, vec2(mainCanvasSize.x / 2, mainCanvasSize.y - 85), 100, new Color(255, 255, 255), 10);

    const powerBar = new Bar(vec2(mainCanvasSize.x / 4, mainCanvasSize.y - 60), 14, player.power, player.maxPower, (new Color).setHex("#ff932e"), 2);
    drawTextScreen(`${player.power.toFixed(2)}/${player.maxPower.toFixed(2)}`, vec2(mainCanvasSize.x / 4, mainCanvasSize.y - 85), 100, new Color(255, 255, 255), 10);

    const waveBar = new Bar(vec2(mainCanvasSize.x / 2, 60), 40, totalEnemies, totalMaxEnemies, (new Color).setHex("#bd0000"), 1.5);
    drawTextScreen(`Wave ${waveNum}`, vec2(mainCanvasSize.x / 2, 35), 100, new Color(255, 255, 255), 10);


    const specialBar = new Bar(vec2(3 * mainCanvasSize.x / 4, mainCanvasSize.y - 60), 14, player.specialTimer, player.cooldownDuration / 1000, (new Color).setHex("#3b6fff"), 2);
    if (!player.specialOnCooldown) {
        drawTextScreen(`SPECIAL READY`, vec2(3 * mainCanvasSize.x / 4, mainCanvasSize.y - 85), 100, new Color(255, 255, 255), 10);
    } else {
        drawTextScreen(`${player.cooldownDuration / 1000 - player.specialTimer}`, vec2(3 * mainCanvasSize.x / 4, mainCanvasSize.y - 85), 100, new Color(255, 255, 255), 10);
    }

    drawTextScreen(`${totalPoints}`, vec2(mainCanvasSize.x/2, 110), 100, (new Color).setHex("#ffd52b"), 10); 

    playerHealth.draw(); 
    powerBar.draw();
    specialBar.draw();
    waveBar.draw();
}

function pauseHandler() {
    if (keyWasPressed("Backquote")) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            pauseScreenCreated = true;
            pauseScreen = new PauseScreen();
        } else {
            pauseScreenCreated = false;
            pauseScreen.destroy();
        }
    }
    
    if (gamePaused) {
        drawTextScreen(`Game Paused`, vec2(mainCanvasSize.x/2, mainCanvasSize.y - 210), 150, (new Color).setHex("#ffffff"), 10); 
    };
    // console.log(`gamePaused = ${gamePaused}, pauseScreenCreated = ${pauseScreenCreated}`);
    
}
