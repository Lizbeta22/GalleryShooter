class ArrayBoom extends Phaser.Scene {
    constructor() {
        super("arrayBoom");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 10;           // Don't create more than this many bullets
        
        this.myScore = 0;       // record a score as a class variable

        //player Health
        this.playHealth = 100;

        //enemy bullet 
        this.my.sprite.enemyBullet = [];
        this.maxEnemyBullets = 5;
        this.enemyBulletSpeed = 200;
        this.enemyFireRate = 1500;
        this.lastEnemyFire = 0;

        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("bunnyStand", "bunny1_stand.png");

        //background
        this.load.image("background", "bg_layer4.png")

        //enemies
        this.load.image("cloud", "cloud.png");
        this.load.image("flyMan", "flyMan_jump.png");
        this.load.image("spikeBall", "spikeBall1.png");
        this.load.image("springMan","springMan_stand.png");
        this.load.image("wingMan", "wingMan1.png");

        //objects
        this.load.image("carrot", "carrots.png");
        this.load.image("lightning", "lighting_blue.png");

        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        // TODO: load sound assets here
        this.load.audio("jingles_HIT15", "jingles_HIT15.ogg");

        this.load.audio("backGround", "backgroundMusic.mp3");
    }

    create() {
        let my = this.my;

        this.add.image(this.scale.width/2, this.scale.height / 2, "background").setDisplaySize(this.scale.width, this.scale.heig);

        my.sprite.bunnyStand = this.add.sprite(game.config.width/2, game.config.height - 40, "bunnyStand");
        my.sprite.bunnyStand.setScale(0.5);

        my.sprite.wingMan = this.add.sprite(game.config.width/2, 80, "wingMan");
        my.sprite.wingMan.setScale(0.5);
        my.sprite.wingMan.scorePoints = 25;
        this.wingManDir = 1;
        my.sprite.wingMan.speed = 590;

        my.sprite.lightning = this.add.sprite(game.config.width / 2, game.config.height - 40, "lightning");
        my.sprite.lightning.setScale(0.4);
        my.sprite.lightning.loseHealth = 10;
        my.sprite.lightning.visible = false;

        //enemies!!
        my.sprite.flyMan = this.add.sprite(200, 80, "flyMan").setScale(0.5);
        my.sprite.flyMan.scorePoints = 15;
        my.sprite.flyMan.speed = 520;
        my.sprite.flyMan.speedY = 100;

        my.sprite.spikeBall = this.add.sprite(600, 80, "spikeBall").setScale(0.5);
        my.sprite.spikeBall.scorePoints = 10;
        my.sprite.spikeBall.speed = 560;

        my.sprite.springMan = this.add.sprite(400, 150, "springMan").setScale(0.5);
        my.sprite.springMan.scorePoints = 20;
        my.sprite.springMan.speed = 475;

        my.sprite.cloud = this.add.sprite(400, 60, "cloud").setScale(0.5);
        my.sprite.cloud.scorePoints = 30; 
        my.sprite.cloud.x = 400;
        my.sprite.cloud.speed = 150;
        
        
        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });


        // TODO: create sound object(s) here
        this.mySound = this.sound.add("jingles_HIT15", {volume: 0.5, loop: false});


        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 300;
        this.bulletSpeed = 300;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Array Boom.js</h2><br>A: left // D: right // Space: fire/emit';

        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);
        my.text.health = this.add.bitmapText(550, 20, "rocketSquare", "Health " + this.playHealth);

        my.text.wave = this.add.bitmapText(10, 40, "rocketSquare", "Wave 1");

        my.text.gameOver = this.add.text(game.config.width / 2, game.config.height / 2, "GAME OVER\nPress R to restart", {fontFamily: 'Times, serif', fontSize: 48, color: '#640808', align: 'center'}).setOrigin(0.5).setVisible(false);
        this.rKey = this.input.keyboard.addKey("R");


        // Put title on screen
        this.add.text(10, 5, "Bunny Attack!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });

        //enemies
        this.enemies = [
            my.sprite.wingMan,
            my.sprite.flyMan,
            my.sprite.spikeBall,
            my.sprite.springMan,
            my.sprite.cloud
        ];

        // TODO: create background music object
        // TODO: start playing background music
        this.backSound = this.sound.add("backGround", {volume: 0.2, loop: true});
        this.backSound.play()


        this.init_game();
    }

    update(time, delta) {
        let my = this.my;
        let dt = delta / 1000;

        //GAME OVER!!!

        if(this.gameOver){
            if(Phaser.Input.Keyboard.JustDown(this.rKey)){
                this.my.text.gameOver.setVisible(false);
                this.backSound.play();
                this.init_game();
            }
            return;
        }

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.bunnyStand.x > (my.sprite.bunnyStand.displayWidth/2)) {
                my.sprite.bunnyStand.x -= this.playerSpeed * dt;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.bunnyStand.x < (game.config.width - (my.sprite.bunnyStand.displayWidth/2))) {
                my.sprite.bunnyStand.x += this.playerSpeed * dt;
            }
        }

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.bunnyStand.x, my.sprite.bunnyStand.y-(my.sprite.bunnyStand.displayHeight/2), "carrot")
                );
            }
        }

        //enemy movement
        for (let enemy of this.enemies) {
            if (!enemy.visible) continue;
            enemy.x += enemy.speed * dt;
            if (enemy.x > game.config.width - 60 || enemy.x < 60) {
                enemy.speed *= -1;
            }
        }

        if(my.sprite.flyMan.visible){
            my.sprite.flyMan.y += my.sprite.flyMan.speedY *dt;
            if(my.sprite.flyMan.y > this.scale.height + 20){
                my.sprite.flyMan.y = 0;
                my.sprite.flyMan.x = Math.random() * (this.scale.width - 80) + 40;
            }
        }

        // Remove all of the bullets which are offscreen
        // filter() goes through all of the elements of the array, and
        // only returns those which **pass** the provided test (conditional)
        // In this case, the condition is, is the y value of the bullet
        // greater than zero minus half the display height of the bullet? 
        // (i.e., is the bullet fully offscreen to the top?)
        // We store the array returned from filter() back into the bullet
        // array, overwriting it. 
        // This does have the impact of re-creating the bullet array on every 
        // update() call. 
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Check for collision with the wingMan
        for (let bullet of my.sprite.bullet) {
            for (let enemy of this.enemies){
                if (enemy.visible && this.collides(enemy, bullet)) {
                    // clear out bullet -- put y offscreen, will get reaped next update
                    bullet.y = -100;
                    enemy.visible = false;
                    enemy.x = -100;
                    // Update score
                    this.myScore += enemy.scorePoints;
                    this.updateScore();
                    // TODO: Play collision sound
                    this.mySound.play();
                    
                }
            }
        }

        let allDefeated = this.enemies.every(enemy => !enemy.visible);
        if(allDefeated){
            this.waveStarted = false;
            this.wave ++;

            //check if wave amount has reached 10
            if(this.wave > 10){
                this.backSound.stop();
                this.scene.start("winScene", {score: this.myScore});
                return;
            }

            my.text.wave.setText("Wave " + this.wave);
            this.startNextWave();
        }

        
    
        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed * dt;
        }

        //enemy bullets attacking
        if (time - this.lastEnemyFire > this.enemyFireRate && my.sprite.cloud.visible){
            if(my.sprite.enemyBullet.length < this.maxEnemyBullets){
                if (this.wave <= 2) {
                    // Single straight shot
                    let bolt = this.add.sprite(my.sprite.cloud.x, my.sprite.cloud.y + 20, "lightning");
                    bolt.speedX = 0;
                    my.sprite.enemyBullet.push(bolt);
                } else if (this.wave >= 3){
                    let offsets = [-40, 0, 40];
                    for(let offset of offsets){
                        let bolt = this.add.sprite(my.sprite.cloud.x + offset, my.sprite.cloud.y + 20, "lightning");
                        bolt.speedX = offset * 1.5;
                        my.sprite.enemyBullet.push(bolt);
                    }
                }else{
                    let offsets = [-80, -40, 0, 40, 80];
                    for (let offset of offsets) {
                        let bolt = this.add.sprite(my.sprite.cloud.x + offset, my.sprite.cloud.y + 20, "lightning");
                        bolt.speedX = offset * 2;
                        my.sprite.enemyBullet.push(bolt);
                    }
                }
                this.lastEnemyFire = time;
            }
        }
        for (let bullet of my.sprite.enemyBullet){
            bullet.y += this.enemyBulletSpeed *dt;
            bullet.x += bullet.speedX * dt;
        }

        my.sprite.enemyBullet = my.sprite.enemyBullet.filter((bullet)=> {
            if(bullet.y > game.config.height + bullet.displayHeight / 2){
                bullet.destroy();
                return false;
            }
            return true;
        });

        for(let bullet of my.sprite.enemyBullet){
            if(this.collides(my.sprite.bunnyStand, bullet)){
                bullet.destroy();
                my.sprite.enemyBullet = my.sprite.enemyBullet.filter(b => b !== bullet);
                this.playHealth -= 10;
                this.updateHealth();
                console.log("Damaged!");
            }
        }

    

    //flyman collision
    if (my.sprite.flyMan.visible && this.collides(my.sprite.flyMan, my.sprite.bunnyStand)){
        my.sprite.flyMan.visible = false;
        my.sprite.flyMan.x = -100;
        this.playHealth -= 15;
        this.updateHealth();
        this.time.delayedCall(1000, () => {
            my.sprite.flyMan.visible = true;
            my.sprite.flyMan.x = Math.random() * (this.scale.width - 80) + 40;
            my.sprite.flyMan.y = 0;
        });
    }
}

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    updateHealth() {
        let my = this.my;
        my.text.health.setText("Health " + this.playHealth);

        if(this.playHealth <= 0){
            this.backSound.stop();
            this.scene.start("gameOver", {score: this.myScore});
        }
    }
    startNextWave() {
        let my = this.my;

        for(let bullet of my.sprite.bullet){bullet.destroy();}

        for (let bullet of my.sprite.enemyBullet){
            bullet.destroy();
        }
        my.sprite.enemyBullet = [];
        let speedMultiplier = 1 + (this.wave * 0.2); // gets faster each wave
        my.sprite.wingMan.x = 100;  my.sprite.wingMan.y = 80;  
        my.sprite.wingMan.visible = true;  
        my.sprite.wingMan.speed = 590 * speedMultiplier;

        my.sprite.flyMan.x = 300;   
        my.sprite.flyMan.y = 130;  
        my.sprite.flyMan.visible = true;   
        my.sprite.flyMan.speed = 520 * speedMultiplier;  

        my.sprite.spikeBall.x = 500; 
        my.sprite.spikeBall.y = 80; 
        my.sprite.spikeBall.visible = true; 
        my.sprite.spikeBall.speed = 560 * speedMultiplier;

        my.sprite.springMan.x = 200; 
        my.sprite.springMan.y = 160; 
        my.sprite.springMan.visible = true; 
        my.sprite.springMan.speed = 475 * speedMultiplier;

        my.sprite.cloud.x = 600;    
        my.sprite.cloud.y = 60;    
        my.sprite.cloud.visible = true;    
        my.sprite.cloud.speed = 550 * speedMultiplier;

        // Also make enemy fire rate faster each wave
        this.enemyFireRate = Math.max(500, 1500 - (this.wave * 150));
        this.waveStarted = true;
    }

    init_game(){
        let my = this.my;
        this.waveStarted = false;
        this.wave = 1;
        this.waveStarted = true;

        this.myScore = 0;
        this.playHealth = 100;

        this.lastEnemyFire = 0;

        for (let bullet of my.sprite.bullet){
            bullet.destroy();
        }
        for(let bullet of my.sprite.enemyBullet){
            bullet.destroy();
        }
        my.sprite.bullet = [];
        my.sprite.enemyBullet = [];

        my.sprite.bunnyStand.x = game.config.width / 2;
        my.sprite.bunnyStand.y = game.config.height - 40;

        my.sprite.wingMan.x = 100;   my.sprite.wingMan.y = 80;   my.sprite.wingMan.visible = true;  my.sprite.wingMan.speed = 590;
        my.sprite.flyMan.x = 300;    my.sprite.flyMan.y = 130;   my.sprite.flyMan.visible = true;   my.sprite.flyMan.speed = 520;
        my.sprite.spikeBall.x = 500; my.sprite.spikeBall.y = 80; my.sprite.spikeBall.visible = true; my.sprite.spikeBall.speed = 560;
        my.sprite.springMan.x = 200; my.sprite.springMan.y = 160; my.sprite.springMan.visible = true; my.sprite.springMan.speed = 475;
        my.sprite.cloud.x = 600;     my.sprite.cloud.y = 60;     my.sprite.cloud.visible = true;    my.sprite.cloud.speed = 150;

        this.updateScore();
        this.updateHealth();

        this.gameOver = false;
    
    }
}

         
