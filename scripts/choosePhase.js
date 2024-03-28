// Importa as dependências necessárias
import { gameState } from "./main.js"; // Importa o objeto gameState que contém informações globais do jogo
import { scaleElement } from "./functions.js"; // Importa uma função para aumentar o tamanho de elementos na tela

export default class ChoosePhase extends Phaser.Scene {
  constructor() {
    super({ key: "ChoosePhase" });
  }

  preload() {
    this.load.image("phases", "../assets/game//choosePhase/phaseSelect.png");
    this.load.image("print1", "../assets/game//choosePhase/fase1.png");
    this.load.image("print2", "../assets/game//choosePhase/fase2.png");
    this.load.image("print3", "../assets/game//choosePhase/fase3.png");
    this.load.image("legenda1", "../assets/game//choosePhase/legenda1.png");
    this.load.image("legenda2", "../assets/game//choosePhase/legenda2.png");
    this.load.image("legenda3", "../assets/game//choosePhase/legenda3.png");
  }

  create() {
    this.musicOne = this.sound.add("music1", {
      volume: 0.3,
      loop: true,
    });

    this.botton = this.sound.add("botton", {
      volume: 0.3,
      loop: false,
    });

    this.add.image(gameState.width / 2, gameState.height / 2, "phases");
    this.phase1 = this.add.image(495, 175, "print1").setScale(0.7);

    scaleElement("over", this.phase1, .72);
    scaleElement("out", this.phase1, .7);

    this.phase2 = this.add
      .image(495, 310, "print2")
      .setScale(0.7)
      .setTint("0x858585") // Define uma cor de tonalidade cinza para o botão
      .setInteractive({ cursor: "pointer" });

    this.phase3 = this.add
      .image(495, 440, "print3")
      .setScale(0.7)
      .setTint("0x858585") // Define uma cor de tonalidade cinza para o botão
      .setInteractive({ cursor: "pointer" });

    this.legenda = this.add.image(495, 120, "legenda1").setScale(0.7);
    this.legenda = this.add.image(495, 255, "legenda2").setScale(0.7);
    this.legenda = this.add.image(495, 390, "legenda3").setScale(0.7);

    this.phase1.setScale(0.7).setInteractive({ cursor: "pointer" });

    this.phase1.on("pointerdown", () => {
      this.sound.stopByKey("theme");
      this.botton.play();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(
        // delay para cena iniciar só depois do efeito fade
        500, // tempo de delay
        () => {
          gameState.isGameInit = true; // Define que o jogo está inicializado
          this.scene.start("Phase1");
          gameState.phase = 1; // Define que a fase atual é a 1
          this.musicOne.play();
        },
        [],
        this
      );
    });
  }

  update() {}
}
