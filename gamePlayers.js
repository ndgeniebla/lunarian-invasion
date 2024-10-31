// ---------- GAME ENTITIES/NPCS -------------

// ----- PLAYER CHARS -----
class PlayerChar extends EngineObject {
    constructor() {
        super(cameraPos, vec2(2, 4));
        this.color = new Color(255, 255, 255);
        this.setCollision();
        this.mass = 0.00001;

        this.movespeedCap = 1;
        this.movespeed = this.movespeedCap;

        //power attributes
        this.maxPower = 5;
        this.minPower = 1;
        this.power = this.minPower;
        
        //shield
        // this.shield = undefined;
        // this.isShieldUp = false;

        this.focused = false;
        // this.maxHealth = 1000;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.cooldownDuration = toMilliseconds(60); //in ms
        this.specialOnCooldown = false;
        this.specialTimer = this.cooldownDuration / 1000;
        this.specialCountingDown = false;
        this.renderOrder = 5;
        
        //for rendering sprites
        this.tileSize = vec2(defaultEntitySize);
        // walking
        this.drawSize = vec2(6);
        this.walkCyclePercent = 0;
        this.walkCycleReset = 8;
        this.walkFrame = 0;
        this.direction = {x: 0, y: 0};
        this.lastDirection = {x: 0, y: 0};

        // attacking
        this.attacking = false;
        this.attackCyclePercent = 0;
        this.attackCycleReset = 8;
        this.attackFrame = 0;
        
        this.shadow = new Shadow(this.pos, this);
        
        //for passive abilities
        this.wasHit = false;
        
        this.slowed = false;
        this.hitByBolt = false;
    } 
    movementHandler() {
        this.direction = {x: 0, y: 0};
        if (keyIsDown("KeyW")) {
            cameraPos.y += 0.5 * this.movespeed;
            this.direction.y = 1;
            this.lastDirection.y = 1;
        }
        if (keyIsDown("KeyS")) {
            cameraPos.y -= 0.5 * this.movespeed;
            this.direction.y = -1;
            this.lastDirection.y = -1;
        }
        if (keyIsDown("KeyA")) {
            cameraPos.x -= 0.5 * this.movespeed;
            this.direction.x = -1;
            this.lastDirection.x = -1;
        }
        if (keyIsDown("KeyD")) {
            cameraPos.x += 0.5 * this.movespeed;
            this.direction.x = 1;
            this.lastDirection.x = 1;
        }
    }
    walkCycleHandler() {
        if (!this.attacking) {
            if (this.direction.x !== 0 || this.direction.y !== 0) {
                this.walkCyclePercent += 1;
                if (this.walkCyclePercent >= this.walkCycleReset) {
                    this.walkFrame = !this.walkFrame;
                    this.walkCyclePercent = 0;
                }
            } else if (this.direction.x === 0 && this.direction.y === 0) {
                //not moving
                this.walkFrame = false; //looks incredibly stupid but basically "false" is the idle frame for the sprite
                //is type-coerced into a Number when flipping the frames
            }

            if (this.lastDirection.x === -1) {
                this.mirror = true;
            } else {
                this.mirror = this.direction[0] === -1 ? true : false;
            }
        }
    }
    attackCycleHandler() {
        if (this.attacking) {
            this.attackCyclePercent += 1;
            if (this.attackCyclePercent >= this.attackCycleReset) {
                this.attackFrame = !this.attackFrame;
                this.attackCyclePercent = 0;
            }
            this.lastDirection.x = this.weapon.xAimingDirection;
            
            //flips the sprite to wherever the player aimed and keeps it there
            this.mirror = this.weapon.xAimingDirection === 1 ? false : 
                            this.weapon.xAimingDirection === -1 ? true : this.mirror;
        } else {
            this.attackFrame = 0;
        }
    }
    focusModeHandler() {
        if (keyIsDown("ShiftLeft")) {
            this.movespeed = 0.4;
            this.focused = true;
            this.walkCycleReset = 24;
        } else if (!this.slowed) {
            this.movespeed = this.movespeedCap;
            this.focused = false;
            this.walkCycleReset = 8;
        }
    }
    slowOff() {
        const slowDuration = toMilliseconds(2);
        return new Promise((resolve) => {
            setTimeout(() => {
                this.slowed = false;
                this.hitByBolt = false;
                this.movespeed = this.movespeedCap;
                resolve();
            }, slowDuration);
        })
    }
    async slowedHandler() {
        if (this.hitByBolt && !this.slowed) {
            this.slowed = true;
            this.movespeed = 0.5;
            this.walkCycleReset = 20;
            new StatusText(this.pos, this, "SLOWED", 4, new Color(1, 1, 0));
            await this.slowOff();
        }
    }
    // specialCooldown() {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             if (!gameOver) {
    //                 console.log("Special is now ready!");
    //                 resolve(false);
    //             } else {
    //                 resolve(true);
    //             }
    //         }, this.cooldownDuration);
    //     });
    // }
    specialTimerCount() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.specialCountingDown = false;
                if (this.specialOnCooldown && !gamePaused && !gameOver) {
                    this.specialTimer = clamp(this.specialTimer + 1, 0, this.cooldownDuration/1000);
                    console.log(this.specialTimer);
                } /* else {
                    this.specialTimer = clamp(this.specialTimer * 2, 0, this.cooldownDuration/1000);
                } */
                resolve();
            }, 1000);
        });
    }
    async specialTimerHandler() {
        if (this.specialOnCooldown === true && !this.specialCountingDown) {
            this.specialCountingDown = true;
            await this.specialTimerCount();
            // console.log(this.specialTimer);
        }
    }
    async useSpecial() { //default to instakilling piercing laser
        this.specialTimer = 0;
        const projectileSpeed = 2;
        const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
        const velVec = vec2(velXY[0]*projectileSpeed, velXY[1]*projectileSpeed);
        const angle = velVec.angle();
        new PierceProjectile(this.pos, velVec, vec2(10, 20), angle, 9999, new Color(255, 255, 0), this.bulletLifeTimeCap);
        console.log("Special ability used");
        this.specialOnCooldown = true;
        // this.specialOnCooldown = await this.specialCooldown();
    }
    // shieldHandler() {
    //     return new Promise((resolve) => {
    //         const shieldDuration = toMilliseconds(20);
    //         this.shield = new Shield(this.pos, this);
    //         setTimeout(() => {
    //             this.shield.destroy();
    //             resolve(false);
    //         }, shieldDuration);
    //     });
    // }
    // async shieldUp() {
    //     this.isShieldUp = "pending";
    //     this.isShieldUp = await this.shieldHandler();
    // }
    powerAuraHandler() {
        if (this.power === this.maxPower) {
            // new ParticleEmitter(this.pos, 0, 4, 0.2, 4, 0, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(0), new Color(0.824, 0, 0, 1), new Color(0.961, 0.11, 0.039, 1), new Color(0.251, 0, 0, 1), new Color(0.251, 0, 0, 1),  0.2, 1.5, 0.75, 0.15, 0, 1, 1, 0, 0.5, 0.1, 0, 0, 0, 1, 4);
            new ParticleEmitter(this.pos, 0, 4, 0.2, 4, 0, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(0), new Color(1, 1, 1, 1), new Color(1, 1, 1, 1), new Color(1, 0.008, 0.008, 1), new Color(0.969, 0, 0, 1),  0.2, 1.5, 0.75, 0.15, 0, 1, 1, 0, 0.5, 0.1, 0, 0, 0, 1, 4);
        }
    }
    update() {
        // console.log(this.direction);
        this.pos = cameraPos;
        this.pos.x = clamp(this.pos.x, -levelSize.x/2 + this.size.x, levelSize.x/2 - this.size.x);
        this.pos.y = clamp(this.pos.y, -levelSize.y/2 + this.size.y, levelSize.y/2 - this.size.y);
        
                // if (this.isShieldUp === true) {
        //     console.log("new shield made");
        //     this.shieldUp();
        // }
        // 

        if (!gamePaused) {
            this.movementHandler();
            this.specialTimerHandler();
            this.slowedHandler();
            this.walkCycleHandler();
            this.attackCycleHandler();
            this.powerAuraHandler();
        }
        
        if ((this.specialTimer === this.cooldownDuration / 1000) && this.specialOnCooldown) {
            this.specialOnCooldown = false;
            console.log("Special is now ready!");
        }

        this.focusModeHandler();
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }

        if (keyWasPressed("Space") && !gamePaused) {
            if (!this.specialOnCooldown) {
                this.useSpecial();
            } else {
                console.log("Special on cooldown!");
                // new StatusText(this.pos, this, "Special Not Ready", 3.5, (new Color).setHex("#fc44fc"));
            }
        }
    }
    collideWithObject(o) {
        if (o.constructor.name === "EnemyProjectile" && !timeStopped) {
            this.health -= o.damage;
            this.power = clamp(this.power - (o.damage / 100), this.minPower, this.maxPower);
            o.destroy();
        }
        return 1;
    }
}

class PlayerReimu extends PlayerChar {
   constructor() {
       super();
       this.weapon = new HomingAmulet(this.pos, this);

       this.maxHealth = 80;
       this.health = this.maxHealth;

       this.blessingCooldown = toMilliseconds(7);
       this.recoveringBlessing = false;
       this.regenTick = toMilliseconds(2);
       this.regenVal = 1;
       this.regening = false;
   } 
   healthRegen() {
       return new Promise((resolve) => {
           setTimeout(() => {
               if (this.health > 0) {
                   this.health = clamp(this.health + this.regenVal, 0, this.maxHealth);
                   this.regening = false;
               }
               resolve();
           }, this.regenTick);
       });
   }
   blessingRecover() {
       return new Promise((resolve) => {
           setTimeout(() => {
            //    console.log("blessing recovered");
               if (!gameOver && gameStarted) {
                   new StatusText(this.pos, this, "HEALTH REGEN", 3.5, (new Color).setHex("#9cff19"));
               }
               this.wasHit = false;
               this.recoveringBlessing = false;
               resolve();
           }, this.blessingCooldown);
       });
   }
   async blessing() {
       if (!this.wasHit && !gamePaused) {
           new ParticleEmitter(this.pos, 0, 6, 0.1, 50, 3.14, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(2), new Color(0.502, 1, 0, 1), new Color(0.502, 1, 0, 1), new Color(0.976, 0.941, 0.749, 0), new Color(0.976, 0.941, 0.749, 0), 0.2, 1, 0.5, 0.05, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
       }
       if (!this.wasHit && !this.regening) {
           this.regening = true;
           await this.healthRegen();
       } else if (this.wasHit && !this.recoveringBlessing) {
           this.recoveringBlessing = true;
           new ParticleEmitter(this.pos, 0, 10, 0.2, 50, 3.14, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(2), new Color(0.502, 1, 0, 1), new Color(0.502, 1, 0, 1), new Color(0.976, 0.941, 0.749, 0), new Color(0.976, 0.941, 0.749, 0), 0.3, 1, 4, 0.05, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
           console.log("blessing broken, on cooldown...");
           await this.blessingRecover();
       }
   }
   async useSpecial() {
       this.specialTimer = 0;
       const projectileSpeed = 0.4;
       // const projectileSpeed = 2;
       const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
       const velVec = vec2(velXY[0]*projectileSpeed, velXY[1]*projectileSpeed);
       new ReimuBomb(this.pos, velVec);
       console.log("Special ability used");
       this.specialOnCooldown = true;
       console.log("Special on cooldown");
    //    this.specialOnCooldown = await this.specialCooldown();
   }
   update() {
       super.update();
       this.blessing();
   }
   collideWithObject(o) {
        if (o.constructor.name === "EnemyProjectile" && !timeStopped && !this.dashing) {
            o.destroy();
            if (!this.wasHit) {
                this.wasHit = true;
            }
            this.health -= o.damage;
            this.power = clamp(this.power - (o.damage / 100), this.minPower, this.maxPower);
        }
        return 1;
    }
   render() {
       const currFrame = this.attacking && !gamePaused ? 2 + (this.attackFrame | 0) : (this.walkFrame | 0);
       this.tileInfo = tile(tileTable.reimu, this.tileSize).frame(currFrame);
       drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror);
   }
}

class PlayerYoumu extends PlayerChar {
    constructor() {
        super();
        this.weapon = new Sword(this.pos, this);
        this.dashing = false;
        this.attackCycleReset = 12;
        
        this.maxHealth = 120;
        this.health = this.maxHealth;

        //spirit slash attributes
        this.ssShotCount = 130;
        // this.ssShotCount = 344;
        this.ssRotateStart = this.ssShotCount / -20;
        this.ssProjectileDelay = 2;
        // this.ssProjectileDelay = 30;
        this.ssBulletLifeTimeCap = 80;
        this.ssDamage = 1;

        this.myon = new Myon(this.pos.copy(), this);
        this.myonRespawning = false;
        this.myonRespawnTime = toMilliseconds(10);
        
        this.dashDuration = this.ssProjectileDelay * (this.ssShotCount + 1);
    } 
    focusModeHandler() {
        if (keyIsDown("ShiftLeft")) {
            this.movespeed = 0.4;
            this.focused = true;
            this.walkCycleReset = 24;
        } else if (!this.dashing && !this.slowed) {
            this.movespeed = this.movespeedCap;
            this.focused = false;
            this.walkCycleReset = 8;
        }
    }
    dash() {
       return new Promise((resolve) => {
           this.dashing = true;
           if (!this.slowed) {
               this.movespeed = 4;
           }
           setTimeout(() => {
               const finalSlashCount = 30;
               const aimVec = vec2(this.direction.x, this.direction.y);
               const bulletLifeTimeCap = 40;
               let rotateVal = this.ssRotateStart;
               for (let i = 0; i < finalSlashCount; i++) {
                   const rotateVel = aimVec.rotate(rotateVal);
                   new SpiritSlashProjectile(this.pos, rotateVel, vec2(3,1), rotateVel.angle(), this.ssDamage, (new Color).setHex("#dadada"), bulletLifeTimeCap);
                   rotateVal += 2*PI/(finalSlashCount * 8.37); //~0.025
               }
               resolve(false);
           }, this.dashDuration);
       }) 
    }
    spiritSlash(vel) {
        return new Promise((resolve) => {
            let rotateVal = this.ssRotateStart;
            for (let i = 0; i < this.ssShotCount; i++) {
                setTimeout(() => {
                    const rotateVel = vel.rotate(rotateVal);
                    new SpiritSlashProjectile(this.pos, rotateVel, vec2(3,1), rotateVel.angle(), this.ssDamage, (new Color).setHex("#dadada"), this.ssBulletLifeTimeCap);
                    rotateVal += 0.085;
                }, this.ssProjectileDelay * (i + 1));
            }
            resolve(false);
        });
    }
    async useSpecial() {
        this.specialTimer = 0;
        const projectileSpeed = 0.4;
        // const projectileSpeed = 2;
        const vel = vec2(0, -1);
        const velVec = vel.scale(projectileSpeed);
        await this.spiritSlash(velVec);
        this.specialOnCooldown = true;
        this.dashing = await this.dash();
        // this.specialOnCooldown = await this.specialCooldown();
        console.log("Special ability used");
    }
    myonCooldownTimer() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.myon = new Myon(this.pos, this);
                this.wasHit = false;
                console.log("myon respawned");
                resolve(false)
            }, this.myonRespawnTime);
        });
    }
    async myonCooldown() {
        if (this.wasHit === true && this.myonRespawning === false) {
            this.myonRespawning = true;
            console.log("myon destroyed, waiting for respawn...")
            this.myonRespawning = await this.myonCooldownTimer();
        }
    }
    render() {
        const currFrame = this.attacking && !gamePaused ? 2 + (this.attackFrame | 0) : (this.walkFrame | 0);
        this.tileInfo = tile(tileTable.youmu, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror);
    }
    collideWithObject(o) { //Youmu is invincible while dashing
        if (o.constructor.name === "EnemyProjectile" && !timeStopped && !this.dashing) {
            o.destroy();
            if (!this.wasHit) { // if Myon is active, next projectile hit will do no damage
                this.wasHit = true;
                new StatusText(this.pos, this, "BLOCKED", 4, new Color(1, 1, 1));
            } else {
                this.health -= o.damage;
                this.power = clamp(this.power - (o.damage / 100), this.minPower, this.maxPower);
            }
            this.myonCooldown();
        }
        return 1;
    }
}

class PlayerSakuya extends PlayerChar {
    constructor() {
        super();
        this.weapon = new ThrowingKnives(this.pos, this);
        this.timeStopped = false;
        this.timeStopDuration = toMilliseconds(10);
        this.cooldownDuration = this.timeStopDuration + toMilliseconds(60);
        this.specialTimer = this.cooldownDuration / 1000;

        this.damageBoosted = false;
        this.damageBoostDuration = toMilliseconds(7);
    } 
    freeze(toFreeze) {
        for (const o of engineObjects) {
            const parentObject = Object.getPrototypeOf(o.constructor).name;
            if (o.constructor.name === "EnemyProjectile"
                || parentObject === "EnemyWeapon"
                || parentObject === "Enemy") {
                o.frozen = toFreeze;
            }
        }
    }
    damageBoostTimer() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.damageBoosted = false;
                console.log("damage boost off");
                resolve();
            }, this.damageBoostDuration);
        });
    }
    async damageBoost() {
        if (!this.damageBoosted) {
            new StatusText(this.pos, this, "DAMAGE UP", 3.5, (new Color).setHex("#abd1ff"));
            console.log("damage boosted");
            this.damageBoosted = true;
            await this.damageBoostTimer();
        }
    }
    stopTime() {
        return new Promise((resolve) => {
            const bubble = new TimeBubble(this.pos);
            this.freeze(true);
            timeStopped = true;
            setTimeout(() => {
                timeStopped = false;
                this.freeze(false);
                bubble.durationDone = true;
            }, this.timeStopDuration);
            resolve(true);
        });
    }
    async useSpecial() {
        this.specialTimer = 0;
        await this.stopTime();
        console.log("Special ability used");
        this.specialOnCooldown = true;
        
        // this.specialOnCooldown = await this.specialCooldown();
    }
    update() {
        super.update();
        if (this.damageBoosted && !gamePaused) {
            new ParticleEmitter(this.pos, 0, 4, 0.2, 4, 0, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(0), new Color(0.329, 0.49, 0.922, 1), new Color(0.329, 0.49, 0.922, 1), new Color(0.961, 0.988, 0.988, 0.7), new Color(0.906, 0.973, 0.969, 0.7), 0.2, 1.5, 0.75, 0.15, 0, 1, 1, 0, 0.5, 0.1, 0, 0, 0, 1, 4);
        }
        for (const o of engineObjects) {
            if (o.constructor.name === "KnifeProjectile") {
                if (timeStopped) {
                    o.frozen = true;
                } else {
                    o.frozen = false;
                }
            }
        }
    }
    render() {
        const currFrame = this.attacking && !gamePaused ? 2 + (this.attackFrame | 0) : (this.walkFrame | 0);
        const sakuyaMode = timeStopped ? tileTable.sakuyaTimeStop : tileTable.sakuyaNormal;
        this.tileInfo = tile(sakuyaMode, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror);
    }
    collideWithObject(o) {
        super.collideWithObject(o);
        if (o.constructor.name === "EnemyProjectile" && !timeStopped) {
            this.damageBoost();
        }
    }
}

/* class PlayerDebug extends PlayerChar {
    constructor() {
        super();
        this.weapon = new Sword(this.pos, this);
    }
    swapWeapon(newWeapon) {
        this.weapon.destroy();
        this.weapon = newWeapon;
    }
    weaponHotbar() { //for debugging
        if (keyWasPressed("Digit1")) {
            this.swapWeapon(new Sword(this.pos, this));
        } else if (keyWasPressed("Digit2")) {
            this.swapWeapon(new Needles(this.pos, this));
        } else if (keyWasPressed("Digit3")) {
            this.swapWeapon(new ThrowingKnives(this.pos, this));
        }
    }
    update() {
        super.update();
        this.weaponHotbar();
    }
} */