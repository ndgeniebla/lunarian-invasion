// --------- WEAPONS ----------

class Weapon extends EngineObject {
    constructor(pos, parent, projectileSpeed, fireRate) {
        super(pos, vec2(1,1));
        parent.addChild(this, vec2(0,0));

        this.host = parent;
        this.projectileSpeed = projectileSpeed ? projectileSpeed : 1;
        this.fireRate = fireRate ? fireRate : 4;
        this.fireTimeCap = 100;
        this.fireTimeBuffer = this.fireTimeCap;
        this.bulletLifeTimeCap = 200;
        this.renderOrder = 1;
    }
}

class PlayerWeapon extends Weapon {
    constructor(pos, parent, projectileSpeed, fireRate) {
        super(pos, parent, projectileSpeed, fireRate);
        this.color = new Color(255, 255, 255);
        this.power = this.parent.power;
        this.damage = 1;
        
        //used for rendering the attacking sprite direction
        this.xAimingDirection = 0;
    }
    fire() { //default shot
        const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
        const velVec = vec2(velXY[0]*this.projectileSpeed, velXY[1]*this.projectileSpeed);
        const angle = velVec.angle();
        new PlayerProjectile(this.pos, velVec, vec2(3,3), angle, this.damage, new Color(0, 255, 0), this.bulletLifeTimeCap);
    }
    powerHandler() {} //default power handling is empty
    update() {
        super.update();
        this.powerHandler();
        if (mouseIsDown(0)) {
            this.host.attacking = true;
            //use the calcVel function to check direction
            const aimVec = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
            aimVec[0] = aimVec[0] > 0 ? 1 : (aimVec[0] < 0 ? -1 : 0);
            this.xAimingDirection = aimVec[0];
            if (this.fireTimeBuffer >= this.fireTimeCap) {
                this.fire();
                this.fireTimeBuffer = 0;
            }
        } else {
            this.host.attacking = false;
        }
        this.fireTimeBuffer += this.fireRate;
    }
}

//Power increases the damage of all weapons.
//But the ratio at which it increases damage varies between each.

// Easy to use homing weapon. Power increases shotCount
class HomingAmulet extends PlayerWeapon {
    constructor(pos, parent) {
        super(pos, parent);

        this.color = new Color(255, 255, 0);

        this.minDamage = 0.45;
        this.damage = this.minDamage;
        this.maxDamage = 0.75;

        this.projectileSpeed = 0.8;
        this.fireRate = 10;
        this.bulletLifeTimeCap = 600;
        this.shotCount = 1;
    }
    powerHandler() {
        this.damage = clamp(this.minDamage + (this.host.power / 20), this.minDamage, this.maxDamage);
        if (this.host.power < 2.50) {
            this.shotCount = 1;
        } else if (this.host.power >= 2.50 && this.host.power < 4.00) {
            this.shotCount = 2;
        } else if (this.host.power >= 4.00 && this.host.power < 5.00) {
            this.shotCount = 3;
        } else if (this.host.power === 5.00) {
            this.shotCount = 4;
        }
    }
    fire() {
        const rotateVal = this.shotCount > 1 ? this.shotCount / -15 : 0;
        const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
        const shotVec = vec2(velXY[0]*this.projectileSpeed, velXY[1]*this.projectileSpeed);

        let rotateInterval = rotateVal;
        for (let i = 0; i < this.shotCount; i++) {
            const rotatedVec = shotVec.rotate(rotateInterval);
            new HomingProjectile(this.pos, rotatedVec, vec2(1, 1), rotatedVec.angle(), this.damage, new Color(255, 255, 0), this.bulletLifeTimeCap);
            rotateInterval += abs(rotateVal);
        }
    }
}

//Short range piercing weapon. Power increases the slash width (shotCount).
class Sword extends PlayerWeapon {
    constructor(pos, parent) {
        super(pos, parent);

        this.color = (new Color).setHex("#adadad");
        
        this.minDamage = 0.45;
        this.damage = this.minDamage;
        this.maxDamage = 0.75;

        this.projectileSpeed = 1;
        this.bulletLifeTimeCap = 10;
        this.fireRate = 4;
        this.shotCount = 4;
        
        // this.projectileSpeed = 0.2;
        // this.bulletLifeTimeCap = 350;
        //bullet rendering
        this.projectileTileInfo = tile(tileTable.playerProjectiles, defaultItemProjSize, 1).frame(2);
        this.projectileDrawSize = vec2(2);
        this.bulletParticleAttributes = {
            pos: vec2(),
            angle: 0,
            emitSize: 4,
            emitTime: 0.2,
            emitRate: 0.5,
            emitCone: 0,
            tileInfo: tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(2),
            // colorStartA: new Color(0.824, 0, 0, 1),
            // colorStartB: new Color(0.961, 0.11, 0.039, 1),
            // colorEndA: new Color(0.251, 0, 0, 1),
            // colorEndB: new Color(0.251, 0, 0, 1),
            colorStartA: new Color(0.867, 0.812, 0.98, 1), 
            colorStartB: new Color(0.867, 0.812, 0.98, 1),
            colorEndA: new Color(0.651, 0.718, 0.843, 1),
            colorEndB: new Color(0.58, 0.62, 0.78, 1),
            particleTime: 0.15,
            sizeStart: 1,
            sizeEnd: 0.5,
            particleSpeed: 0.45,
            particleAngleSpeed: 0,
            damping: 1,
            angleDamping: 1,
            gravityScale: 0,
            particleCone: 3.14,
            fadeRate: 0.1,
            randomness: 0,
            collide: 0,
            additive: 0,
            randomColorLinear: 1
        };
    }
    powerHandler() {
        this.damage = clamp(this.minDamage + (this.host.power / 20), this.minDamage, this.maxDamage);
        if (this.host.power >= 2 && this.host.power < 3.00) {
            this.shotCount = 6;
        } else if (this.host.power >= 3.00 && this.host.power < 4.00) {
            this.shotCount = 8;
        } else if (this.host.power >= 4.00 && this.host.power < 5.00) {
            this.shotCount = 10;
        } else if (this.host.power === 5.00) {
            this.shotCount = 12;
        }
    }
    fire() {
        let currShotCount = /*this.host.focused ? this.shotCount*3 :*/ this.shotCount;
        let currProjSpeed = /*this.host.focused? this.projectileSpeed*0.4 :*/ this.projectileSpeed;
        let currBulletLifeTimeCap = /*this.host.focused? this.bulletLifeTimeCap*3 :*/ this.bulletLifeTimeCap;
        const rotateStart = currShotCount / -20;
        const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
        const shotVec = vec2(velXY[0]*currProjSpeed, velXY[1]*currProjSpeed);
    
        let rotateVal = rotateStart;
        for (let i = 0; i < currShotCount; i++) {
            const rotateShotVec = shotVec.rotate(rotateVal);
            new PierceProjectile(cameraPos, rotateShotVec, vec2(2, 0.5), rotateShotVec.angle(), this.damage, (new Color).setHex("#dadada"), currBulletLifeTimeCap, this.projectileTileInfo, this.projectileDrawSize, this.bulletParticleAttributes);
            rotateVal += 0.1;
        }
    }
}

//Mid-range multi-shot weapon. Power increases shotCount.
class ThrowingKnives extends PlayerWeapon {
    constructor(pos, parent) {
        super(pos, parent);

        this.color = (new Color).setHex("#2efff5");
        this.host = parent;

        this.minDamage = 0.5;
        this.damage = this.minDamage;
        this.maxDamage = 1.0;

        this.projectileSpeed = 0.8;
        this.fireRate = 3;

        this.throwing = false;
        this.shotCount = 3;
        this.throwDelay = 100;
        this.bulletLifeTimeCap = 30;
        this.maxDeviation = 0.4;
    }
    powerHandler() {
        if (this.host.damageBoosted) { //make sure that damage boost is taken into account to the clamp
            this.damage = clamp((this.minDamage * 1.5) + (this.host.power / 10), this.minDamage, this.maxDamage * 1.5);
        } else {
            this.damage = clamp(this.minDamage + (this.host.power / 10), this.minDamage, this.maxDamage);
        }
        if (this.host.power >= 3.00 && this.host.power < 5.00) {
            this.shotCount = 4;
        } else if (this.host.power === 5.00) {
            this.shotCount = 5;
        }
    }
    burstShot(vel) {
        return new Promise((resolve) => {
            for (let i = 0; i < this.shotCount - 1; i++) {
                setTimeout(() => {
                    const randomDeviation = rand(0, this.maxDeviation);
                    const spreadVel = vel.rotate(randomDeviation);
                    new KnifeProjectile(this.pos, spreadVel, vec2(1,2), spreadVel.angle(), this.damage, new Color(0, 255, 0), this.bulletLifeTimeCap);
                }, this.throwDelay * (i + 1));
            }
            resolve(false);
        });
    }
    async fire() {
        if (!this.throwing) {
            const velXY = calcVel2Pos(mousePos, cameraPos.x, cameraPos.y);
            const velVec = vec2(velXY[0]*this.projectileSpeed, velXY[1]*this.projectileSpeed);
            //at least one projectile has no deviation
            new KnifeProjectile(this.pos, velVec, vec2(1,2), velVec.angle(), this.damage, new Color(0, 255, 0), this.bulletLifeTimeCap);
            this.throwing = true;
            this.throwing = await this.burstShot(velVec);
        }
    }
}

// -------- ENEMY WEAPONS ----------
class EnemyWeapon extends Weapon {
    constructor(pos, parent, damage, projectileSpeed, fireRate, target, bulletLifeTimeCap) {
        super(pos, parent, projectileSpeed);
        this.color = new Color(0, 0, 0);
        this.target = target;
        this.fireRate = fireRate ? fireRate : 4;
        this.projectileSpeed = projectileSpeed ? projectileSpeed : 0.5; 
        this.damage = damage ? damage : 4;

        this.fireTimeCap = 100;
        this.fireTimeBuffer = 0;
        this.bulletLifeTimeCap = bulletLifeTimeCap ? bulletLifeTimeCap : 200;
        
        this.frozen = false;
    }
    update() {
        super.update();
    }
}
 
// Generic EnemyGun class
// can input any fire function
class EnemyGun extends EnemyWeapon {
    constructor(pos, parent, damage, projectileSpeed, fireRate, target, fireFunc, bulletLifeTimeCap, projectileColour, pTileInfo, projectileSize, bulletType) {
        super(pos, parent, damage, projectileSpeed, fireRate, target, bulletLifeTimeCap);
        this.color = new Color(0, 0, 0);
        this.fire = fireFunc;
        this.projectileColour = projectileColour;
        this.projectileTileInfo = pTileInfo;
        this.projectileSize = projectileSize;
        this.bulletType = bulletType
    }
    update() {
        super.update();
        if (this.frozen) {
            this.fireTimeBuffer = 0;
        } else if (this.fireTimeBuffer >= this.fireTimeCap) {
            // console.log(`EnemyGun: ${this.projectileTileInfo}`);
            this.fire(this.target, this, this.damage, this.projectileSpeed, this.bulletLifeTimeCap, this.projectileColour, this.projectileTileInfo, this.projectileSize, this.bulletType);
            this.fireTimeBuffer = 0;
        }
        this.fireTimeBuffer += this.fireRate;
    }
}

class EnemyRailgun extends EnemyWeapon {
    constructor(pos, parent, damage, target, pTileInfo) {
        super(pos, parent, damage);
        this.color = new Color(0, 0, 0);
        this.target = target;
        this.fireRate = 0.6;
        this.projectileSpeed = 4; 
        this.bulletLifeTimeCap = 200;
        // this.projectileSpeed = 0.2; 
        // this.bulletLifeTimeCap = 1800;
        
        //bullet rendering
        this.projectileTileInfo = pTileInfo;
        this.bulletDrawSize = vec2(4);
        
        // railgun specific attributes
        this.fireTimeCap = rand(100, 300);
        this.markedPos = vec2(0,0);
        this.targetMarked = false;
        this.chargeTime = this.fireTimeCap/2;
        
        //walking attributes
        this.isChargingShot = false;
        this.walkTime = 0;
        this.walkDelayCap = rand(150,300);
        // this.bulletTrail = new ParticleEmitter(vec2(), 0, 4, 0.2, 4, 0, tile(0, 13), new Color(0.824, 0, 0, 1), new Color(0.961, 0.11, 0.039, 1), new Color(0.251, 0, 0, 1), new Color(0.251, 0, 0, 1), 0.5, 1.5, 0.75, 0.15, 0, 1, 1, 0, 3.14, 0.1, 0, 0, 0, 1);
        this.bulletParticleAttributes = {
            pos: vec2(),
            angle: 0,
            emitSize: 4,
            emitTime: 0.2,
            emitRate: 24,
            emitCone: 0,
            tileInfo: tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(1),
            colorStartA: new Color(0.824, 0, 0, 1),
            colorStartB: new Color(0.961, 0.11, 0.039, 1),
            colorEndA: new Color(0.251, 0, 0, 1),
            colorEndB: new Color(0.251, 0, 0, 1),
            particleTime: 0.5,
            sizeStart: 1,
            sizeEnd: 0.5,
            particleSpeed: 0.15,
            particleAngleSpeed: 0,
            damping: 1,
            angleDamping: 1,
            gravityScale: 0,
            particleCone: 3.14,
            fadeRate: 0.1,
            randomness: 0,
            collide: 0,
            additive: 0,
            randomColorLinear: 1
        };

        this.hitParticles = {
            pos: vec2(),
            angle: 0,
            emitSize: 4,
            emitTime: 0.2,
            emitRate: 100,
            emitCone: 3.14,
            tileInfo: tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(3),
            colorStartA: new Color(0.824, 0, 0, 1),
            colorStartB: new Color(0.961, 0.11, 0.039, 1),
            colorEndA: new Color(0.251, 0, 0, 1),
            colorEndB: new Color(0.251, 0, 0, 1),
            particleTime: 0.8,
            sizeStart: 1,
            sizeEnd: 2,
            particleSpeed: 0.25,
            particleAngleSpeed: 0,
            damping: 1,
            angleDamping: 1,
            gravityScale: 0,
            particleCone: 3.14,
            fadeRate: 0.1,
            randomness: 2,
            collide: 0,
            additive: 0,
            randomColorLinear: 1
        };
    }
    fire(targetPos, host, projectileSpeed) {
        //drawLine(targetPos, host.pos, 0.1, new Color(255, 0, 0))
        const velXY = calcVel2Pos(targetPos, host.pos.x, host.pos.y);
        const velVec = vec2(velXY[0]*projectileSpeed, velXY[1]*projectileSpeed);
        const angle = velVec.angle();
        new EnemyProjectile(host.pos, velVec, vec2(0.5, 6), angle, this.damage, undefined, this.bulletLifeTimeCap, this.projectileTileInfo, this.bulletDrawSize, this.bulletParticleAttributes, this.hitParticles, "railgun");
    }
    update() {
        super.update();
        if (this.walkTime <= this.walkDelayCap) {
            this.walkTime++;
        } else {
            this.fireTimeBuffer += this.fireRate;
            this.isChargingShot = true;
        }

        if (this.frozen) {
            this.fireTimeBuffer = 0;
        } else if (this.fireTimeBuffer >= this.fireTimeCap) {
            this.fire(this.markedPos, this, this.projectileSpeed);
            // console.log(`Shot fired at ${this.markedPos}`);
            this.targetMarked = false;

            //randomize next shot's charge time
            this.fireTimeCap = rand(200, 300);
            this.chargeTime = this.fireTimeCap/rand(1, 2);

            //put host back to walking state
            this.isChargingShot = false;
            this.host.posSelected = false;
            this.walkTime = 0;
            this.fireTimeBuffer = 0;
            this.walkDelayCap = rand(150,300);
        } else if (this.fireTimeBuffer < this.chargeTime && this.isChargingShot) { //charging shot
            drawLine(this.target.pos, this.pos, 0.2, new Color(255, 0, 0)); //draw line towards the target (which is player)
        } else if (this.fireTimeBuffer > this.chargeTime && !this.targetMarked) { //if the shot is charged and target is not marked
            this.markedPos = this.target.pos.copy();
            // console.log(`Target marked at ${this.markedPos}`);
            this.targetMarked = true;
        } else if (this.targetMarked) { //shot charged and aiming at marked location
            let targetLine = this.pos.copy();
            const targetPos = this.markedPos.copy();
            targetLine = targetPos.subtract(targetLine);
            // SCALE IS RELATIVE TO 0,0
            drawLine(this.pos, targetPos.add(targetLine.scale(5000)), 0.2, new Color(255, 0, 0));
            // drawRect(this.pos, vec2(1,1), new Color(255, 0, 0))
            // console.log(`Aiming at ${this.markedPos}`);
        }
    }
}

// --------- PROJECTILES ----------
class Projectile extends EngineObject {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes, hitParticleAttributes, bulletType) {
        super(pos, size, tileInfo, angle);
        this.damage = damage;
        this.color = color;
        this.setCollision();
        this.velocity = vel;
        this.lifeTimeCap = lifeTimeCap;
        this.lifeTime = this.lifeTimeCap;
        this.particleAttributes = particleAttributes;
        this.hitParticleAttributes = hitParticleAttributes;
        
        this.bulletType = bulletType;
    }
    update() {
        super.update();
        this.lifeTime -= 1;
        if (this.lifeTime <= 0) {
            this.destroy();
            this.lifeTime = this.lifeTimeCap;
        }
        // console.log(`hitParticleAttributes: ${this.hitParticleAttributes}`);
        if (this.particleAttributes && !timeStopped) {
            new ParticleEmitter(
                this.pos,
                this.particleAttributes.angle,
                this.particleAttributes.emitSize,
                this.particleAttributes.emitTime,
                this.particleAttributes.emitRate,
                this.particleAttributes.emitCone,
                this.particleAttributes.tileInfo,
                this.particleAttributes.colorStartA,
                this.particleAttributes.colorStartB,
                this.particleAttributes.colorEndA,
                this.particleAttributes.colorEndB,
                this.particleAttributes.particleTime,
                this.particleAttributes.sizeStart,
                this.particleAttributes.sizeEnd,
                this.particleAttributes.particleSpeed,
                this.particleAttributes.particleAngleSpeed,
                this.particleAttributes.damping,
                this.particleAttributes.angleDamping,
                this.particleAttributes.gravityScale,
                this.particleAttributes.particleCone,
                this.particleAttributes.fadeRate,
                this.particleAttributes.randomness,
                this.particleAttributes.collide,
                this.particleAttributes.additive,
                this.particleAttributes.randomColorLinear
            )
        }
    }
    collideWithObject(o) {
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (this.hitParticleAttributes && parentObject === "PlayerChar" && !timeStopped) {
            console.log("hitParticles");
            new ParticleEmitter(
                this.pos,
                this.hitParticleAttributes.angle,
                this.hitParticleAttributes.emitSize,
                this.hitParticleAttributes.emitTime,
                this.hitParticleAttributes.emitRate,
                this.hitParticleAttributes.emitCone,
                this.hitParticleAttributes.tileInfo,
                this.hitParticleAttributes.colorStartA,
                this.hitParticleAttributes.colorStartB,
                this.hitParticleAttributes.colorEndA,
                this.hitParticleAttributes.colorEndB,
                this.hitParticleAttributes.particleTime,
                this.hitParticleAttributes.sizeStart,
                this.hitParticleAttributes.sizeEnd,
                this.hitParticleAttributes.particleSpeed,
                this.hitParticleAttributes.particleAngleSpeed,
                this.hitParticleAttributes.damping,
                this.hitParticleAttributes.angleDamping,
                this.hitParticleAttributes.gravityScale,
                this.hitParticleAttributes.particleCone,
                this.hitParticleAttributes.fadeRate,
                this.hitParticleAttributes.randomness,
                this.hitParticleAttributes.collide,
                this.hitParticleAttributes.additive,
                this.hitParticleAttributes.randomColorLinear
            );
        }
        return 1;
    }

}

class PlayerProjectile extends Projectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes) {
        super(pos, vel, size, angle, damage, color, lifeTimeCap ? lifeTimeCap : 600, tileInfo, particleAttributes);
        this.renderOrder = 4;
    }
    collideWithObject(o) {
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (parentObject === "Enemy" || o.constructor.name === "Wall") {
            // console.log("Hit!");
            this.destroy();
        }
        return 1;
    }
}

class PierceProjectile extends PlayerProjectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, drawSize, particleAttributes) {
        super(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes);
        this.mass = 0;
        this.drawSize = drawSize;
    }
    collideWithObject(o) {
        if (o.constructor.name === "Wall") {
            this.destroy();
        }
        return 1;
    }
    render() {
        // console.log(`enemyProjectile Tile Info: ${this.tileInfo}`);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - PI/4);
    }
}

// Projectile for the ThrowingKnives weapon
// Has unique interaction with stopTime, where the knives thrown are frozen but unfreeze when time resumes
class KnifeProjectile extends PierceProjectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes) {
        super(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes);
        this.frozen = false;
        this.wasFrozen = false;
        this.resetLifeTime = false;
        this.oldVel = this.velocity;
        this.drawSize = vec2(2);

        this.tileInfo = tile(tileTable.playerProjectiles, defaultItemProjSize, 1).frame(0);
    }
    update() {
        super.update();
        if (this.frozen) {
            this.lifeTime = 99999;
            this.velocity = vec2(0,0);
            this.resetLifeTime = true;
            this.wasFrozen = true;
        } else if (this.resetLifeTime) { //only reset on initial unfreeze
            this.velocity = this.oldVel;
            this.lifeTime = this.lifeTimeCap * 3;
            this.resetLifeTime = false;
        }
    }
    render() {
        // drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - 0.9);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - PI/4);
    }
}

class HomingProjectile extends PlayerProjectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes) {
        super(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes);
        this.targetAcquired = false;
        this.bestDistance = 500;
        this.bestObject = undefined;
        this.bestObjectDead = false;
        this.projectileSpeed = 0.8;
        
        this.drawSize = vec2(2);
    }
    update() {
        super.update();
        if (!this.targetAcquired) {
            for (const o of engineObjects) {
                const parentObject = Object.getPrototypeOf(o.constructor).name;
                if (parentObject === "Enemy") {
                    const distance = this.pos.distanceSquared(o.pos);
                    if (distance < this.bestDistance) {
                        this.bestObject = o;
                        this.targetAcquired = true;
                        // console.log("target acquired");
                    }
                }
            } 
        } else {
            const velXY = calcVel2Pos(this.bestObject.pos, this.pos.x, this.pos.y);
            // console.log(velXY);
            this.velocity = vec2(velXY[0]*this.projectileSpeed, velXY[1]*this.projectileSpeed);
            this.angle = this.velocity.angle();

            //checking for leftover homing bullets that were fired after the target was dead (but were still homing towards it)
            this.bestObjectDead = true;
            for (const o of engineObjects) {
                if (o === this.bestObject) { //if bestObject is found, it is not dead
                    this.bestObjectDead = false;
                }
            }
            if (this.bestObjectDead) {
                // this.destroy();
                this.targetAcquired = false; //look for new target if current target dies
            }
        }
    }
    render() {
        this.tileInfo = tile(tileTable.playerProjectiles, defaultItemProjSize, 1).frame(1);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - PI/4);
        // drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - 0.9);
    }
}

class EnemyProjectile extends Projectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, drawSize, particleAttributes, hitParticleAttributes, bulletType) {
        super(pos, vel, size, angle, damage, color, lifeTimeCap, tileInfo, particleAttributes, hitParticleAttributes, bulletType);
        // console.log("Firing EnemyProjectile");
        this.oldVel = this.velocity;
        this.frozen = false;
        this.resetLifeTime = false;
        this.drawSize = drawSize ? drawSize : vec2(2);
    }
    collideWithObject(o) {
        super.collideWithObject(o);
        if (o.constructor.name === "Wall") {
            // console.log("Enemy projectile hit!");
            this.destroy();
            return 1;
        }
        if (this.frozen) {
            this.velocity = vec2(0, 0);
            this.lifeTime = 999999;
            this.resetLifeTime = true;
        } else if (this.resetLifeTime) {
            this.velocity = this.oldVel;
            this.lifeTime = this.lifeTimeCap;
            this.resetLifeTime = false;
        }
        
        if (o.constructor.name === "KnifeProjectile") {
            if (o.wasFrozen && !timeStopped) {
                this.destroy();
            }
        }
        
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if (parentObject === "PlayerChar" && !timeStopped) {
            if (this.bulletType === "railgun") {
                if (o.constructor.name === "PlayerYoumu" && !o.myonRespawning) {
                    screenShake = 0;
                } else {
                    screenShake = 20;
                    new CriticalHitScreen();
                }
            } else if (this.bulletType === "bolt") {
                if (o.constructor.name === "PlayerYoumu" && (!o.myonRespawning || o.dashing)) {
                    o.hitByBolt = false;
                } else {
                    o.hitByBolt = true;
                }
            }
        }
        
    }
    render() {
        // console.log(`enemyProjectile Tile Info: ${this.tileInfo}`);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, this.angle - PI/4);
    }
    update() {
        super.update();
        
    }
}

// -------------- SPECIAL PROJECTILES ----------------

class ReimuBomb extends EngineObject {
    constructor(pos, vel) {
        const size = vec2(30, 30);
        super(pos, size);
        this.damage = 0.25;
        this.color = new Color(255, 0, 0, 0.5);
        this.setCollision();
        this.velocity = vel;
        this.lifeTimeCap = 300;
        this.lifeTime = this.lifeTimeCap;
        this.rotation = 0;
        this.mass = 0;
        this.renderOrder = 1;
    }
    update() {
        super.update();
        this.rotation += 0.1;
        this.angle = this.rotation;
        this.lifeTime -= 1;
        if (this.lifeTime <= 0) {
            this.destroy();
            this.lifeTime = this.lifeTimeCap;
        }
    }
    collideWithObject(o) {
        if (o.constructor.name === "EnemyProjectile") {
            this.damage += 0.001;
            o.destroy();
        }
        return 1;
    }
}

class SpiritSlashProjectile extends PierceProjectile {
    constructor(pos, vel, size, angle, damage, color, lifeTimeCap) {
        const particleAttributes = {
            pos: vec2(),
            angle: 0,
            emitSize: 4,
            emitTime: 0.1,
            emitRate: 0.0001,
            emitCone: 0,
            tileInfo: tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(2),
            // colorStartA: new Color(0.824, 0, 0, 1),
            // colorStartB: new Color(0.961, 0.11, 0.039, 1),
            // colorEndA: new Color(0.251, 0, 0, 1),
            // colorEndB: new Color(0.251, 0, 0, 1),
            colorStartA: new Color(0.988, 0.906, 0.906, 1), 
            colorStartB: new Color(0.988, 0.906, 0.906, 1), 
            colorEndA: new Color(1, 0.043, 0.043, 1), 
            colorEndB: new Color(1, 0.043, 0.043, 1),
            particleTime: 0.15,
            sizeStart: 1.2,
            sizeEnd: 0.7,
            particleSpeed: 0.35,
            particleAngleSpeed: 0,
            damping: 1,
            angleDamping: 1,
            gravityScale: 0,
            particleCone: 3.14,
            fadeRate: 0.1,
            randomness: 0.5,
            collide: 0,
            additive: 0,
            randomColorLinear: 1
        };
        super(pos, vel, size, angle, damage, color, lifeTimeCap, undefined, undefined, particleAttributes);
        this.mass = 0;

        this.tileInfo = tile(tileTable.playerProjectiles, defaultItemProjSize, 1).frame(3);
        this.drawSize = vec2(2);
    }
    collideWithObject(o) {
        if (o.constructor.name === "Wall") {
            this.destroy();
        }
        if (o.constructor.name === "EnemyProjectile") {
            o.destroy();
        }
        return 1;
    }

}

class TimeBubble extends EngineObject {
    constructor(pos) {
        super(pos, vec2(1,1));
        this.color = (new Color).setHex("#3000cc").scale(1, 0.5);
        this.setCollision();
        this.mass = 0;
        this.renderOrder = 3;
        this.durationDone = false;
    }
    update() {
        this.pos = cameraPos;
        if (this.size.area() < levelSize.area() * 2) {
            this.size = this.size.scale(1.5);
        }
        if (this.durationDone) {
            this.size = this.size.scale(0.5);
            if (this.size.area() <= 0) {
                this.destroy();
            }
        }
    }
}

// class Shield extends EngineObject {
//     constructor(pos, parent) {
//         const size = vec2(8, 8);
//         super(pos, size);

//         parent.addChild(this, vec2(0,0));
//         this.host = parent;
//         this.mass = 0;
        
//         this.color = (new Color(0, 0, 255)).scale(1, 0.2);
//         this.setCollision(true);
//     }
//     collideWithObject(o) {
//         console.log(o.constructor.name);
//         if (o.constructor.name === "EnemyProjectile") {
//             o.destroy();
//         }
//         return 1;
//     }
//     update() {
//         super.update();
//     }
// }