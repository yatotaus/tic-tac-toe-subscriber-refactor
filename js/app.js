import View from "./view.js";
import Store from "./store.js";

// Our players "config" - defines icons, colors, name, etc.
const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

// MVC pattern
function init() {
  const view = new View();
  const store = new Store("t3-storage-key", players);

  function initView() {
    view.closeAll();

    view.clearMoves();
    view.setTurnIndicator(store.game.currentPlayer);

    view.updateScoreboard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
    view.initializeMoves(store.game.moves);
  }

  view.bindGameResetEvent((event) => {
    store.reset();
    initView();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
    initView();
  });

  window.addEventListener("storage", () => {
    initView();
  });

  initView();

  view.bindPlayerNew((square) => {
    const clickedSquare = event.target;

    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }
    view.handlerPlayerMove(square, store.game.currentPlayer);

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);

    if (store.game.status.isComplete) {
      view.openModal(
        store.game.status.winner
          ? `${store.game.status.winner.name} wins!`
          : "Tie!"
      );
      return;
    }

    view.setTurnIndicator(store.game.currentPlayer);
  });
}

window.addEventListener("load", init);
