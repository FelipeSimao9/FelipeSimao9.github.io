// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "../../main.js";

// Importa funções de controle para serem utilizadas do arquivo "functions.js"
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

// Classe que representa a cena da terceira fase do jogo
export default class Phase3 extends Phaser.Scene {
  constructor() {
    super({ key: "Phase3" });

    // Declaração de variáveis para elementos visuais e de jogo
    this.floor;
    this.player;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.winGameTxt1;
    this.winGameTxt2;
    this.attentionBullet;

    // Bestiário:
    this.pans;
    this.irons;
    this.ovens;
    this.bullets;

    this.lastCheckpoint = 0; // Último marco de posição para a lógica de disparo de projéteis

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

  // Carrega recursos necessários para a cena
  preload() {
    this.load.tilemapTiledJSON(
      "map",
      "../../assets/game/phase3/map/floor.json"
    ); // json com informações sobre a construção do mapa

    this.load.image(
      "floorTileset",
      "../../assets/game/phase3/map/floorTileset.png"
    ); // imagem para construir o mapa do jogo

    this.load.image(
      "attentionBullet",
      "../../assets/game/phase3/attentionBullet.png"
    ); // imagem para alertar sobre os projeteis

    this.load.spritesheet("iron", "../assets/game/phase3/iron.png", {
      frameWidth: 80,
      frameHeight: 102.8,
    });

    this.load.spritesheet("oven", "../assets/game/phase3/oven.png", {
      frameWidth: 80,
      frameHeight: 80,
    });

    this.load.spritesheet("pan", "../assets/game/phase3/pan.png", {
      frameWidth: 80,
      frameHeight: 37,
    });
  }

  // Adiciona elementos à cena quando ela é criada
  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0); // Faz a transição de fade-in da câmera com duração de 1000 milissegundos
    this.cameras.main.setBounds(
      // Define os limites da câmera
      0,
      0, // Limite superior
      62624, // Limite horizontal
      gameState.height // limite vertical
    );

    const map = this.make.tilemap({ key: "map" }); // cria mapa
    const tilesetFloor = map.addTilesetImage("floor", "floorTileset"); // associa a imagem da grama com o json
    this.floor = map.createLayer("floor", tilesetFloor); // cria uma camada no mapa para grama
    this.floor.setCollisionByProperty({ collider: true }); // adiciona colisão onde houver a propriedade collider = verdadeiro

    // Configura a gravidade para essa cena específica
    this.physics.world.gravity.y = 900;

    // Adiciona o jogador
    this.player = new Player(this, 0, 300, gameState.player); // // Cria uma nova instância do jogador, passando as coordenadas x e y iniciais, e o tipo de jogador
    this.player.addPlayerToScene(this); // Adiciona o jogador na cena
    this.player.setVelocityX(300); // Define a velocidade inicial do jogador
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do jogador, baseada no tipo de jogador e no estado de "correndo"
    this.physics.add.collider(
      this.player,
      this.floor,
      () => {
        this.isTouchingFloor = true;
      },
      null,
      this
    ); // Adiciona uma colisão entre o jogador e a camada do chão

    // Configura a câmera para seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o celsinho deslocada 400px para direita

    // Criação do bestiário:
    this.pans = this.physics.add.group();
    this.irons = this.physics.add.group();
    this.ovens = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.physics.add.collider(this.pans, this.floor);
    this.physics.add.collider(this.irons, this.floor);
    this.physics.add.collider(this.ovens, this.floor);
    [this.pans, this.irons, this.ovens, this.bullets].forEach((obstacle) => {
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
      { key: "ironHeating", sprite: "iron", end: 4 },
      { key: "panBoiling", sprite: "pan", end: 5 },
      { key: "ovenBaking", sprite: "oven", end: 2 },
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
    this.addPans();
    this.addIrons();
    this.addOvens();

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

    this.attentionBullet = this.add // Adiciona um botão de pause
      .image(gameState.width - 50, 0, "attentionBullet")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.tweens.add({
      targets: this.attentionBullet,
      scaleX: 1.1, // A escala x aumenta para 1.1
      scaleY: 1.1, // A escala y aumenta para 1.1
      duration: 150, // Duração de 1 segundo
      yoyo: true, // Alterna entre o valor inicial e o final
      repeat: -1, // Repete infinitamente
    });

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

  // Atualizações a serem realizadas a cada quadro de atualização do jogo
  update() {
    // Quando o jogador chega ao final da fase
    if (this.player.body.position.x >= 62324 && this.gameIsRunning) {
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
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se movendo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão

      this.fireBulletControl();
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

  // RANGE DE DISPAROS:
  // 1ª ZONA: 11872 - 21664
  // 2ª ZONA: 26304 - 31680
  // 3ª ZONA: 43648 - 50240

  fireBulletControl() {
    if (
      ((this.player.x >= 11872 && this.player.x <= 21664) ||
        (this.player.x >= 26304 && this.player.x <= 31680) ||
        (this.player.x >= 43648 && this.player.x <= 50240)) &&
      this.player.x > this.lastCheckpoint + 1000
    ) {
      this.fireBullet(); // ir adicionando as coordenadas de disparo
      this.lastCheckpoint = this.player.x;
    }

    this.bullets.getChildren().forEach((bullet) => {
      this.attentionBullet.y = bullet.y;

      if (bullet.x < this.cameras.main.scrollX + gameState.width + 1000) {
        this.attentionBullet.setVisible(true);
      }

      if (bullet.x < this.cameras.main.scrollX + gameState.width - 100) {
        this.attentionBullet.setVisible(false);
      }

      // Se o projétil sair da tela, será removido
      if (bullet.x < this.cameras.main.scrollX) {
        bullet.destroy(); // Remove o projétil do jogo
      }
    });
  }

  fireBullet() {
    console.log("exec");
    const shouldBeFired = Phaser.Math.RND.between(0, 3);
    if (shouldBeFired == 0) return; // 66,66% de chance do projétil ser disparado

    const bulletSpeedRandom = Phaser.Math.RND.between(-300, -600);
    let bulletHeight = 0;
    Phaser.Math.RND.between(0, 1) ? (bulletHeight = -50) : (bulletHeight = 20);
    const bulletTypeRandom = Phaser.Math.RND.between(0, 1);

    let sprite = bulletTypeRandom ? "pan" : "iron";
    let animation = bulletTypeRandom ? "panBoiling" : "ironHeating";
    let sizeX = 0;
    let sizeY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let scale = 0;

    if (bulletTypeRandom) {
      sizeX = 75;
      sizeY = 18;
      offsetX = 0;
      offsetY = 18;
      scale = 0.6;
    } else {
      sizeX = 65;
      sizeY = 85;
      offsetX = 15;
      offsetY = 11;
      scale = 0.4;
    }

    const bullet = this.bullets
      .create(
        gameState.width + this.player.x + 1500,
        this.player.y + bulletHeight,
        sprite
      )
      .setScale(scale)
      .setScale(scale)
      .setSize(sizeX, sizeY)
      .setOffset(offsetX, offsetY)
      .setVelocityX(bulletSpeedRandom);
    bullet.body.setAllowGravity(false);
    bullet.anims.play(animation, true);
  }

  addIrons() {
    const ironCoordinates = [
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

    ironCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.7) {
        sizeX = 65;
        sizeY = 85;
        offsetX = 15;
        offsetY = 11;
      }

      if (coord.scale == 0.5) {
        sizeX = 65;
        sizeY = 85;
        offsetX = 15;
        offsetY = 11;
      }

      const iron = this.irons
        .create(coord.x, coord.y, "iron")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      iron.anims.play("ironHeating", true); // Substitua "ironAnimation" pela animação correta
      // Configurações adicionais para cada "iron", se necessário
    });
  }

  addPans() {
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
        sizeX = 75;
        sizeY = 18;
        offsetX = 0;
        offsetY = 18;
      }

      const pan = this.pans
        .create(coord.x, coord.y, "pan")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pan.anims.play("panBoiling", true); // Substitua "panAnimation" pela animação correta
      // Configurações adicionais para cada "pan", se necessário
    });
  }

  // Adiciona múltiplos elementos "oven" ao mapa
  addOvens() {
    const ovenCoordinates = [
      { x: 720, y: 320, scale: 1 },
      { x: 1900, y: 320, scale: 1 },
      { x: 2200, y: 320, scale: 1 },
      { x: 3300, y: 320, scale: 1 },
      { x: 4000, y: 320, scale: 1 },
      { x: 4900, y: 320, scale: 1 },
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

    ovenCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 70;
        sizeY = 60;
        offsetX = 5;
        offsetY = 18;
      }

      const oven = this.ovens
        .create(coord.x, coord.y, "oven")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      oven.anims.play("ovenBaking", true); // Substitua "ovenAnimation" pela animação correta
      // Configurações adicionais para cada "oven", se necessário
    });
  }
}
