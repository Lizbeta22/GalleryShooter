class GameOver extends Phaser.Scene{
    constructor(){
        super("gameOver");
    }

    init(data){
        this.finalScore = data.score;
    }

    create(){
        this.add.text(this.scale.width/2, this.scale.height/2 - 60, "!!GAME OVER!!", { fontFamily: 'Times, serif', fontSize: 64, color: '#ff0000' }).setOrigin(0.5);
        this.add.text(this.scale.width/2, this.scale.height/2,"Score: " + this.finalScore, { fontFamily: 'Times, serif', fontSize: 32, color: '#ffffff' }).setOrigin(0.5);

        this.add.text(this.scale.width/2, this.scale.height/2 + 60,"Press R to play again", { fontFamily: 'Times, serif', fontSize: 24, color: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.addKey("R").on("down", () => {
            this.scene.start("arrayBoom");
        });
    }
}