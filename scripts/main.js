// Importa as diferentes cenas do jogo
import StartScene from "./startScene.js";
import ChooseCharacter from "./chooseCharacter.js";
import ChoosePhase from "./ChoosePhase.js";
import Phase1 from "./phases/phase1/phase1.js";
import Trivia from "./trivia.js";
import Phase2 from "./phases/phase2/phase2.js";
import Phase3 from "./phases/phase3/phase3.js";

export const gameState = {
  // Declara variáveis e constantes compartilhadas globalmente
  width: 960, // Largura da tela do jogo
  height: 540, // Altura da tela do jogo
  player: "", // Armazena jogador selecionado
  phase: 1, // Fase atual do jogo
  isGameInit: false, // variável de controle indicando se o jogo está inicializado
  isGamePause: false, // variável de controle indicando se o jogo está pausado
  playerVelocityX: 300,
  soundPlaying: true, // variável de controle indicando se o som do jogo eswtá sendo exeutado
  triviaResult: null, // null: no answer, true: correct, false: wrong
  triviaAnswered: false, // variável de controle indicando se a pergunta de trivia foi respondida
  collidedObject: null, // This will hold the instance that the player collided with
  storedVelocity: null, // This will hold the velocity of the player when it collides with an object
  currentTriviaIndex: 0, // This will hold the index of the current trivia
  jumpButton: false, // Initialize jumpButton in the Player class
  downButton: false, // Initialize downButton in the Player class
};

// configurações do jogo
const config = {
  type: Phaser.AUTO, // Tipo de renderização automática
  width: gameState.width, // Largura da tela conforme definido no gameState
  height: gameState.height, // Altura da tela conforme definido no gameState
  physics: {
    default: "arcade", // Tipo de motor de física padrão: arcade
    arcade: {
      gravity: { y: 800 }, // Configura a gravidade do jogo
      debug: false, // Define se o modo de depuração está ativado ou desativado
    },
  },
  pixelArt: true, // Configura para usar arte de pixel
  scale: {
    mode: Phaser.Scale.SMOOTH,
    // CENTER_BOTH: Dimensiona o conteúdo para que ele seja centralizado tanto horizontal quanto verticalmente na tela. **Funciona bem**
    // CENTER_HORIZONTALLY: Dimensiona o conteúdo para que ele seja centralizado apenas horizontalmente na tela, mantendo sua posição vertical.
    // CENTER_VERTICALLY: Dimensiona o conteúdo para que ele seja centralizado apenas verticalmente na tela, mantendo sua posição horizontal.
    // ENVELOP: Dimensiona o conteúdo para que ele preencha a tela inteira, mantendo a proporção original e cortando qualquer excesso que não caiba na tela.
    // FIT: Dimensiona o conteúdo para que ele preencha a tela inteira, mantendo sua proporção original e sem cortar nenhum conteúdo.
    // HEIGHT_CONTROLS_WIDTH: A altura do conteúdo controla a largura da tela, mantendo a proporção original.
    // WIDTH_CONTROLS_HEIGHT: A largura do conteúdo controla a altura da tela, mantendo a proporção original.
    // LANDSCAPE: Mantém a orientação da tela em paisagem, independentemente da orientação do dispositivo. **muito bom**
    // PORTRAIT: Mantém a orientação da tela em retrato, independentemente da orientação do dispositivo.
    // SMOOTH: Tenta manter as proporções a todo custo e redimensiona o conteúdo (quando há necessidade) de forma sutil.**muito bom**
  },
  scene: [StartScene, ChooseCharacter, ChoosePhase, Phase1, Trivia, Phase2, Phase3], // cenas do jogo
};

// Cria uma nova instância do jogo Phaser com as configurações definidas anteriormente
const game = new Phaser.Game(config);
