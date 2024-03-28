// Importa as dependências necessárias
import { gameState } from "./main.js"; // Importa o objeto gameState que contém informações globais do jogo
import { scaleElement } from "./functions.js"; // Importa uma função para aumentar o tamanho de elementos na tela
import { loadSprites, animsCreate } from "./player.js"; // Importa funções para carregar sprites e criar animações do jogador

// Classe que representa a cena inicial do jogo
export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });

    // Inicializa as variáveis ​​da cena
    this.startHistoryTxt; // Texto para iniciar o modo história
    this.startQuicklyTxt; // Texto para iniciar o modo rápido
  }

  // Carregar os recursos (imagens e áudios) necessários para a tela inicial
  preload() {
    this.load.image("background", "../assets/game/startScene/background.png");
    this.load.image(
      "startHistoryTxt",
      "../assets/game/texts/startHistoryTxt.png"
    );
    this.load.image(
      "startQuicklyTxt",
      "../assets/game/texts/startQuicklyTxt.png"
    );
    this.load.image("100celsiusLogo", "../assets/game/texts/100celsius.png");
    this.load.image("runOrBurnTxt", "../assets/game/texts/runOrBurnTxt.png");

    // Carrega sprites e animações do jogador
    loadSprites(this);

    // Carrega o áudio para a tela de início
    this.load.audio("theme", "../assets/game/startScene/theme.mp3");

    this.load.audio("botton", "../assets/game/phase1/botton.mp3");
  }

  // Adicionar elementos à tela inicial do jogo
  create() {
    this.botton = this.sound.add('botton', {
      volume: 0.3,
      loop: false
    })
    // Adiciona a música de fundo
    var music = this.sound.add("theme"); // adição e reprodução da música

    if (!this.sound.locked)
	{
		// already unlocked so play
		music.play()
	}
	else
	{
		// wait for 'unlocked' to fire and then play
		this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
			music.play()
		})
	}

    // Adiciona imagens na tela inicial ()
    this.add.image(gameState.width / 2, gameState.height / 2, "background"); // Plano de fundo
    this.add.image(gameState.width / 2 + 15, 190, "runOrBurnTxt"); // Subtítulo
    this.add.image(gameState.width / 2, 110, "100celsiusLogo"); // Título

    // Cria as animações do jogador
    animsCreate(this);

    // Adicionar um botão para iniciar modo história
    this.startHistoryTxt = this.add
      .image(gameState.width / 2, 310, "startHistoryTxt")
      .setInteractive({ cursor: "pointer" }); // Torna o botão interativo e define que quando o cursor sobre este elemento seja o pointer

    // Define comportamentos de escala para o botão de iniciar modo história
    scaleElement("over", this.startHistoryTxt, 1.1); // Ajusta a escala do botão de história quando o cursor está sobre ele
    scaleElement("out", this.startHistoryTxt, 1); // Restaura a escala original do botão de história quando o cursor sai dele

    // Adiciona evento de clique ao botão de iniciar modo história
    this.startHistoryTxt.on("pointerdown", () => {
      this.scene.start("ChooseCharacter"); // Começa a cena "ChooseCharacter"
      this.botton.play()});

    this.startHistoryTxt.on("pointerdown", () => {
      this.botton.play(this.scene.start("ChooseCharacter")); // Começa a cena "ChooseCharacter");
    });

    // Adicione um botão de modo desafio/rápido
    this.startQuicklyTxt = this.add
      .image(gameState.width / 2, 370, "startQuicklyTxt") // Adiciona a imagem do botão
      .setTint("0x858585") // Define uma cor de tonalidade cinza para o botão
      .setInteractive({ cursor: "pointer" });

    // Adiciona um evento de clique ao botão de modo desafio/rápido
    this.startQuicklyTxt.on("pointerdown", function () {
      // Aqui, um alerta é exibido informando que o modo ainda não está disponível
      alert("Desculpe, este modo ainda não está disponível");
    });
    }
}
