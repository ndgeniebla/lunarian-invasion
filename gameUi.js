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
        this.text = text;
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
        drawRect(this.pos, this.size.scale(1.1), new Color(1, 1, 1));
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
            creditsButton = new Button(vec2(0, -14), vec2(30, 10), "Credits")
            menuButtons.push(endlessButton);
            menuButtons.push(customGameButton);
            menuButtons.push(creditsButton);
            break;
        case menuStates.characterSelect:
            menuState = menuStates.characterSelect;
            reimuButton = new Button(vec2(-20, 5), vec2(18, 30), "Reimu");
            sakuyaButton = new Button(vec2(0, 5), vec2(18, 30), "Sakuya");
            youmuButton = new Button(vec2(20, 5), vec2(18, 30), "Youmu")
            startGameButton = new Button(vec2(0, -25), vec2(18, 8), "Start")
            menuButtons.push(reimuButton);
            menuButtons.push(sakuyaButton);
            menuButtons.push(youmuButton);
            menuButtons.push(startGameButton);
            break;
        case menuStates.customGame:
            menuState = menuStates.customGame;
            reimuButton = new Button(vec2(-20, 10), vec2(18, 20), "Reimu");
            sakuyaButton = new Button(vec2(0, 10), vec2(18, 20), "Sakuya");
            youmuButton = new Button(vec2(20, 10), vec2(18, 20), "Youmu")
            startGameButton = new Button(vec2(0, -25), vec2(18, 8), "Start")

            sub1WaveButton = new IncrementButton(vec2(-17.5, -15), vec2(3, 3), "-1", 3, -1);
            sub5WaveButton = new IncrementButton(vec2(-21.5, -15), vec2(3, 3), "-5", 3, -5);
            sub25WaveButton = new IncrementButton(vec2(-25.5, -15), vec2(3, 3), "-25", 3, -25);
            add1WaveButton = new IncrementButton(vec2(-13.5, -15), vec2(3, 3), "+1", 3, 1);
            add5WaveButton = new IncrementButton(vec2(-9.5, -15), vec2(3, 3), "+5", 3, 5);
            add25WaveButton = new IncrementButton(vec2(-5.5, -15), vec2(3, 3), "+25", 3, 25);

            maxPowerButton = new PowerButton(vec2(15, -10), vec2(24, 8), "Max Power")

            menuButtons.push(reimuButton);
            menuButtons.push(sakuyaButton);
            menuButtons.push(youmuButton);
            menuButtons.push(startGameButton);
            menuButtons.push(sub1WaveButton);
            menuButtons.push(sub5WaveButton);
            menuButtons.push(sub25WaveButton);
            menuButtons.push(add1WaveButton);
            menuButtons.push(add5WaveButton);
            menuButtons.push(add25WaveButton);
            menuButtons.push(maxPowerButton);
            break;
        case menuStates.credits:
            menuState = menuStates.credits;
            break;
    }
}

function menuSelectionHandler() {
    switch (menuState) {
        case menuStates.mainScreen:
            if (endlessButton.selected) {
                makeMenuScreen(menuStates.characterSelect);
            } else if (customGameButton.selected) {
                makeMenuScreen(menuStates.customGame);
            } else if (creditsButton.selected) {
                makeMenuScreen(menuStates.credits);
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
        case menuStates.credits:
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


