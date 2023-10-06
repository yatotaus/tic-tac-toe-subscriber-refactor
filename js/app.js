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

  view.bindGameResetEvent((event) => {
    store.reset();
    view.render(store.game, store.stats);
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
    view.render(store.game, store.stats);
  });

  window.addEventListener("storage", () => {
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindPlayerNew((square) => {
    const clickedSquare = event.target;

    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);
    view.render(store.game, store.stats);
  });
}

window.addEventListener("load", init);
