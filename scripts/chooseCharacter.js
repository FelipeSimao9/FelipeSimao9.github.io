// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "./main.js";

// Importa a função loadSpritesTxtsBtns do arquivo "functions.js"
import { loadSpritesTxtsBtns } from "./functions.js";

// Importa a classe Player do arquivo "player.js"
import Player from "./player.js";

// Define a classe ChooseCharacter que estende Phaser.Scene
export default class ChooseCharacter extends Phaser.Scene {
  constructor() {
    super({ key: "ChooseCharacter" });

    // Declaração de variáveis para elementos visuais
    this.chooseCharacterTxt;
    this.celsinho;
    this.kelvinha;
  }

  // Carrega os recursos necessários para a cena
  preload() {
    // Carrega a imagem do texto "Choose Character"
    this.load.image(
      "chooseCharacterTxt",
      "../assets/game/texts/chooseCharacterTxt.png"
    );

    // Chama a função para carregar sprites, textos e botões
    loadSpritesTxtsBtns(this);

    // Carrega os textos com os nomes dos personagens
    this.load.image("celsinhoTxt", "../assets/game/texts/celsinhoTxt.png");
    this.load.image("kelvinhaTxt", "../assets/game/texts/kelvinhaTxt.png");
    this.load.audio("music1", "../assets/game/phase1/musicPhase1.mp3");
  }

  // Cria os elementos visuais e define a interatividade
  create() {
    this.musicOne = this.sound.add('music1', {
      volume: 0.3,
      loop: true
    })

    this.botton = this.sound.add('botton', {
      volume: 0.3,
      loop: false
    })
    // Adiciona a imagem de fundo no centro da tela
    this.add.image(gameState.width / 2, gameState.height / 2, "background");
    // Adiciona o texto "Choose Character" no topo da tela
    this.chooseCharacterTxt = this.add.image(
      gameState.width / 2,
      120,
      "chooseCharacterTxt"
    );

    // Adiciona as imagens dos textos "Celsinho" e "Kelvinha"
    this.add.image(250, 460, "celsinhoTxt");
    this.add.image(670, 460, "kelvinhaTxt");

    // Anima o texto "Choose Character"
    this.tweens.add({
      targets: this.chooseCharacterTxt, // O objeto que você deseja animar
      scaleX: 1.05, // Escala horizontal desejada
      scaleY: 1.05, // Escala vertical desejada
      duration: 1000, // A duração da animação em milissegundos
      ease: "Cubic", // A função de easing para a animação
      yoyo: true, // Fazer a animação de ida e volta
      repeat: -1, // Repetir a animação indefinidamente
    });

    // Cria os sprites dos personagens celsinho e kelvinha por meio da classe "Player"
    this.celsinho = new Player(this, 250, 344, "celsinho");
    this.kelvinha = new Player(this, 650, 346, "kelvinha");

    // Adiciona os personagens à cena
    this.celsinho.addPlayerToScene(this);
    this.kelvinha.addPlayerToScene(this);

    // Desativa a gravidade dos personagens
    this.celsinho.body.setAllowGravity(false);
    this.kelvinha.body.setAllowGravity(false);

    // Define os personagens como interativos e configura o cursor do mouse
    this.celsinho.setScale(1).setInteractive({ cursor: "pointer" });
    this.kelvinha.setScale(1).setInteractive({ cursor: "pointer" });

    // Define ação quando o jogador escolhe o personagem celsinho
   
    this.celsinho.on(
      "pointerdown",
      () => {
        this.botton.play(this.scene.start("ChoosePhase"));
        gameState.player = "celsinho"; // Define o personagem escolhido como "celsinho" no estado do jogo
      },
      this
    );

    // Define ações de interação com o mouse para o personagem celsinho
    this.celsinho.on(
      "pointerover",
      () => {
        // Aumenta o tamanho do sprite quando o mouse passa sobre ele
        this.celsinho.setScale(1.1).setPosition(250, 335);
      },
      this
    );

    this.celsinho.on(
      "pointerout",
      () => {
        // Retorna o tamanho do sprite ao normal quando o mouse sai de cima dele
        this.celsinho.setScale(1).setPosition(250, 344);
      },
      this
    );

    // Define ação quando o jogador escolhe a personagem kelvinha
    this.kelvinha.on(
      "pointerdown",
      () => {
        this.botton.play();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(
          // delay para cena iniciar só depois do efeito fade
          500, // tempo de delay
          () => {
            gameState.player = "kelvinha"; // Define o personagem escolhido como "celsinho" no estado do jogo
            this.scene.start("ChoosePhase");
          },
          [],
          this
        );
      },
      this
    );

    // Define ações de interação com o mouse para a personagem kelvinha
    this.kelvinha.on(
      "pointerover",
      () => {
        // Aumenta o tamanho do sprite quando o mouse passa sobre ela
        this.kelvinha.setScale(1.1).setPosition(650, 337);
      },
      this
    );

    this.kelvinha.on(
      "pointerout",
      () => {
        // Retorna o tamanho do sprite ao normal quando o mouse sai de cima dela
        this.kelvinha.setScale(1).setPosition(650, 346);
      },
      this
    );
  }
}
