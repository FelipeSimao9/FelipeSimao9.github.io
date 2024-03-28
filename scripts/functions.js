// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "./main.js";

// Função para carregar sprites, textos e botões
export function loadSpritesTxtsBtns(scene) {
  // Carrega imagens para os botões e textos do jogo
  scene.load.image("homeBtn", "../assets/game/texts/homeBtn.png"); // Carrega o botão para retornar à tela inicial
  scene.load.image("pauseBtn", "../assets/game/texts/pauseBtn.png"); // Carrega o botão para pause partida
  scene.load.image("soundBtn", "../assets/game/texts/soundBtn.png"); // Carrega o botão para parar a música partida
  scene.load.image("nextPhaseBtn", "../assets/game/texts/nextPhaseBtn.png"); // Carrega o botão para retornar à tela inicial
  scene.load.image("winGameTxt1", "../assets/game/texts/winGameTxt1.png"); // Carrega o botão para reiniciar partida
  scene.load.image("winGameTxt2", "../assets/game/texts/winGameTxt2.png"); // Carrega o botão para reiniciar partida
}

// Função para vencer o jogo
export function winGame(
  context,
  sceneStart,
  winGameTxt1,
  winGameTxt2,
  homeBtn,
  player,
  pauseBtn,
  nextPhaseBtn = null
) {
  // Define um temporizador para iniciar a próxima fase após um período de tempo
  setTimeout(() => {
    context.scene.start(sceneStart); // Inicia a próxima cena após certo período de tempo
  }, 10000); // Período de 10 segundos (10000 milissegundos)

  // Para o movimento do jogador e inicia uma animação de inatividade
  player.setVelocity(0); // Define a velocidade do jogador como zero
  player.body.setAllowGravity(false); // Define a velocidade do jogador como zero
  player.anims.play(gameState.player + "Idle", true); // Inicia uma animação de inatividade do jogador

  // Posiciona e exibe os botões e elementos de mensagem de vitória
  homeBtn.x = gameState.phase == 3 ? gameState.width / 2 : 570; // Define a posição x do botão "Home"
  homeBtn.y = gameState.height / 2 + 140; // Define a posição y do botão "Home"

  // Atualiza o número da fase do jogo
  if (/\d/.test(sceneStart)) gameState.phase = parseInt(sceneStart.slice(-1)); // Obtém o número da fase a partir do nome da próxima cena

  pauseBtn.setVisible(false); // Torna o botão "Home" visível
  homeBtn.setVisible(true); // Torna o botão "Home" visível
  winGameTxt1.setVisible(true); // Torna o texto/imagem de vitória 1 visível
  winGameTxt2.setVisible(true); // Torna o texto/imagem de vitória 2 visível
  if (nextPhaseBtn != null) nextPhaseBtn.setVisible(true); // Torna o botão de próxima fase visível
}

// Função que encerra o jogo
export function endGame(
  scene,
  player,
  homeBtn,
  pauseBtn,
  shakeCam = false
) {
  if (shakeCam) scene.cameras.main.shake(240, 0.01);

  scene.anims.pauseAll(); // pausa todas animações
  scene.physics.pause(); // pausa toda a física do jogo
  player.setTint(0xff0000); // pintar o mago de vermelho

  pauseBtn.setVisible(false); // Torna o botão de pausar invisível
  homeBtn.x = 570; // Reposiciona e torna visível o botão de retorno à tela inicial
  homeBtn.y = gameState.height / 2;
  homeBtn.setVisible(true);
}

// Função para reiniciar o jogo
export function restartGame(scene, player, homeBtn, pauseBtn, postionX, postionY, velocity) {
  // Reposiciona o jogador para a posição inicial
  player.setPosition(postionX, postionY);
  player.setVelocity(velocity); // Define a velocidade inicial do jogador

  scene.anims.resumeAll(); // retorna a reprodução das animações
  scene.physics.resume(); // retorna a física do jogo
  player.setTint(0xffffff); // volta à cor original do mago

  pauseBtn.setVisible(false); // Torna o botão de pausar invisível
  homeBtn.setVisible(false); // Torna o botão de retorno à tela inicial invisível
}

export function pauseGame(scene, soundBtn, player, homeBtn) {
  gameState.isGamePause = !gameState.isGamePause;
  if (gameState.isGamePause) {
    console.log(
      `Jogador - X: ${player.x.toFixed(2)} Y: ${player.y.toFixed(2)}`
    );
    console.log("pausar");
    soundBtn.setVisible(true); // Torna o botão de controle do som do jogo inicial visível

    homeBtn.setVisible(true).setScale(1); // Torna o botão de controle do som do jogo inicial visível
    homeBtn.x = gameState.width - 240; // Reposiciona e torna visível o botão de retorno à tela inicial
    homeBtn.y = 60;

    scaleElement("over", homeBtn, 1.1);
    scaleElement("out", homeBtn, 1);

    if (player.anims.currentAnim.key == gameState.player + "Squat") {
      player.setY(player.y - 20);
    }

    player.anims.play(gameState.player + "Idle", true);
    player
      .setSize(
        gameState.player == "celsinho" ? 115 : 100,
        gameState.player == "celsinho" ? 180 : 150
      )
      .setOffset(0, 15);
    scene.physics.pause(); // pausa toda a física do jogo
  } else {
    console.log("play");

    player.setVelocity(gameState.playerVelocityX); // Define a velocidade inicial do jogador

    scene.anims.resumeAll(); // retorna a reprodução das animações
    scene.physics.resume(); // retorna a física do jogo

    soundBtn.setVisible(false); // Torna o botão de controle do som do jogo inicial invisível
    homeBtn.setVisible(false).setScale(1.35); // Torna o botão de controle do som do jogo inicial visível
    homeBtn.x = gameState.width / 2 + 100; // Reposiciona e torna visível o botão de retorno à tela inicial
    homeBtn.y = gameState.height / 2;

    scaleElement("over", homeBtn, 1.5);
    scaleElement("out", homeBtn, 1.35);
  }
}

export function soundGame(scene, soundBtn) {
  gameState.soundPlaying = !gameState.soundPlaying;
  console.log("sound: " + gameState.soundPlaying);
  soundBtn.setTint(gameState.soundPlaying ? "0xffffff" : "0x858585"); // Define uma cor de tonalidade cinza para o botão
}

// Função para ajustar a escala de um elemento em resposta a um evento de ponteiro
export function scaleElement(event, element, scale) {
  // Define um manipulador de eventos para um tipo específico de evento de ponteiro
  element.on("pointer" + event, () => {
    element.setScale(scale); // Quando o evento é acionado, ajusta a escala do elemento para o valor especificado
  });
}
