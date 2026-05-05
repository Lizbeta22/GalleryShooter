class WinScene extends Phaser.Scene{
    constructor(){
        super("winScene");
    }

    init(data){
        this.finalScore = data.score;
    }

    create(){
        this.add.text(this.scale.width/2, this.scale.height/2 - 60,"!!YOU WIN!!",{ fontFamily: 'Times, serif', fontSize: 64, color: '#1b8f3c' }).setOrigin(0.5);
        this.add.text(this.scale.width/2, this.scale.height/2,"Score: " + this.finalScore,{ fontFamily: 'Times, serif', fontSize: 32, color: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.scale.width/2, this.scale.height/2 + 60,"Press R to play again",{ fontFamily: 'Times, serif', fontSize: 24, color: '#ffffff' }).setOrigin(0.5);
        
        this.input.keyboard.addKey("R").on("down", () => {
            this.scene.start("arrayBoom");
        });
    }
}