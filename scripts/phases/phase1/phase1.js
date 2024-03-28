// Importa o estado do jogo do arquivo "main.js
import { gameState } from "../../main.js";
import Trivia from "../../trivia.js";


// Importando funções de controle para serem utilizadas do arquivo "functions.js"
import {
  endGame,
  winGame,
  pauseGame,
  soundGame,
  restartGame,
  scaleElement,
} from "../../functions.js";

//Importa jogadores do jogo do arquivo "player.js"
import Player from "../../player.js";

// Adiciona Phaser.scene para criação da classe Phase1 que representa a cena do jogo
export default class Phase1 extends Phaser.Scene {
  // Chama o construtor da classe pai (Phaser.Scene) e passa um objeto de configuração com a chave "Phase1" para identificar esta cena
  constructor() {
    super({ key: "Phase1" }); // Criação de uma chave

    // Declaração de variáveis para elementos visuais e de jogo
    // Elementos visuais:
    this.grass;
    this.state;

    // Receberá a instância de Player
    this.player;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.winGameTxt1;
    this.winGameTxt2;
    this.nextPhaseBtn;
    this.setaCima;
    this.setaBaixo;
  

    // valor para fazer uma transição suave da câmera:
    this.transitionValue = 0;

    //Velocidade do personagem
    gameState.playerVelocityX

    this.lastCheckpoint = 0; // Último marco de posição para a lógica de acréscimo de velocidade

    // Bestiário:
    this.pressurePans;
    this.bonfires;
    this.grills;

    // Variável de controle para saber se o personagem está tocando o chão
    this.isTouchingFloor = false;

    // Controle para saber se a partida está acontecendo
    this.gameIsRunning = true;
  }

  // Carrega todas as imagens, sprites e áudios que farão parte da cena no jogo
  preload() {
    // Garantindo que, após reiniciar o jogo, a cena de UI existirá e será reiniciada (pois é destruída quando se ganha)
    const triviaScene = this.scene.get("Trivia");
    triviaScene.events.once(
      "destroy",
      () => this.scene.add("Trivia", Trivia, false),
      this
    );

    this.load.audio("theme", "../assets/game/phase1/theme.mp3"); // Carrega a música

    this.load.image("pular", "../assets/game/phase1/pular.png");
    this.load.image("abaixar", "../assets/game/phase1/abaixar.png");
    this.load.image("evite", "../assets/game/phase1/evite.png");
    this.load.image("tutorial", "../assets/game/phase1/tutorial.png");
    this.load.image("fimTutorial", "../assets/game/phase1/fimTutorial.png");
    this.load.image("comandos", "../assets/game/phase1/comandos.png");
    this.load.image("panTutorial", "../assets/game/phase1/pan.png");

    this.load.spritesheet("setaCima", "../assets/game/phase1/setaCima.png", {
      frameWidth: 480,
      frameHeight: 540,
    });

    this.load.spritesheet("setaBaixo", "../assets/game/phase1/setaBaixo.png", {
      frameWidth: 480,
      frameHeight: 540,
    });

    this.load.spritesheet("bonfire", "../assets/game/phase1/bonfire.png", {
      frameWidth: 32,
      frameHeight: 28,
    }); //Carrega a spritesheet da fogueira

    this.load.spritesheet(
      "pressurePan",
      "../assets/game/phase1/pressurePan.png",
      {
        frameWidth: 80,
        frameHeight: 63.8,
      }
    ); //Carrega a spritesheet da panela de pressão

    this.load.spritesheet("grill", "../assets/game/phase1/grill.png", {
      frameWidth: 80,
      frameHeight: 109,
    }); //Carrega a spritesheet da churrasqueira

    this.load.spritesheet(
      "bonfireTutorial",
      "../assets/game/phase1/bonfireTutorial.png",
      {
        frameWidth: 32,
        frameHeight: 80,
      }
    ); //Carrega a spritesheet da fogueira

    this.load.tilemapTiledJSON("map", "../../assets/game/phase1/map/map.json"); // json com informações sobre a construção do mapa

    this.load.image(
      "grassTileset",
      "../../assets/game/phase1/map/grassTileset.png"
    ); // imagem para construir o mapa do jogo

    this.load.image(
      "fenceTileset",
      "../../assets/game/phase1/map/fenceTileset.png"
    ); // imagem para construir o mapa do jogo

    this.load.image(
      "skyTileset",
      "../../assets/game/phase1/map/skyTileset.png"
    ); // imagem para construir o mapa do jogo

    this.load.image(
      "treeTileset",
      "../../assets/game/phase1/map/treeTileset.png"
    ); // imagem para construir o mapa do jogo

    this.load.image(
      "cloudTileset",
      "../../assets/game/phase1/map/cloudTileset.png"
    ); // imagem para construir o mapa do jogo
  }

  // Adiciona na tela do jogo elementos que foram carregados no preload
  create() {
    this.tweenAdded = false;

    this.cameras.main.fadeIn(500, 0, 0, 0); // Faz a transição de fade-in da câmera com duração de 1000 milissegundos
    this.cameras.main.setBounds(
      // Define os limites da câmera
      0, // Limite esquerdo
      0, // Limite superior
      49984, // Limite horizontal   !!! O celsinho vai chegar no final do chão e vai cair, precica adicionar outo chão e ir trabalhando as dimensões !!!
      gameState.height // limite vertical
    );

    // Adiciona elementos visuais em forma de mosaico para compor o cenário
    const map = this.make.tilemap({ key: "map" }); // cria mapa
    const grassTileset = map.addTilesetImage("grass", "grassTileset"); // associa a imagem da grama com o json
    const skyTileset = map.addTilesetImage("sky", "skyTileset");
    const fenceTileset = map.addTilesetImage("fence", "fenceTileset");
    const treeTileset = map.addTilesetImage("tree", "treeTileset");
    const hiddenTreeTileset = map.addTilesetImage("tree", "treeTileset");
    const cloudTileset = map.addTilesetImage("cloud", "cloudTileset");
    map.createLayer("sky", skyTileset);
    map.createLayer("tree", treeTileset);
    map.createLayer("hiddenTrees", hiddenTreeTileset);
    map.createLayer("fence", fenceTileset);
    map.createLayer("cloud", cloudTileset);
    this.grass = map.createLayer("grass", grassTileset); // cria uma camada no mapa para grama
    this.grass.setCollisionByProperty({ collider: true }); // adiciona colisão onde houver a propriedade collider = verdadeiro

    this.bonfireTutorial = this.add
      .sprite(3000, 310, "bonfireTutorial")
      .setScale(3.5); // Adiciona a fogueira
    this.evite = this.add.image(2100, 180, "evite").setScale(1); // Adiciona a fogueira
    this.tutorial = this.add.image(700, 180, "tutorial").setScale(1); // Adiciona a fogueira
    this.fimTutorial = this.add.image(5250, 180, "fimTutorial").setScale(1); // Adiciona a fogueira

    this.homeBtn = this.add // Adiciona um botão de home
      .image(gameState.width / 2 + 100, gameState.height / 2, "homeBtn")
      .setScale(1.35)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.pauseBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 60, 60, "pauseBtn")
      .setScale(1)
      .setVisible(true)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.soundBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 150, 60, "soundBtn")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.nextPhaseBtn = this.add // Adiciona um botão de próxima fase
      .image(350, gameState.height / 2 + 140, "nextPhaseBtn")
      .setScale(1.35)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.winGameTxt1 = this.add // Adiciona um texto de vitória à cena do jogo
      .image(gameState.width / 2, gameState.height / 2 - 100, "winGameTxt1")
      .setScale(1.5)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    // Adiciona o segundo texto de vitória à cena do jogo
    this.winGameTxt2 = this.add
      .image(gameState.width / 2, gameState.height / 2 + 20, "winGameTxt2")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.setaBaixo = this.add
      .sprite(240, 270, "setaBaixo")
      .setScale(0.5)
      .setScrollFactor(0)
      .setDepth(1e8)
      .setAlpha(0.7)
      .setInteractive({ cursor: "pointer" });

    this.setaCima = this.add
      .sprite(719, 269, "setaCima")
      .setScale(0.5)
      .setScrollFactor(0)
      .setDepth(1e8)
      .setAlpha(0.7)
      .setInteractive({ cursor: "pointer" });

    // Set the initial frame
    this.setaBaixo.setFrame(1);
    this.setaCima.setFrame(1);

    this.player = new Player(this, 0, 300, gameState.player);
    this.player.addPlayerToScene(this); // Método da classe PLayer para adicionar o jogador à fase
    this.player.setVelocity(300); // Define a velocidade do jogador como 300
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do jogador
    this.physics.add.collider(
      // Adiciona uma colisão entre o jogador e o chão e chama uma função anônima para dizer que o jogador tocou o chão
      this.player,
      this.grass,
      () => {
        this.isTouchingFloor = true;
      },
      null,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o celsinho deslocada 400px para direita

    // Outside of any if statements or loops...
    this.setaCima.on("pointerdown", () => {
      console.log("setaCima");
      if (gameState.jumpButton === false) {
        gameState.jumpButton = true;
      }
    });

    this.setaBaixo.on("pointerdown", () => {
      console.log("setaBaixo pressed");
      gameState.downButton = true;
    });

    this.setaBaixo.on("pointerup", () => {
      console.log("setaBaixo released");
      gameState.downButton = false;
    });

    // Optional: Add a pointerout event listener to reset the state if the pointer moves out of the button area
    this.setaBaixo.on("pointerout", () => {
      console.log("pointer moved out of setaBaixo");
      gameState.downButton = false;
    });

    //Panela de pressão colisão
    this.pressurePans = this.physics.add.group();
    this.bonfires = this.physics.add.group();
    this.grills = this.physics.add.group();

    this.physics.add.collider(this.pressurePans, this.grass);
    this.physics.add.collider(this.bonfires, this.grass);
    this.physics.add.collider(this.grills, this.grass);

    

    if (!this.anims.exists("bonfireTutorial")) {
      // Animando a fogueira
      this.anims.create({
        key: "bonfireTutorial", // Chave única para identificar esta animação
        frames: this.anims.generateFrameNumbers("bonfireTutorial", {
          // Gera uma sequência de frames da sprite "bonfire"
          start: 0, // Frame inicial
          end: 3, // Frame final
        }),
        frameRate: 3, // Taxa de quadros por segundo
        repeat: -1, // Repetir indefinidamente
      });
    }

    this.bonfireTutorial.anims.play("bonfireTutorial", true); // Inicia a animação da fogueira

    // Iterates over the array with the bestiary and adds the call to a function in case the character overlaps any item of the bestiary
    [this.pressurePans, this.bonfires, this.grills].forEach((obstacle) => {
      // Itera sobre o array com o bestiário e adiciona o chamado a uma função no caso do personagem sobrepor algum item do bestiário
      this.physics.add.overlap(
        this.player,
        obstacle,
        (player, object) => {
          // Store the collided object
          if (!this.scene.isActive("Trivia")) {
            // Store the collided object
            gameState.collidedObject = object;

            // Create a semi-transparent black rectangle that covers the entire screen
            // Run the trivia scene
            this.scene.run("Trivia");
          }
          gameState.storedVelocity = player.body.velocity.x;
          //this.darken.setVisible(true);

          // Pause the player's movement
          player.setVelocityX(0);
          player.anims.play(gameState.player + "Idle", true);
        },

        null,
        this
      );
    });

    [
      { key: "bonfireFlaming", sprite: "bonfire", end: 3 },
      { key: "pressurePanExplode", sprite: "pressurePan", end: 8 },
      { key: "grillFlaming", sprite: "grill", end: 2 },
    ].forEach(({ key, sprite, end }) => {
      // Itera sobre o objeto acima e cria todas as animações do bestiário

      let shouldCreateAnimation = true; // Variável para controlar se vai criar a animação ou não

      Object.keys(this.anims.anims.entries).forEach((entryKey) => {
        // Itera sobre a lista de animações existentes
        if (key == entryKey) {
          // Testa se a animação a ser criada já exite
          shouldCreateAnimation = false; // Caso exista, a variável de controle é igualada a false
        }
      });

      if (shouldCreateAnimation) {
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers(sprite, {
            start: 0,
            end: end,
          }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    // Funções para adicionar o obestiário
    this.addPressurePans();
    this.addBonfires();
    this.addGrills();
    // Configurando sobreposição entre o jogador e o grupo de obstáculos

    // Define a ação a ser executada quando o botão de home é clicado
    this.homeBtn.on("pointerdown", () => {
      this.sound.stopByKey('music1');
      // Reinicia algumas variáveis de estado do jogo
      this.sound.add("botton").play();
      gameState.player = ""; // Limpa o nome do jogador, deixando-o em branco
      gameState.isGameInit = false; // Define que o jogo não está mais em execução, pois o jogador está retornando à tela inicial
      this.scene.start("StartScene");
      this.scene.stop("Trivia");
    });

    // Configura escalas para o botão de "Home" quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.homeBtn, 1.5);
    scaleElement("out", this.homeBtn, 1.35);

    // Configura evento de clique para o botão de próxima fase (nextPhaseBtn)
    this.nextPhaseBtn.on("pointerdown", () => {
      // Quando o botão de próxima fase é clicado, reinicia o jogo, encerra o jogo atual e inicia a cena da próxima fase
      restartGame(
        this,
        this.player,
        this.homeBtn,
        this.pauseBtn
      );
      endGame(this, this.player, this.homeBtn, this.pauseBtn);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(
        // delay para cena iniciar só depois do efeito fade
        500, // tempo de delay
        () => {
          gameState.isGameInit = true; // Define que o jogo está inicializado
          this.scene.start("Phase2");
          gameState.phase = 2; // Define que a fase atual é a 1
        },
        [],
        this
      );
    });

    // Configura tamanhos para o botão de próxima fase quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.nextPhaseBtn, 1.5);
    scaleElement("out", this.nextPhaseBtn, 1.35);

    // Mesma lógica dos botões acima para o botão pause
    this.pauseBtn.on("pointerdown", () => {
      pauseGame(this, this.soundBtn, this.player, this.homeBtn);
    });

    // Mesma lógica dos botões acima para o botão do som
    this.soundBtn.on("pointerdown", () => {
      this.sound.mute = !this.sound.mute;
      soundGame(this, this.soundBtn);
    });
    scaleElement("over", this.pauseBtn, 1.1);
    scaleElement("out", this.pauseBtn, 1);

    scaleElement("over", this.soundBtn, 1.1);
    scaleElement("out", this.soundBtn, 1);

    this.pular = this.add
      .image(719, 100, "pular")
      .setScrollFactor(0)
      .setAlpha(1)
      .setScale(0.5)
      .setDepth(1e9)
      .setVisible(false);

    this.abaixar = this.add
      .image(240, 100, "abaixar")
      .setScrollFactor(0)
      .setAlpha(1)
      .setDepth(1e9)
      .setScale(0.5)
      .setVisible(false);

    this.comandos = this.add
      .image(480, 40, "comandos")
      .setScrollFactor(0)
      .setAlpha(1)
      .setScale(1)
      .setDepth(1e9)
      .setVisible(false);

    this.panTutorial = this.add
      .image(4000, 350, "panTutorial")
      .setAlpha(1)
      .setDepth(1e9)
      .setScale(1);
  }

  update() {

    if (this.player.x < 6000) {
      this.cameras.main.startFollow(this.player, true, 0.05, 0.05, 0); // Câmera segue o celsinho deslocada 400px para direita
    } else {
      this.cameras.main.startFollow(
        this.player,
        true,
        0.05,
        0.05,
        this.transitionValue > -300
          ? this.transitionValue--
          : this.transitionValue
      ); // Câmera segue o celsinho deslocada 400px para direita
      this.setaBaixo.setFrame(1);
      this.setaCima.setFrame(1);
      this.pular.setVisible(false);
      this.abaixar.setVisible(false);
      this.comandos.setVisible(false);
    }

    if (
      (this.player.x > 2835 && this.player.x < 2860) ||
      (this.player.x > 2835 && this.player.x < 2845)
    ) {
      if (this.player.y < 388) {
        // Set player's speed back to 300
        this.player.setVelocityX(300);

        // Stop the tween and reset the size of the setaCima object
        this.tweens.killTweensOf(this.setaCima);
        this.setaCima.setScale(0.5, 0.5);

        // Set the flag back to false so the tween can be added again
        this.tweenAdded = false;
      } else {
        // Make setaCima and setaBaixo visible
        this.setaCima.setFrame(0);
        this.comandos.setVisible(true);
        this.pular.setVisible(true);

        // Set player's speed to 0
        this.player.setVelocityX(0);

        // Only add the tween if it hasn't been added yet
        if (!this.tweenAdded) {
          // Add a tween to the setaCima object to make it increase and decrease in size slightly
          this.tweens.add({
            targets: this.setaCima,
            scaleX: 0.55, // Increase size by 5%
            scaleY: 0.55, // Increase size by 5%
            yoyo: true, // Make the tween yoyo so the size decreases back to original after increasing
            duration: 500, // Duration of one cycle of the tween in milliseconds
            repeat: -1, // Repeat the tween indefinitely
          });

          // Set the flag to true so the tween isn't added again
          this.tweenAdded = true;
        }
      }
    } else {
      // If the player's x position is not 2835, set the flag back to false
      this.tweenAdded = false;
    }
    if (
      (this.player.x > 3900 && this.player.x < 3925) ||
      (this.player.x > 3900 && this.player.x < 3915)
    ) {
      if (this.player.y > 410) {
        // Set player's speed back to 300
        this.player.setVelocityX(gameState.playerVelocityX);

        // Stop the tween and reset the size of the setaBaixo object
        this.tweens.killTweensOf(this.setaBaixo);
        this.setaBaixo.setScale(0.5, 0.5);

        // Set the flag back to false so the tween can be added again
        this.tweenAdded = false;
      } else {
        // Make setaCima and setaBaixo visible
        this.setaBaixo.setFrame(0);
        this.abaixar.setVisible(true);

        // Set player's speed to 0
        this.player.setVelocityX(0);

        // Only add the tween if it hasn't been added yet
        if (!this.tweenAdded) {
          // Add a tween to the setaBaixo object to make it increase and decrease in size slightly
          this.tweens.add({
            targets: this.setaBaixo,
            scaleX: 0.55, // Increase size by 5%
            scaleY: 0.55, // Increase size by 5%
            yoyo: true, // Make the tween yoyo so the size decreases back to original after increasing
            duration: 500, // Duration of one cycle of the tween in milliseconds
            repeat: -1, // Repeat the tween indefinitely
          });

          // Set the flag to true so the tween isn't added again
          this.tweenAdded = true;
        }
      }
    } else {
      // If the player's x position is not 3875, set the flag back to false
      this.tweenAdded = false;
    }
    // Quando o jogador chega ao final da fase
    if (this.player.body.position.x >= 49850 && this.gameIsRunning) {
      // Se o jogador alcançou o final da fase, chama a função de vitória do jogo
      winGame(
        this, // Passagem do contexto atual
        "Phase2", // Próxima fase após a vitória
        this.winGameTxt1, // Texto de vitória (parte 1)
        this.winGameTxt2, // Texto de vitória (parte 2)
        this.homeBtn, // Botão para retornar ao menu principal
        this.player, // Referência ao jogador
        this.pauseBtn,
        this.nextPhaseBtn // Botão para ir para a próxima fase
      );
      this.gameIsRunning = false;
    } else if (
      this.player.body.position.y >= gameState.height &&
      this.gameIsRunning
    ) {
      // Caso o personagem caia do mapa
      endGame(this, this.player, this.homeBtn, this.pauseBtn);
      this.gameIsRunning = false;
    } else if (this.gameIsRunning) {
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se movendo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão
    }

    if (this.player.x > 6000 && this.player.x > this.lastCheckpoint + 1500) {
      this.player.setVelocityX((gameState.playerVelocityX += 5));
      this.lastCheckpoint = this.player.x;
    }

    if (gameState.triviaAnswered) {
      if (gameState.triviaResult === true) {
        console.log("ACERTOU");
        // Resume the game
        this.player.setVelocity(gameState.playerVelocityX);
        // Destroy the collided object
        gameState.collidedObject.destroy();
        gameState.collidedObject = null;
        this.scene.stop("Trivia");
      } else if (gameState.triviaResult === false) {
        console.log("ERROU");
        gameState.playerVelocityX = 300;
        // Quando o botão de reinício é clicado, chama a função de reiniciar o jogo
        this.gameIsRunning = true;
        restartGame(
          this,
          this.player,
          this.homeBtn,
          this.pauseBtn,
          6500,
          300,
          300
        );
        this.scene.stop("Trivia");
      }
    }

    // Reset triviaResult and triviaAnswered for the next question
    gameState.triviaResult = null;
    gameState.triviaAnswered = false;
  }

  addPressurePans() {
    const pressurePanCoordinates = [
      { x: 8700, y: 200, scale: 1 },
      { x: 8750, y: 200, scale: 1 },
      { x: 9490, y: 200, scale: 1 },
      { x: 9540, y: 200, scale: 1 },
      { x: 9490, y: 200, scale: 1 },
      { x: 10865, y: 200, scale: 1 },
      { x: 12495, y: 200, scale: 1 },
      { x: 13200, y: 200, scale: 1 },
      { x: 13260, y: 200, scale: 1 },
      { x: 13800, y: 200, scale: 1 },
      { x: 17600, y: 200, scale: 1 },
      { x: 20800, y: 200, scale: 1 },
      { x: 23050, y: 200, scale: 1 },
      { x: 23100, y: 200, scale: 1 },
      { x: 25300, y: 200, scale: 1 },
      { x: 27550, y: 200, scale: 1 },
      { x: 30400, y: 200, scale: 1 },
      { x: 30460, y: 200, scale: 1 },
      { x: 34000, y: 200, scale: 1 },
      { x: 34060, y: 200, scale: 1 },
      { x: 34120, y: 200, scale: 1 },
      { x: 37000, y: 200, scale: 1 },
      { x: 37060, y: 200, scale: 1 },
      { x: 37120, y: 200, scale: 1 },
      { x: 42000, y: 200, scale: 1 },
      { x: 42060, y: 200, scale: 1 },
      { x: 42120, y: 200, scale: 1 },
      { x: 44060, y: 200, scale: 1 },
      { x: 44120, y: 200, scale: 1 },
      { x: 47060, y: 200, scale: 1 },
      { x: 47120, y: 200, scale: 1 },
      { x: 47180, y: 200, scale: 1 },
      // Adicione mais coordenadas conforme necessário
    ];

    pressurePanCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 56;
        sizeY = 36;
        offsetX = 7;
        offsetY = 24;
      }

      const pressurePan = this.pressurePans
        .create(coord.x, coord.y, "pressurePan")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pressurePan.anims.play("pressurePanExplode", true); // Substitua "ironAnimation" pela animação correta
      // Configurações adicionais para cada "iron", se necessário
    });
  }
  // Distanciamento obstáculos ao longo do aumeto da velocidade e dificuldade
  // 1ª ZONA: 19300 - 28800 distância entre obstáculos: 750
  // 2ª ZONA: 33700 - 50000 - distância entre obstáculos: 1000
  // 3ª ZONA: 51100 - 58200 - distância entre obstaculos: 1200

  addBonfires() {
    const bonfireCoordinates = [
      { x: 7150, y: 200, scale: 2.8 },
      { x: 7200, y: 200, scale: 2.8 },
      { x: 10365, y: 200, scale: 2.8 },
      { x: 11975, y: 200, scale: 2.8 },
      { x: 14425, y: 200, scale: 2.8 },
      { x: 14465, y: 200, scale: 2.8 },
      { x: 16070, y: 200, scale: 2.8 },
      { x: 16910, y: 200, scale: 2.8 },
      { x: 19300, y: 200, scale: 2.8 },
      { x: 21550, y: 200, scale: 2.8 },
      { x: 21590, y: 200, scale: 2.8 },
      { x: 23800, y: 200, scale: 2.8 },
      { x: 26050, y: 200, scale: 2.8 },
      { x: 28300, y: 200, scale: 2.8 },
      { x: 28340, y: 200, scale: 2.8 },
      { x: 31770, y: 200, scale: 2.8 },
      { x: 35000, y: 200, scale: 2.8 },
      { x: 35040, y: 200, scale: 2.8 },
      { x: 35080, y: 200, scale: 2.8 },
      { x: 38000, y: 200, scale: 2.8 },
      { x: 38040, y: 200, scale: 2.8 },
      { x: 38080, y: 200, scale: 2.8 },
      { x: 40000, y: 100, scale: 2.8 },
      { x: 40040, y: 100, scale: 2.8 },
      { x: 45000, y: 100, scale: 2.8 },
      { x: 45040, y: 100, scale: 2.8 },
      // Adicione mais coordenadas conforme necessário
    ];

    bonfireCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 2.8) {
        sizeX = 15;
        sizeY = 15;
        offsetX = 8;
        offsetY = 13;
      }

      const bonfire = this.bonfires
        .create(coord.x, coord.y, "bonfire")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      bonfire.anims.play("bonfireFlaming", true); // Substitua "panAnimation" pela animação correta
      // Configurações adicionais para cada "pan", se necessário
    });
  }

  // Adiciona múltiplos elementos "oven" ao mapa
  addGrills() {
    const grillCoordinates = [
      { x: 8200, y: 200, scale: 0.9 },
      { x: 9800, y: 320, scale: 0.9 },
      { x: 9850, y: 320, scale: 0.9 },
      { x: 11490, y: 200, scale: 0.9 },
      { x: 15325, y: 200, scale: 0.9 },
      { x: 20050, y: 200, scale: 0.9 },
      { x: 22300, y: 200, scale: 0.9 },
      { x: 24550, y: 200, scale: 0.9 },
      { x: 26800, y: 200, scale: 0.9 },
      { x: 26850, y: 200, scale: 0.9 },
      { x: 29050, y: 200, scale: 0.9 },
      { x: 32500, y: 200, scale: 0.9 },
      { x: 36000, y: 200, scale: 0.9 },
      { x: 36050, y: 200, scale: 0.9 },
      { x: 36100, y: 200, scale: 0.9 },
      { x: 39000, y: 200, scale: 0.9 },
      { x: 39050, y: 200, scale: 0.9 },
      { x: 39100, y: 200, scale: 0.9 },
      { x: 40700, y: 100, scale: 0.9 },
      { x: 41400, y: 100, scale: 0.9 },
      { x: 41450, y: 100, scale: 0.9 },
      { x: 43000, y: 100, scale: 0.9 },
      { x: 43050, y: 100, scale: 0.9 },
      { x: 43100, y: 100, scale: 0.9 },
      { x: 46000, y: 100, scale: 0.9 },
      { x: 46050, y: 100, scale: 0.9 },
      { x: 46100, y: 100, scale: 0.9 },
      { x: 49000, y: 100, scale: 0.9 },
      { x: 49050, y: 100, scale: 0.9 },
      { x: 49100, y: 100, scale: 0.9 },
      // Adicione mais coordenadas conforme necessário
    ];

    grillCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.9) {
        sizeX = 70;
        sizeY = 72;
        offsetX = 8;
        offsetY = 33;
      }

      const grill = this.grills
        .create(coord.x, coord.y, "grill")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      grill.anims.play("grillFlaming", true); // Substitua "ovenAnimation" pela animação correta
      // Configurações adicionais para cada "oven", se necessário
    });
  }
}
