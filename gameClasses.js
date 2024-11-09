'use strict';

class HealthBar extends EngineObject {
    constructor(pos, host) {
        super(pos, vec2(4, 0.5));
        this.host = host;
        this.color = new Color(255, 0, 0);
        host.addChild(this, vec2(0, 3.5));
    }
    update() {
        // console.log(`this.maxHealth = ${this.host.maxHealth}`);
        this.size.x = (this.host.health/this.host.maxHealth) * 4;
    }
}

class Shadow extends EngineObject {
    constructor(pos, host) {
        super(pos, vec2(3, 0.7));
        this.host = host;
        this.color = (new Color).setHex("#011207").scale(1, 0.3);
        // this.color = new Color(255, 0, 0);
        host.addChild(this, vec2(0, -2.8));
    }
    update() {
        super.update();
    }
}

class StatusText extends EngineObject {
    constructor(pos, host, text, textSize, textColor) {
        super(pos);
        this.host = host;
        this.text = text;
        this.font = new FontImage();
        this.textLifeTime = toMilliseconds(0.75);
        this.textOffset = 0;
        this.textColor = textColor;
        this.fontSize = textSize;
        this.color = new Color(0,0,0,0);
        this.waitingToDestroy = false;
        this.expiring = false;
    }
    textLife() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.destroy();
            }, this.textLifeTime);
        });
    }
    async textLifeHandler() {
        if (this.waitingToDestroy) {
            // console.log("text drawn, to destroy");
            this.expiring = true;
            await this.textLife();
        }
    }
    update() {
        this.textLifeHandler();
        if (!this.expiring) {
            this.waitingToDestroy = true;
        }
        drawText(this.text, vec2(this.host.pos.x, this.host.pos.y + this.textOffset), this.fontSize, this.textColor, 0.3);
        this.textOffset = clamp(this.textOffset + 0.25, 0, 4.5);
    }
}

class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size);
        this.setCollision(true);
        this.mass = 0;
        // this.color = new Color(255, 0, 0, 1);
        this.color = new Color(255, 0, 0, 0);
    }
}

// NOTE: WHEN TWO OBJECTS COLLIDE, AT LEAST ONE HAS TO HAVE MASS
// OTHERWISE COLLISIONS WILL NOT REGISTER!

//========== ITEMS ==========
class Item extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.setCollision();
        this.drawSize = vec2(2);
    }
    render() {
        // console.log(`enemyProjectile Tile Info: ${this.tileInfo}`);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle);
    }
}

class PowerUp extends Item {
    constructor(pos) {
        super(pos);
        this.color = new Color(255, 0, 0);
        this.bestDistance = 100;
        this.speed = 0.8;
        
        //sprite rendering
        this.tileInfo = tile(tileTable.items, defaultItemProjSize, 1).frame(0);
    }
    update() {
        super.update();
        // when player gets within a certain range of a PowerUp, gravitate towards it
        if (!timeStopped) {
            for (const o of engineObjects) {
                const parentObject = Object.getPrototypeOf(o.constructor).name;
                if (parentObject === "PlayerChar") {
                    const distance = this.pos.distanceSquared(o.pos);
                    if (distance < this.bestDistance) {
                        const velXY = calcVel2Pos(o.pos, this.pos.x, this.pos.y);
                        // console.log(velXY);
                        this.velocity = vec2(velXY[0]*this.speed, velXY[1]*this.speed);
                        // this.angle = this.velocity.angle();
                    }
                }
            } 
        }
        this.pos.x = clamp(this.pos.x, -levelSize.x/2 + this.size.x, levelSize.x/2 - this.size.x);
        this.pos.y = clamp(this.pos.y, -levelSize.y/2 + this.size.y, levelSize.y/2 - this.size.y);
    }
    collideWithObject(o) {
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (parentObject === "PlayerChar" && !timeStopped) {
            if (o.power === o.maxPower) { //only add points when picking up at max power
                totalPoints += 25;
                new StatusText(o.pos, o, "+25", 3, (new Color).setHex("#ffd52b"));
            } else {
                o.power = clamp(o.power + 0.2, 0, o.maxPower);
                // o.power = clamp(o.power + 2, 0, o.maxPower);
                if (o.power === o.maxPower) { //only display text when initially hitting max power
                    new StatusText(o.pos, o, "MAX POWER", 4, (new Color).setHex("#ff5900"));
                    maxPowerUpSound.play();
                } else {
                    new StatusText(o.pos, o, "POWER UP", 3, (new Color).setHex("#ff5900"));
                }
            }
            // o.power = clamp(o.power + 2, 0, o.maxPower);
            pickupSound.play();
            this.destroy();
            return 1;
        }
    }
}

class HealthUp extends Item {
    constructor(pos) {
        super(pos);
        this.size = vec2(2,2);
        this.color = (new Color).setHex("#51b55f");
        this.tileInfo = tile(tileTable.items, defaultItemProjSize, 1).frame(1);
    }
    collideWithObject(o) {
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (parentObject === "PlayerChar" && !timeStopped && !gameOver) {
            if (o.health === o.maxHealth) {
                totalPoints += 100;
                new StatusText(o.pos, o, "+100", 3, (new Color).setHex("#ffd52b"));
                pickupSound.play();
            } else {
                if (o.constructor.name === "PlayerReimu") {
                    o.health = clamp(o.health + 10, 0, o.maxHealth);
                    new StatusText(o.pos, o, "+10 HP", 3.5, (new Color).setHex("#1aff00"));
                } else {
                    o.health = clamp(o.health + 20, 0, o.maxHealth);
                    new StatusText(o.pos, o, "+20 HP", 3.5, (new Color).setHex("#1aff00"));
                }
                healthUpSound.play();
            }
            this.destroy();
            return 1;
        }
    }
}

//==============================

// class ShieldPickup extends Item {
//     constructor(pos) {
//         super(pos);
//         this.size = vec2(2,2);
//         this.color = (new Color).setHex("#0384fc");
//     }
//     collideWithObject(o) {
//         const parentObject = Object.getPrototypeOf(o.constructor).name;
//         if (parentObject === "PlayerChar" && !o.isShieldUp) {
//             o.isShieldUp = true;
//             this.destroy();
//         }
//     }
// }

//only used for Youmu
class Myon extends EngineObject { 
    constructor(pos, host) {
        super(pos, vec2(2, 2));
        this.host = host;
        this.color = new Color(255, 255, 255);
        this.speed = 0.4;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.08;
        this.baseDist = 6;
        this.dist = this.baseDist;

        this.minDamage = 0.5;
        this.damage = this.minDamage;
        this.maxDamage = 1.5

        this.setCollision();
    }
    powerHandler() {
        this.dist = this.baseDist + this.host.power;
        this.damage = clamp(this.minDamage + (this.host.power / 5), this.minDamage, this.maxDamage);
    }
    update() {
        // console.log(`this.maxHealth = ${this.host.maxHealth}`);
        // this.orbitAngle++;
        super.update();
        this.powerHandler();
        // console.log(this.orbitAngle);
        //
        if (this.host.wasHit === true) {
            new ParticleEmitter(this.pos, 0, 12, 0.4, 10, 3.14, undefined, new Color(1, 1, 1, 1), new Color(1, 1, 1, 1), new Color(1, 1, 1, 0), new Color(1, 1, 1, 0), 0.5, 2, 1, 0.1, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
            myonBlockSound.play();
            this.destroy();
        }
        this.pos.x = this.host.pos.x + this.dist * Math.cos(this.orbitAngle);
        this.pos.y = this.host.pos.y + this.dist * Math.sin(this.orbitAngle);
        this.angle = this.orbitAngle;
        // console.log(this.pos.x);
        // console.log(this.pos.y);
        if (!gamePaused) {
            this.orbitAngle += this.orbitSpeed;
            new ParticleEmitter(this.pos, 0, 0.1, 0.1, 10, 3.14, undefined, new Color(1, 1, 1, 1), new Color(1, 1, 1, 1), new Color(1, 1, 1, 0), new Color(1, 1, 1, 0), 0.3, 1, 0.5, 0.1, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
        }
        
        if (this.host.health <= 0) {
            this.destroy();
        }
    }
    collideWithObject(o) {
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (parentObject === "Enemy" && !gamePaused) {
            o.health -= this.damage;
        }
        return 1;
    }
    
}