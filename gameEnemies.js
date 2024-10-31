// ----- ENEMY CHARS -----
class Enemy extends EngineObject {
    constructor(pos, size, target, movespeed) {
        super(pos, size);
        this.target = target;
        this.movespeed = movespeed ? movespeed : 0;
        this.oldMovespeed = this.movespeed;
        this.setCollision();
        this.mass = 0.00001;

        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.healthBar = new HealthBar(this.pos, this);
        this.shadow = new Shadow(this.pos, this);
        this.killed = false;
        this.frozen = false;
        this.points = 1;
        
        //rendering
        this.tileSize = vec2(defaultEntitySize);
        this.drawSize = vec2(6);
        this.renderOrder = 2;
        
        // walking
        this.walkCyclePercent = 0;
        this.walkCycleReset = 8; //the higher the number, the longer it takes to go to the next walk frame
        this.walkFrame = 0;
        this.direction = {x: 0, y: 0};
        this.lastDirection = {x: 0, y: 0};
    } 
    dropItem() {
        const powerRoll = randInt(1, 3);
        const healthRoll = randInt(1, 20);
        // const shieldRoll = randInt(1, 50);
        
        if (powerRoll === 1) {
            return new PowerUp(this.pos);
        }
        
        if (healthRoll === 1) {
            return new HealthUp(this.pos);
        }
        
        // if (shieldRoll === 1) {
        //     return new ShieldPickup(this.pos);
        // }
    }
    walkCycleHandler() {
        const [velX, velY] = calcVel2Pos(this.pos, cameraPos.x, cameraPos.y);
        if (this.velocity.x === 0 && this.velocity.y === 0) {
            //not moving
            this.walkFrame = false; //looks incredibly stupid but basically "false" is the idle frame for the sprite
            //is coerced into a Number when flipping the frames
        } else if (velX !== 0 || velY !== 0) {
            this.walkCyclePercent += 1;
            if (this.walkCyclePercent >= this.walkCycleReset) {
                this.walkFrame = !this.walkFrame;
                this.walkCyclePercent = 0;
            }
        }
        this.mirror = velX > 0 ? true : false;
    }
    update() {
        super.update();
        if (!this.frozen && !gamePaused) {
            this.walkCycleHandler();
        }

        if (this.frozen || gamePaused) {
            this.movespeed = 0;
            // console.log("FREEZE!!!!");
        } else {
            this.movespeed = this.oldMovespeed;
        }

        this.pos.x = clamp(this.pos.x, -levelSize.x/2 + this.size.x, levelSize.x/2 - this.size.x);
        this.pos.y = clamp(this.pos.y, -levelSize.y/2 + this.size.y, levelSize.y/2 - this.size.y);
        // console.log(this.movespeed);
    }
    collideWithObject(o){
        //console.log(o.constructor.name);
        const parentObject = Object.getPrototypeOf(o.constructor).name;
        if ((o.constructor.name === "PlayerProjectile" 
            || o.constructor.name === "ReimuBomb"
            || o.constructor.name === "SpiritSlashProjectile"
            || parentObject === "PlayerProjectile"
            || parentObject === "PierceProjectile") 
            && !timeStopped
            && !gamePaused) {
            this.health -= o.damage;
            // console.log(this.health); 
        }
        
        // if (this.frozen) {
        //     this.movespeed = 0;
        // } else {
        //     this.movespeed = this.oldMovespeed;
        // }

        // the 'killed' bool is to prevent the case where the enemy gets "killed" multiple times (e.g. when being hit by a PierceProjectile)
        // mainly used to fix the enemy counter, as well as multiple items dropping when it's not intended
        if (this.health <= 0 && !this.killed) {
            if (o.constructor.name === "KnifeProjectile") {
                if (o.wasFrozen && !gameOver) { //enemies killed with time-stopped knives heal Sakuya
                    this.target.health = clamp(this.target.health + 1, 0, this.target.maxHealth);
                    new StatusText(this.target.pos, this.target, "+1 HP", 3, (new Color).setHex("#1aff00"));
                    // console.log("healed");
                }
            } else if  (o.constructor.name === "ReimuBomb"
            || o.constructor.name === "SpiritSlashProjectile" && !gameOver) { //special ability healing
                this.target.health = clamp(this.target.health + 1, 0, this.target.maxHealth);
                new StatusText(this.target.pos, this.target, "+1 HP", 3, (new Color).setHex("#1aff00"));
                // console.log("healed");
            }
            totalEnemies--;
            this.dropItem();
            this.destroy();
            totalPoints += this.points;
            this.killed = true;
        }
        return 1;
    }
}

class Swarmer extends Enemy {
    constructor(pos, target) {

        const size = vec2(2,4);
        const movespeed = 0.23;

        super(pos, size, target, movespeed);
        this.color = new Color(0, 255, 255);
        const damage = 1;
        const projectileSpeed = 1;
        const fireRate = 2;
        const bulletLifeTimeCap = 10;

        const projectileTileInfo = tile(tileTable.enemyProjectiles, defaultItemProjSize, 1).frame(0);
        this.weapon = new EnemyGun(this.pos, this, damage, projectileSpeed, fireRate, target, normalFire, bulletLifeTimeCap, this.color, projectileTileInfo);
        this.points = 100;

        this.walkCycleReset = 10;
    }
    update() {
        super.update();
        const velXY = calcVel2Pos(this.target.pos, this.pos.x, this.pos.y);
        this.velocity.x = velXY[0] * this.movespeed;
        this.velocity.y = velXY[1] * this.movespeed;
        const distFromTarget = this.pos.distance(this.target.pos);
        if (distFromTarget <= 3) { // stop at a certain distance
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

    }
    render() {
        const currFrame = this.walkFrame | 0;
        // this.tileInfo = tile(tileTable.swarmer, this.tileSize).frame(currFrame);
        this.tileInfo = tile(tileTable.swarmer, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror)
    }
}

class Gunner extends Enemy {
    constructor(pos, target) {

        const size = vec2(2,4);
        const movespeed = 0.15;

        super(pos, size, target, movespeed);
        const damage = 4;
        const projectileSpeed = 0.2;
        // const fireRate = 4;
        const fireRate = rand(3, 5);
        const bulletLifeTimeCap = 250;

        //projectile rendering
        const projectileTileInfo = tile(tileTable.enemyProjectiles, defaultItemProjSize, 1).frame(1);
        this.weapon = new EnemyGun(this.pos, this, damage, projectileSpeed, fireRate, target, normalFire, bulletLifeTimeCap, undefined, projectileTileInfo);

        this.color = new Color(255, 255, 0);
        this.maxHealth = 16;
        this.health = this.maxHealth;
        
        this.points = 200;
        
    }
    update() {
        super.update();
        const velXY = calcVel2Pos(this.target.pos, this.pos.x, this.pos.y);
        //default movement (when close to the player) is moving away
        this.velocity.x = -velXY[0] * this.movespeed;
        this.velocity.y = -velXY[1] * this.movespeed;
        const distFromTarget = this.pos.distance(this.target.pos);
        if (distFromTarget > 30 && distFromTarget < 40) { // move slower at greater distance
            this.velocity.x = -velXY[0] * (this.movespeed / 2);
            this.velocity.y = -velXY[1] * (this.movespeed / 2);
        } else if (distFromTarget >= 40 && distFromTarget <= 43) { // stop at a certain distance
            this.velocity.x = 0;
            this.velocity.y = 0;
        } else if (this.pos.distance(this.target.pos) > 43) { //if player is too far, start moving towards them
            this.velocity.x = velXY[0] * this.movespeed;
            this.velocity.y = velXY[1] * this.movespeed;
        }
    }
    render() {
        const currFrame = this.walkFrame | 0;
        this.tileInfo = tile(tileTable.gunner, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror)
    }
}

class ShotGunner extends Enemy {
    constructor(pos, target) {
        const size = vec2(3, 4);
        const movespeed = 0.4;
        super(pos, size, target, movespeed);
        const damage = 3;
        const projectileSpeed = 0.4;
        const fireRate = 0.6;

        const projectileTileInfo = tile(tileTable.enemyProjectiles, defaultItemProjSize, 1).frame(3);

        this.weapon = new EnemyGun(this.pos, this, damage, projectileSpeed, fireRate, target, shotgunFire, undefined, undefined, projectileTileInfo);
        this.color = (new Color).setHex("#ff0afb");
        this.maxHealth = 48;
        this.health = this.maxHealth;

        this.points = 500;

        this.walkCycleReset = 6;
    }
    update () {
        super.update();
        const velXY = calcVel2Pos(this.target.pos, this.pos.x, this.pos.y);
        this.velocity.x = velXY[0] * this.movespeed;
        this.velocity.y = velXY[1] * this.movespeed;
        const distFromTarget = this.pos.distance(this.target.pos);
        if (distFromTarget >= 5 && distFromTarget <= 10) { // stop at a certain distance
            this.velocity.x = 0;
            this.velocity.y = 0;
        } else if (distFromTarget < 5) { // move away if player is too close
            this.velocity.x = -velXY[0] * this.movespeed * 2;
            this.velocity.y = -velXY[1] * this.movespeed * 2;
        }
    }
    render() {
        const currFrame = this.walkFrame | 0;
        this.tileInfo = tile(tileTable.shotGunner, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror)
    }
}

class RailGunner extends Enemy {
    constructor(pos, target) {
        const size = vec2(2,4);
        const movespeed = 0.2;
        super(pos, size, target, movespeed);
        const damage = 40;

        const projectileTileInfo = tile(tileTable.enemyProjectiles, defaultItemProjSize, 1).frame(4);
        this.weapon = new EnemyRailgun(this.pos, this, damage, target, projectileTileInfo);
        this.color = new Color(0, 255, 0);
        
        //movement attributes
        this.posSelected = false;
        this.newPos = vec2(0,0);
        this.velToNewPos = vec2(0,0);
        this.moveVel = vec2(0,0);
        
        //distance away from the walls of the level
        this.posSelectPadding = 20;
        
        this.maxHealth = 8;
        this.health = this.maxHealth;
        this.points = 1000;
        
        this.lastAimDirection = 0;
    }
    update () {
        super.update();

        if (!this.posSelected) {
            //choose random position in the level to move towards
            //the position is posSelectPadding away from the walls of the level
            this.newPos = vec2(rand(-levelSize.x/2 + this.posSelectPadding, levelSize.x/2 - this.posSelectPadding), 
                               rand(-levelSize.y/2 + this.posSelectPadding, levelSize.y/2 - this.posSelectPadding));
            
            // console.log(this.newPos);
            //set velocity to go to that selected position
            const velXY = calcVel2Pos(this.newPos, this.pos.x, this.pos.y);
            this.velToNewPos = vec2(velXY[0]*this.movespeed, velXY[1]*this.movespeed);
            // this.oldVel = this.velToNewPos;
            //prevent further position selection after the initial one
            this.posSelected = true;
        }
        
        if (this.frozen || gamePaused) {
            this.velocity = vec2(0, 0);
        } else if (!this.weapon.isChargingShot) {
            // start moving to selected position
            this.velocity = this.velToNewPos;
        } else {
            // if charging shot, stop moving
            this.velocity = vec2(0, 0);
        }
    }
    walkCycleHandler() {
        super.walkCycleHandler();
        const [velAimX, ] = calcVel2Pos(this.pos, cameraPos.x, cameraPos.y);
        if (!this.weapon.targetMarked) {
            this.mirror = this.weapon.isChargingShot ? (velAimX > 0 ? true : false) : (this.velocity.x > 0 ? false : true);
            this.lastAimDirection = this.mirror;
        } else {
            this.mirror = this.lastAimDirection;
        }
        // console.log (this.mirror);
    }
    render() {
        const currFrame = (this.weapon.isChargingShot && !this.frozen) ? 2 : this.walkFrame | 0; //3rd frame for railGunner is the aiming animation
        this.tileInfo = tile(tileTable.railGunner, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo, undefined, undefined, this.mirror)
    }
}

class ElectricPillar extends Enemy {
    constructor(pos, target) {
        const size = vec2(3, 6);
        const movespeed = 0;
        super(pos, size, target, movespeed);

        const damage = 2;
        const projectileSpeed = 0.1;
        const fireRate = 0.6;


        const projectileTileInfo = tile(tileTable.enemyProjectiles, defaultItemProjSize, 1).frame(2);
        const bulletSize = vec2(4);
        // console.log(projectileTileInfo);

        this.mass = 9999999;
        this.bulletLifeTimeCap = 800;
        this.weapon = new EnemyGun(this.pos, this, damage, projectileSpeed, fireRate, target, radialFire, this.bulletLifeTimeCap, undefined, projectileTileInfo, bulletSize, "bolt");
        this.color = (new Color).setHex("#4000c9");

        this.maxHealth = 30;
        this.health = this.maxHealth;
        
        this.points = 1500;
        
        this.attackCyclePercent = 0;
        this.attackCycleReset = 8;
        this.attackFrame = 0;
        this.attacked = false;
    }
    attackCycleHandler() {
        if (this.attackCyclePercent >= this.attackCycleReset) {
            if (this.attacked === false) {
                this.attackFrame = !this.attackFrame;
                this.attacked = true;
            }
            this.attackCyclePercent--;
        } else {
            this.attacked = false;
            this.attackFrame = 0;
        }
    }
    update() {
        super.update();
        this.velocity = vec2(0,0);
        this.attackCycleHandler();
        if (this.weapon.fireTimeBuffer >= this.weapon.fireTimeCap) {
            this.attackCyclePercent = 40;
        }
    }
    render() {
        const currFrame = this.attackFrame | 0;
        this.tileInfo = tile(tileTable.electricPillar, this.tileSize).frame(currFrame);
        drawTile(this.pos, this.drawSize, this.tileInfo);
    }
}