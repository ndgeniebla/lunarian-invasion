'use strict';

/**
 * 
 * @param {Vector2} objectPos 
 * @param {Number} dx 
 * @param {Number} dy 
 * @return {Array}
 */
function calcVel2Pos(objectPos, dx, dy) {
    //objectPos is the position of the target/destination
    let velX = objectPos.x - dx;
    let velY = objectPos.y - dy;
    const len = Math.sqrt(velX*velX + velY*velY);
    velX /= len;
    velY /= len;
    return [velX, velY];
}

// Weapon firing functions

function normalFire(target, host, damage, projectileSpeed, bulletLifeTimeCap, projectileColour, tileInfo, drawSize, bulletType) {
    const velXY = calcVel2Pos(target.pos, host.pos.x, host.pos.y);
    const velVec = vec2(velXY[0]*projectileSpeed, velXY[1]*projectileSpeed);
    const angle = velVec.angle();
    const colour = projectileColour ? projectileColour : new Color(255, 255 ,0);
    // console.log(tileInfo);
    new EnemyProjectile(host.pos, velVec, vec2(1,1), angle, damage, colour, bulletLifeTimeCap, tileInfo, undefined, undefined, undefined, bulletType);
}

function shotgunFire(target, host, damage, projectileSpeed, bulletLifeTimeCap, projectileColour, tileInfo, drawSize, bulletType) {
    const shotCount = 6;
    const rotateStart = shotCount / -20;
    const velXY = calcVel2Pos(target.pos, host.pos.x, host.pos.y);
    const shotVec = vec2(velXY[0]*projectileSpeed, velXY[1]*projectileSpeed);

    const angle = shotVec.angle();

    let rotateVal = rotateStart;
    for (let i = 1; i <= shotCount; i++) {
        new EnemyProjectile(host.pos, shotVec.rotate(rotateVal), vec2(1,1), angle, damage, (new Color).setHex("#ff0afb"), bulletLifeTimeCap, tileInfo, undefined, undefined, undefined, bulletType);
        rotateVal += 0.1;
    }
}

function radialFire(target, host, damage, projectileSpeed, bulletLifeTimeCap, projectileColour, tileInfo, drawSize, bulletType) {
    const shotCount = 6;
    const shotVec = vec2(projectileSpeed, projectileSpeed);

    let rotateVal = rand(1, 4);
    for (let i = 1; i <= shotCount; i++) {
        const rotateVec = shotVec.rotate(rotateVal);
        new EnemyProjectile(host.pos, rotateVec, vec2(2,3), rotateVec.angle(), damage, (new Color).setHex("#ff0afb"), bulletLifeTimeCap, tileInfo, drawSize, undefined, undefined, bulletType);
        rotateVal += 2*PI/shotCount;
    }
}

function toMilliseconds(seconds) {
   return seconds * 1000;
}