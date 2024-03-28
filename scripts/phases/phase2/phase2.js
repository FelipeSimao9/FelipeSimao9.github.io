// Importa o estado atual do jogo do arquivo "main.js"
import { gameState } from "../../main.js";

import {
  endGame,
  winGame,
  pauseGame,
  soundGame,
  restartGame,
  scaleElement,
} from "../../functions.js";

// Importa o jogador do jogo do arquivo "player.js"
import Player from "../../player.js";

// Define a classe Phase2, que representa a segunda fase do jogo, estendendo Phaser.Scene.
export default class Phase2 extends Phaser.Scene {
  constructor() {
    super({ key: "Phase2" }); // Chama o construtor da classe pai (Phaser.Scene) e atribui uma chave identificadora para esta cena.

    // Declaração de variáveis para elementos visuais e de jogo
    this.ground;
    this.cabinet;
    this.player;
    this.table;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.winGameTxt1;
    this.winGameTxt2;

    // Bestiário:
    this.coffeMachines;
    this.panWaters;
    this.panOils;

    // temporizador para o personagem escapar de plataforma
    this.escapeTimer;
    this.timerIsCreate = false;

    // Isto receberá o retângulo vermelho que aparecerá ao colidir com plataformas
    this.screenOverlay;

    // Controle para saber se jogador toca o chão
    this.isTouchingFloor = false;

    // Controle para saber se a partida está acontecendo
    this.gameIsRunning = true;
  }

  // Função de pré-carregamento de recursos do jogo
  preload() {
    // MAPA:
    this.load.tilemapTiledJSON("map", "../../assets/game/phase2/map/map.json"); // json com informações sobre a construção do mapa

    this.load.image("ground", "../../assets/game/phase2/map/tilesetGround.png"); // imagem para construir o mapa do jogo

    this.load.image(
      "cabinet",
      "../../assets/game/phase2/map/tilesetCabinet.png"
    );

    this.load.image("tile", "../../assets/game/phase2/map/tilesetTile.png");

    this.load.image(
      "window1",
      "../../assets/game/phase2/map/tilesetWindow1.png"
    );

    this.load.image(
      "window2",
      "../../assets/game/phase2/map/tilesetWindow2.png"
    );

    this.load.image("oven", "../../assets/game/phase2/map/tilesetOven.png");

    this.load.image(
      "freezer",
      "../../assets/game/phase2/map/tilesetFreezer.png"
    );

    this.load.image("trash", "../../assets/game/phase2/map/tilesetTrash.png");

    this.load.image("sink", "../../assets/game/phase2/map/tilesetSink.png");

    this.load.image("table", "../../assets/game/phase2/map/tilesetTable.png");

    // BESTIÁRIO:
    this.load.spritesheet(
      "coffeMachine",
      "../../assets/game/phase2/coffeMachine.png",
      {
        frameWidth: 80,
        frameHeight: 106.66,
      }
    );

    this.load.spritesheet("panWater", "../../assets/game/phase2/panWater.png", {
      frameWidth: 80,
      frameHeight: 40,
    });

    this.load.spritesheet("panOil", "../../assets/game/phase2/panOil.png", {
      frameWidth: 80,
      frameHeight: 40,
    });
  }

  // Função de criação da cena do jogo, onde os elementos visuais e de jogo são adicionados
  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0); // Faz a transição de fade-in da câmera com duração de 1000 milissegundos
    this.cameras.main.setBounds(
      // Define os limites da câmera
      0,
      0, // Limite superior
      49984, // Limite horizontal
      gameState.height // limite vertical
    );

    const map = this.make.tilemap({ key: "map" }); // cria mapa
    const tilesetGround = map.addTilesetImage("ground", "ground"); // associa a imagem da grama com o json
    const tilesetTile = map.addTilesetImage("tile", "tile");
    const tilesetCabinet = map.addTilesetImage("cabinet", "cabinet");
    const tilesetWindow1 = map.addTilesetImage("window1", "window1");
    const tilesetWindow2 = map.addTilesetImage("window2", "window2");
    const tilesetOven = map.addTilesetImage("oven", "oven");
    const tilesetFreezer = map.addTilesetImage("freezer", "freezer");
    const tilesetTrash = map.addTilesetImage("trash", "trash");
    const tilesetSink = map.addTilesetImage("sink", "sink");
    const tilesetTable = map.addTilesetImage("table", "table");

    this.ground = map.createLayer("ground", tilesetGround); // cria uma camada no mapa para grama
    map.createLayer("tile", tilesetTile);
    this.cabinet = map.createLayer("cabinet", tilesetCabinet);
    this.table = map.createLayer("table", tilesetTable);
    // map.createLayer("windows", tilesetWindow1); // Está com problema pra adicionar dois tileset a mesma camada
    map.createLayer("windows", tilesetWindow2);
    map.createLayer("oven", tilesetOven);
    map.createLayer("freezer", tilesetFreezer);
    map.createLayer("trash", tilesetTrash);
    map.createLayer("sink", tilesetSink);

    this.ground.setCollisionByProperty({ collider: true }); // adiciona colisão onde houver a propriedade collider = verdadeiro
    this.cabinet.setCollisionByProperty({ collider: true });
    this.table.setCollisionByProperty({ collider: true });

    // Adiciona o jogador
    this.player = new Player(this, 0, 0, gameState.player); // // Cria uma nova instância do jogador, passando as coordenadas x e y iniciais, e o tipo de jogador
    this.player.addPlayerToScene(this); // Adiciona o jogador na cena
    this.player.setVelocityX(gameState.playerVelocityX); // Define a velocidade inicial do jogador
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do jogador, baseada no tipo de jogador e no estado de "correndo"

    [this.ground, this.cabinet, this.table].forEach((platform) => {
      this.physics.add.collider(
        this.player,
        platform,
        () => {
          this.isTouchingFloor = true;
        },
        null,
        this
      );
    }); // Adiciona uma colisão entre o jogador e a camada do chão

    // Configura a câmera para seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o celsinho deslocada 400px para direita

    // Criação do bestiário:
    this.coffeMachines = this.physics.add.group();
    this.panWaters = this.physics.add.group();
    this.panOils = this.physics.add.group();

    this.physics.add.collider(this.coffeMachines, this.cabinet);
    this.physics.add.collider(this.panWaters, this.cabinet);
    this.physics.add.collider(this.panOils, this.cabinet);
    this.physics.add.collider(this.coffeMachines, this.ground);
    this.physics.add.collider(this.panWaters, this.ground);
    this.physics.add.collider(this.panOils, this.ground);

    [this.panOils, this.coffeMachines, this.panWaters].forEach((obstacle) => {
      // Itera sobre o array com o bestiário e adiciona o chamado a uma função no caso do personagem sobrepor algum item do bestiário
      this.physics.add.overlap(
        this.player,
        obstacle,
        () => {
          endGame(this, this.player, this.homeBtn, this.pauseBtn, true);
        },
        null,
        this
      );
    });

    // Criação das animações do bestiário:
    [
      { key: "coffeMachineHeating", sprite: "coffeMachine" },
      { key: "panOilBoiling", sprite: "panOil" },
      { key: "panWaterBoiling", sprite: "panWater" },
    ].forEach(({ key, sprite }) => {
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
            end: 2,
          }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    // Funções para adicionar o obestiário
    this.addPanOils();
    this.addCoffeMachines();
    this.addPanWaters();

    // Botões e textos do jogo:
    this.winGameTxt1 = this.add
      .image(gameState.width / 2, gameState.height / 2 - 100, "winGameTxt1")
      .setScale(1.5)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.winGameTxt2 = this.add
      .image(gameState.width / 2, gameState.height / 2 + 20, "winGameTxt2")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.homeBtn = this.add // Adiciona um botão de home
      .image(gameState.width / 2, gameState.height / 2, "homeBtn")
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

    // Define a ação a ser executada quando o botão de home é clicado
    this.homeBtn.on("pointerdown", () => {
      this.sound.stopByKey('music1');
      // Reinicia algumas variáveis de estado do jogo
      gameState.player = ""; // Limpa o nome do personagem
      gameState.isGameInit = false; // Define que o jogo não está mais em execução, pois o jogador está retornando à tela inicial
      this.scene.start("StartScene"); // Inicia a cena "StartScene", levando o jogador de volta à tela inicial do jogo
    });

    // Configura escalas para o botão de "Home" quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.homeBtn, 1.5);
    scaleElement("out", this.homeBtn, 1.35);

    // Mesma lógica dos botões acima para o botão pause
    this.pauseBtn.on("pointerdown", () => {
      pauseGame(this, this.soundBtn, this.player, this.homeBtn);
    });

    scaleElement("over", this.pauseBtn, 1.1);
    scaleElement("out", this.pauseBtn, 1);

    // Mesma lógica dos botões acima para o botão do som
    this.soundBtn.on("pointerdown", () => {
      this.sound.mute = !this.sound.mute;
      soundGame(this, this.soundBtn);
    });

    scaleElement("over", this.soundBtn, 1.1);
    scaleElement("out", this.soundBtn, 1);

    // Camada vermelha para escurecer a tela ao colidir com plataforma
    this.screenOverlay = this.add
      .rectangle(0, 0, gameState.width, gameState.height, 0xff0000)
      .setOrigin(0)
      .setScrollFactor(0)
      .setAlpha(0);
  }

  // Função de atualização da cena do jogo
  update() {
    // Quando o jogador chega ao final da fase
    if (this.player.body.position.x >= 49984 && this.gameIsRunning) {
      // Se o jogador alcançou o final da fase, chama a função de vitória do jogo
      winGame(
        this, // Passagem do contexto atual
        "StartScene", // Próxima fase após a vitória
        this.winGameTxt1, // Texto de vitória (parte 1)
        this.winGameTxt2, // Texto de vitória (parte 2)
        this.homeBtn, // Botão para retornar ao menu principal
        this.player, // Referência ao jogador
        this.pauseBtn
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
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se panWaterdo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão
    }

    if (this.player.body.velocity.x <= 0 && this.gameIsRunning) {
      // Caso o personagem colida e trave
      this.platformCollision();
      this.timerIsCreate = true;
    } else {
      if (this.escapeTimer) {
        this.tweens.add({
          targets: this.screenOverlay,
          alpha: 0, // Volta ao transparente
          duration: 500, // Duração da transição
          ease: "Linear",
        });
        this.escapeTimer.remove();
        this.timerIsCreate = false;
      }
    }
  }

  platformCollision() {
    this.player.setVelocityX(300);

    if (!this.timerIsCreate) {
      // Gradativamente escurece a tela para vermelho
      this.tweens.add({
        targets: this.screenOverlay,
        alpha: 0.7, // Defina o valor desejado para a opacidade vermelha
        duration: 3000, // Duração da transição
        ease: "Linear",
      });
      this.escapeTimer = this.time.delayedCall(
        3000,
        () => {
          // Se o temporizador expirar e o jogador não tiver escapado, chame a função endGame()
          endGame(this, this.player, this.homeBtn, this.pauseBtn);
        },
        null,
        this
      );
    }
  }

  addCoffeMachines() {
    const coffeMachineCoordinates = [
      { x: 1200, y: 200, scale: 0.7 },
      { x: 2600, y: 200, scale: 0.7 },
      { x: 4500, y: 200, scale: 0.7 },
      { x: 5400, y: 200, scale: 0.7 },
      { x: 6200, y: 200, scale: 0.7 },
      { x: 9490, y: 200, scale: 0.7 },
      { x: 12495, y: 200, scale: 0.7 },
      { x: 13200, y: 200, scale: 0.7 },
      { x: 13800, y: 200, scale: 0.7 },
      { x: 17600, y: 200, scale: 0.7 },
      { x: 68400, y: 200, scale: 0.7 },
      // Adicione mais coordenadas conforme necessário
    ];

    coffeMachineCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.7) {
        sizeX = 65;
        sizeY = 75;
        offsetX = 3;
        offsetY = 30;
      }

      if (coord.scale == 0.5) {
        sizeX = 65;
        sizeY = 85;
        offsetX = 15;
        offsetY = 11;
      }

      const coffeMachine = this.coffeMachines
        .create(coord.x, coord.y, "coffeMachine")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      coffeMachine.anims.play("coffeMachineHeating", true); // Substitua "coffeMachineAnimation" pela animação correta
      // Configurações adicionais para cada "coffeMachine", se necessário
    });
  }

  addPanOils() {
    const panCoordinates = [
      { x: 800, y: 200, scale: 1 },
      { x: 1500, y: 200, scale: 1 },
      { x: 2920, y: 200, scale: 1 },
      { x: 2990, y: 200, scale: 1 },
      { x: 7140, y: 200, scale: 1 },
      { x: 7200, y: 200, scale: 1 },
      { x: 14425, y: 200, scale: 1 },
      { x: 19300, y: 200, scale: 1 },
      { x: 31770, y: 200, scale: 1 },
      { x: 40000, y: 100, scale: 1 },
      { x: 66700, y: 100, scale: 1 },

      // Adicione mais coordenadas conforme necessário
    ];

    panCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 65;
        sizeY = 40;
        offsetX = 1;
        offsetY = 0;
      }

      const pan = this.panOils
        .create(coord.x, coord.y, "panOil")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pan.anims.play("panOilBoiling", true); // Substitua "panAnimation" pela animação correta
      // Configurações adicionais para cada "panOil", se necessário
    });
  }

  // Adiciona múltiplos elementos "panWater" ao mapa
  addPanWaters() {
    const panWaterCoordinates = [
      { x: 1900, y: 320, scale: 1 },
      { x: 2200, y: 320, scale: 1 },
      { x: 3300, y: 320, scale: 1 },
      { x: 4000, y: 320, scale: 1 },
      { x: 5800, y: 320, scale: 1 },
      { x: 6600, y: 320, scale: 1 },
      { x: 8200, y: 200, scale: 1 },
      { x: 11490, y: 200, scale: 1 },
      { x: 15325, y: 200, scale: 1 },
      { x: 32500, y: 200, scale: 1 },
      { x: 40700, y: 100, scale: 0.9 },
      { x: 41400, y: 100, scale: 0.9 },
      // Adicione mais coordenadas conforme necessário
    ];

    panWaterCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 55;
        sizeY = 38;
        offsetX = -2;
        offsetY = 0;
      }

      const panWater = this.panWaters
        .create(coord.x, coord.y, "panWater")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      panWater.anims.play("panWaterBoiling", true); // Substitua "panWaterAnimation" pela animação correta
      // Configurações adicionais para cada "panWater", se necessário
    });
  }
}
