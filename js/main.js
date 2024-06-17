var exit;
var physics
var player;
var started;

var facingRight;
var attacking;
var atkType;
var holding;

var cursor;
var GrowKey;
var ShrinkKey;
var HoldKey;

var botlayer;
var toplayer;


var crates;
var powersG;
var powersS;

class LevelX extends Phaser.Scene{
    preload(){
        if(!started){
            this.load.image('crate', "assets/crate.png")
            this.load.image('world_tileset', "assets/world_tileset.png")
            this.load.image('power', "assets/power.png")
            this.load.image('exit', "assets/exit.png")
            this.load.spritesheet('mage',
                'assets/mage.png',
                { frameWidth: 18, frameHeight: 24 }
            );
            this.load.spritesheet('mageatk',
                'assets/mage-atk.png',
                { frameWidth: 24, frameHeight: 24 }
            );
        }
        
    }

    create(){
        if(!started){
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('mage', {start: 0, end: 3}),
                frameRate: 5,
                repeat:-1
            })
        
            this.anims.create({
                key: 'jump',
                frames: [{key:'mage', frame:4}],
                frameRate: 10
            })
        
            this.anims.create({
                key: 'hold',
                frames: [{key:'mage', frame:5}],
                frameRate: 10
            })
        
            
            this.anims.create({
                key: 'atk',
                frames: this.anims.generateFrameNumbers('mageatk', {start: 3, end: 0}),
                frameRate: 15
            })
        
            
            this.anims.create({
                key: 'atk-end',
                frames: this.anims.generateFrameNumbers('mageatk', {start: 0, end: 3}),
                frameRate: 15
            })
            started = true;    
        }

        physics = this.physics;
        player = physics.add.sprite(20,20,"mage");
        player.setCollideWorldBounds(true);
        facingRight = true

        
    
    
        cursor = this.input.keyboard.createCursorKeys()
        GrowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        ShrinkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        HoldKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    
        crates = physics.add.group({
            key: 'crate',
            repeat: 0,
            setXY: { x: 100, y: 100, stepX: 70 },
        });
    
    
        powersG = physics.add.group({
            defaultKey: 'power',
            maxSize: 5,
            runChildUpdate: true
        });
    
        powersS = physics.add.group({
            defaultKey: 'power',
            maxSize: 5,
            runChildUpdate: true
        });
    
        attacking = false
    
        player.on('animationcomplete', function(animation, frame) {
            // Check if the completed animation is 'atk'
            if (animation.key === 'atk') {
                player.anims.play('atk-end', true)
                if(atkType == 'G'){
                    usePowerG();
                } else {
                    usePowerS()
                }
            }else if(animation.key === 'atk-end'){
                attacking = false
            }
        });
    
    
    
        physics.add.collider(crates, crates);
        physics.add.collider(player, crates);
        physics.add.collider(player, toplayer);
        physics.add.collider(crates, toplayer);
        toplayer.setCollisionBetween(1,18)
        this.time.addEvent({
            delay:1,
            loop:true,
            callback:handleCrateMoviment
        })
        
        physics.add.collider(exit, toplayer);
        physics.add.collider(exit, player, this.nextLevel);
        exit.body.immovable = true
    
    }


    update(){
        player.setVelocityX(0)
    
        physics.overlap(powersG,crates, grow, null , this);
        physics.overlap(powersS,crates, shrink, null , this);
    
        if(!attacking){
            
            if(HoldKey.isDown){
                holding = true
                player.anims.play('hold', true)
            } else {
                holding = false
            }
            if(!holding){
                if(!player.body.blocked.down){
                    player.anims.play('jump', true)
                } else {
                    player.anims.play('idle', true)
                }
            }

            if(cursor.left.isDown){
                player.setVelocityX(-100)
                if(!holding){   
                    player.flipX = true
                    facingRight = false
                }
            }
            else if(cursor.right.isDown){
                player.setVelocityX(100)
                if(!holding){
                    player.flipX = false
                    facingRight = true
                }
            }
            if(cursor.up.isDown && player.body.blocked.down) {
                player.setVelocityY(-100)      
            }

            if((Phaser.Input.Keyboard.JustDown(GrowKey) || Phaser.Input.Keyboard.JustDown(ShrinkKey)) && player.body.blocked.down){
                attacking = true
                if(GrowKey.isDown){
                    atkType = 'G'
                }else {
                    atkType = 'S' 
                }
    
    
                player.anims.play('atk', true)
                player.setVelocityX(0)
            }
        }    
        
        Phaser.Actions.Call(powersG.getChildren(),function(power){
            if(power.active && (power.x > game.config.width || power.x < 0)){
                power.destroy();
            }
        }, this)
        
        Phaser.Actions.Call(powersS.getChildren(),function(power){
            if(power.active && (power.x > game.config.width || power.x < 0)){
                power.destroy();
            }
        }, this)
    
    }

}

function usePowerG(){
    var power = powersG.get();
    if (power){
        power.body.setAllowGravity(false);
        power.setActive(true)
        power.setVisible(true)
        if(facingRight){
            direction = 1
        }else{
            direction = -1
        }
        power.setPosition(player.x + 10 * direction,player.y)
        power.setVelocityX(35*direction) 
      
    }
}

function usePowerS(){
    var power = powersS.get();
    if (power){
        power.body.setAllowGravity(false);
        power.setActive(true)
        power.setVisible(true)
        var dis;
        if(facingRight){
            direction = 1
        }else{
                direction = -1
        }
        power.setPosition(player.x + 10 * direction,player.y)
        power.setVelocityX(35*direction) 
      
    }
}


function grow(power, crate){
    power.destroy();
    if(crate.scale < 2){
        crate.setScale(crate.scale * 2)
    }
}


function shrink(power, crate){
    power.destroy();
    if(crate.scale > 0.5){
        crate.setScale(crate.scale / 2)
    }
}



function handleCrateMoviment() {
    Phaser.Actions.Call(crates.getChildren(),function(crate){
        crate.setVelocityX(0)
        if (holding) {
            crate.body.immovable = false;
            if ((!facingRight && player.x > crate.x && player.x - crate.x < 25 ) || 
                (facingRight && player.x < crate.x && crate.x - player.x < 25) && Math.abs(player.y - crate.y) < 10) {
                if(crate.scale <= 1){
                    if(cursor.left.isDown){
                        crate.setVelocityX(-100)
                    }
                    else if(cursor.right.isDown){
                        crate.setVelocityX(100)
                    }   
                    if(cursor.up.isDown && player.body.blocked.down) {
                        crate.setVelocityY(-100)      
                    }
                    } else {
                        crate.setVelocityX(0);
                    }
                } else {
                    crate.body.immovable = true;
                }
        } else {
            crate.body.immovable = true;
        }    
    }, this)    
}



class Level1 extends LevelX{
    constructor() {
        super("Level1")
    }

    preload(){
        super.preload()
        this.load.tilemapTiledJSON('map1', "assets/mapas/mapa1.tmj")
    }
    create(){
        try {
            console.log('Adding tilemap...');
            const mappy = this.make.tilemap({key:'map1', tileWidth: 16, tileHeight: 16});
            console.log('Tilemap loaded:', mappy);
    
            console.log('Adding tileset image...');
            const terrain = mappy.addTilesetImage("world_tileset");
            console.log('Tileset loaded:', terrain);
    
            console.log('Creating background layer...');
            botlayer = mappy.createLayer("bottonlayer", terrain, 0, 0).setDepth(-2);
    
            console.log('Creating floor layer...');
            toplayer = mappy.createLayer("toplayer", terrain, 0, 0).setDepth(-1);
        } catch (error) {
            console.error('Error loading tilemap:', error);
        }
        exit = this.physics.add.sprite(448,176,"exit");
        super.create();
    }
    nextLevel(){
        game.scene.start("Level2")
    }
    
}

class Level2 extends LevelX{

    constructor() {
        super("Level2")
    }

    preload(){
        super.preload()
        this.load.tilemapTiledJSON('map2', "assets/mapas/mapa2.tmj")

    }
    create(){
        try {
            console.log('Adding tilemap...');
            const mappy = this.make.tilemap({key:'map2', tileWidth: 16, tileHeight: 16});
            console.log('Tilemap loaded:', mappy);
    
            console.log('Adding tileset image...');
            const terrain = mappy.addTilesetImage("world_tileset");
            console.log('Tileset loaded:', terrain);
    
            console.log('Creating background layer...');
            botlayer = mappy.createLayer("bottonlayer", terrain, 0, 0).setDepth(-2);
    
            console.log('Creating floor layer...');
            toplayer = mappy.createLayer("toplayer", terrain, 0, 0).setDepth(-1);
        } catch (error) {
            console.error('Error loading tilemap:', error);
        }
    
        exit = physics.add.sprite(448,160,"exit");
        super.create();
    }
    nextLevel(){
        this.physics.pause();
    }

}
const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 320,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 250 }
        }
    },
    scene: [
      Level1,
      Level2
    ]
};

const game = new Phaser.Game(config);

game.scene.start("Level1");
