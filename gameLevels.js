
async function spawnEnemy(enemyType, target, spawnDelay) {
    return new Promise((resolve) => {
        const randSpawn = vec2(rand(-levelSize.x/2 - 5, levelSize.x/2 - 5), rand(-levelSize.y/2 - 5, levelSize.y/2 - 5));
        setTimeout(() => {
            if (timeStopped || gameOver || !gameStarted) {
                resolve("not spawned");
            } else {
                console.log(`${enemyType.name} spawned`);
                // new ParticleEmitter(randSpawn, 0, 0, 8, 0.5, 1.2, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(4), new Color(0.11, 0.118, 0.149, 1), new Color(0.11, 0.118, 0.149, 1), new Color(0.651, 0.667, 0.741, 0.5), new Color(0.475, 0.541, 0.608, 0.5), 1, 1, 2, 0.25, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
                // new ParticleEmitter(this.pos, 0, 6, 0.1, 50, 3.14, tile(tileTable.playerParticles, defaultItemProjSize, 2).frame(2), new Color(0.502, 1, 0, 1), new Color(0.502, 1, 0, 1), new Color(0.976, 0.941, 0.749, 0), new Color(0.976, 0.941, 0.749, 0), 0.2, 1, 0.5, 0.05, 0.05, 1, 1, 0, 3.14, 0.1, 0.2, 0, 0, 1);
                new enemyType(randSpawn, target);
                resolve("spawned");
            }
        }, spawnDelay)
    })
}

//spawn delay is in milliseconds (ms)
async function spawnHandler(enemyType, spawnAmount, spawnDelay, target) {
    if (!spawnAmount) return; //prevents enemies from spawning that are not supposed to spawn
    for (let i = 0; i < spawnAmount; i++) {
        if (gameOver || !gameStarted) {
            return console.log("Game over! Enemy spawning stopped.");
        }

        const result = await spawnEnemy(enemyType, target, spawnDelay);
        if (result === "not spawned") {
            i--;
            continue;
        }
        // console.log("enemy spawned");
    }
    return console.log(`All ${enemyType.name} spawned!`);
}

function getWaveDetails(waveNum) {
    const swarmerNum = Math.floor(waveNum) * 5;
    const gunnerNum = Math.floor(swarmerNum / 3);

    //only start spawning on the 5th wave onwards
    const shotGunnerNum = Math.floor(waveNum / 3) + Math.floor(gunnerNum / 3);
    
    //spawns past wave 5 
    const railGunnerNum = Math.floor(waveNum / 5) + Math.floor(shotGunnerNum / 4);
    
    //spawns past wave 7 
    const electricPillarNum = Math.floor(waveNum / 7) + Math.floor(shotGunnerNum / 5);

    const totalEnemyNum = swarmerNum + gunnerNum + shotGunnerNum + railGunnerNum + electricPillarNum;

    return {
        swarmers: swarmerNum,
        gunners: gunnerNum,
        shotGunners: shotGunnerNum,
        railGunners: railGunnerNum,
        electricPillars: electricPillarNum,
        enemies: totalEnemyNum
    }
}

function startWave(waveNum) {
    const wave = getWaveDetails(waveNum);
    spawnHandler(Swarmer, wave.swarmers, 1500, player);
    spawnHandler(Gunner, wave.gunners, 4500, player);
    spawnHandler(ShotGunner, wave.shotGunners, 8000, player);
    spawnHandler(RailGunner, wave.railGunners, 10000, player);
    spawnHandler(ElectricPillar, wave.electricPillars, 15000, player);
}

function drawGround() {
    // TileLayer implementation sucked real bad
    // Even though the tiles are pre-rendered, it constantly froze the game.
    // Drawing each tile 60 times per second is not ideal, but at least the game is playable
    //
    // const tileLayer = new TileLayer(vec2(), levelSize, tile(0, defaultTileSize), vec2(6));
    // for (let x = -levelSize.x; x < levelSize.x; x++) {
    //     for (let y = -levelSize.y; y < levelSize.y; y++) { //+= 6
    //         const flip = y % 3 ? true : false;
    //         console.log("hello");
    //         const data = new TileLayerData(32, randInt(4), flip);
    //         tileLayer.setData(vec2(x,y), data);
    //         // drawTile(vec2(x,y), vec2(6), bgTile.frame(randTexture), undefined, undefined, flip);
    //         // if (x <= -levelSize.x / 2 || x >= levelSize.x / 2
    //         //     || y <= -levelSize.y / 2 || y >= levelSize.y / 2) {
    //         //     // drawTile(vec2(x,y), vec2(6), bgTile.frame(2));
    //         // }
    //     }
    // }
    // tileLayer.redraw();
    
    const bgDrawSize = 24;
    const bgTile = tile(tileTable.bg1, vec2(bgDrawSize));
    for (let x = -levelSize.x; x < levelSize.x; x += 6) {
        for (let y = -levelSize.y; y < levelSize.y; y += 6) {
            const flip = y % 3 ? true : false;
            const randTexture = x % 4 ? 0 : 1;
            drawTile(vec2(x,y), vec2(6), bgTile.frame(randTexture), undefined, undefined, flip);
        }
    }
}

function drawBarrier() {
    for (let x = -levelSize.x; x < levelSize.x; x += 6) {
        for (let y = -levelSize.y; y < levelSize.y; y += 6) {
            if (x <= -levelSize.x / 2 || x >= levelSize.x / 2
                || y <= -levelSize.y / 2 || y >= levelSize.y / 2) {
                drawTile(vec2(x,y), vec2(6), bgTile.frame(2));
            }
        }
    }

}