import { gameState } from "./main.js";
import {
  scaleElement,
} from "./functions.js";

export default class Trivia extends Phaser.Scene {
  constructor() {
    super({ key: "Trivia" });
    this.trivia = [];
    this.trivias = [
      {
        key: "trivia1",
        sprite: "../assets/game/phase1/trivias/bonfire/triviaFogueira.png",
        frameWidth: 400,
        frameHeight: 280,
        animationKey: "trivia1Animation",
        end: 1,
        answer1: "../assets/game/phase1/trivias/bonfire/option1.png",
        answer2: "../assets/game/phase1/trivias/bonfire/option2.png",
        text: "../assets/game/phase1/trivias/bonfire/text.png",
        lesson: "../assets/game/phase1/trivias/bonfire/lesson.png",
      },
      {
        key: "trivia2",
        sprite:
          "../assets/game/phase1/trivias/pressurePan/triviaPanelaDePressao.png",
        frameWidth: 400,
        frameHeight: 280,
        animationKey: "trivia2Animation",
        end: 1,
        answer1: "../assets/game/phase1/trivias/pressurePan/option1.png",
        answer2: "../assets/game/phase1/trivias/pressurePan/option2.png",
        text: "../assets/game/phase1/trivias/pressurePan/text.png",
        lesson: "../assets/game/phase1/trivias/pressurePan/lesson.png",
      },
      {
        key: "trivia3",
        sprite: "../assets/game/phase1/trivias/grill/triviaChurrasqueira.png",
        frameWidth: 400,
        frameHeight: 280,
        animationKey: "trivia3Animation",
        end: 1,
        answer1: "../assets/game/phase1/trivias/grill/option1.png",
        answer2: "../assets/game/phase1/trivias/grill/option2.png",
        text: "../assets/game/phase1/trivias/grill/text.png",
        lesson: "../assets/game/phase1/trivias/grill/lesson.png",
      },
    ];
  }

  preload() {
    this.trivias.forEach((trivia) => {
      this.load.spritesheet(trivia.key, trivia.sprite, {
        frameWidth: trivia.frameWidth,
        frameHeight: trivia.frameHeight,
      });
      this.load.image("lesson_" + trivia.key, trivia.lesson);
      this.load.image("textTrivia_" + trivia.key, trivia.text);
      this.load.image("answer1_" + trivia.key, trivia.answer1);
      this.load.image("answer2_" + trivia.key, trivia.answer2);
    });

    this.load.image("clock", "../assets/game/phase1/clock.png");
  }

  create() {
    let darken = this.add.rectangle(0, 0, 2000, 540, 0x000000);
    darken.setAlpha(0.3);
    darken.setOrigin(0, 0);

    this.resposta = Math.random() < 0.5;
    this.clockImage = this.add.image(100, 280, "clock").setScale(0.05);
    if (this.resposta) {
      this.pos1 = 275;
      this.pos2 = 650;
    } else {
      this.pos1 = 650;
      this.pos2 = 275;
    }

    this.textObject = this.add.text(130, 260, "", {
      fontSize: "50px",
      fill: "#000",
      fontWeight: "bold",
    });

    // Create the trivia at the current index
    this.createTrivia(gameState.currentTriviaIndex);
  }

  createTrivia(index) {
    let trivia = this.trivias[index];

    let shouldCreateAnimation = true;

    Object.keys(this.anims.anims.entries).forEach((entryKey) => {
      if (trivia.animationKey == entryKey) {
        shouldCreateAnimation = false;
      }
    });

    const triviaText = this.add
      .image(115, 40, "textTrivia_" + trivia.key)
      .setOrigin(0)
      .setScale(1)
      .setDepth(1);

    const questao1 = this.add
      .image(this.pos1, 475, "answer1_" + trivia.key)
      .setScale(1)
      .setInteractive()
      .on("pointerdown", () => {
        gameState.triviaResult = true;
        gameState.triviaAnswered = true;
        questao1.setTint(0x00ff00); // Set the tint to green
      });

    const questao2 = this.add
      .image(this.pos2, 475, "answer2_" + trivia.key)
      .setScale(1)
      .setInteractive()
      .on("pointerdown", () => {
        gameState.triviaResult = false;
        gameState.triviaAnswered = true;
        questao2.setTint(0xff0000); // Set the tint to red
      });

    if (shouldCreateAnimation) {
      this.anims.create({
        key: trivia.animationKey,
        frames: this.anims.generateFrameNumbers(trivia.key, {
          start: 0,
          end: trivia.end,
        }),
        frameRate: 5,
        repeat: -1,
      });
    }

    const triviaImage = this.add
      .sprite(0, 0, trivia.key)
      .setOrigin(0.5, 0.45)
      .setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

    triviaImage.anims.play(trivia.animationKey);

    this.trivia.push(triviaImage);

    scaleElement("over", questao1, 1.1);
    scaleElement("out", questao1, 1);

    scaleElement("over", questao2, 1.1);
    scaleElement("out", questao2, 1);

    // Start the countdown as soon as the trivia is created
    this.startCountdown();
  }
  startCountdown() {
    console.log("Starting countdown...");

    let timeLeft = 30;

    // Set the initial text of the timer
    this.textObject.setText(timeLeft);

    // Update the text every second
    let timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--;
        this.textObject.setText(timeLeft);

        if (timeLeft <= 0) {
          timerEvent.remove();
          // Handle what happens when the time runs out
          this.scene.stop("Trivia");
          this.scene.start("Phase1");
        }
      },
      loop: true,
    });
  }
  update() {
    if (gameState.triviaAnswered) {
      this.nextTrivia();

      // Stop the scene
      this.scene.stop("Trivia");
    }
    console.log(this.resposta);
  }

  nextTrivia() {
    // Hide the current trivia image
    this.trivia[0].setVisible(false);

    // Remove the current trivia from the array
    this.trivia.shift();

    // Increment the currentTriviaIndex and wrap it around to the start of the array if it reaches the end
    gameState.currentTriviaIndex =
      (gameState.currentTriviaIndex + 1) % this.trivias.length;

    console.log("Current trivia index:", gameState.currentTriviaIndex);
  }
}
