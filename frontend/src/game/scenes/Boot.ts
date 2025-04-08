import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        //this.load.image('background', 'assets/main-bg.png');

        this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        this.load.image('background', 'assets/background.png');
        this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        this.load.image('header1', 'assets/Header1.png');
        this.load.image('header2', 'assets/Header2.png');
        this.load.image('Behind', 'assets/Behind 1.png');
        this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        this.load.image('Menu2', 'assets/Menu2.png');
        this.load.image('Menu1', 'assets/Menu1.png');
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
        this.load.image('header-button', 'Header2.png');

    }

    create() {
        this.scene.start('Preloader');
    }
}
