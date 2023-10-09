import type { Game, GameState, Move, Player } from "./types";
import type Store from "./store";

export default class View {
  $: Record<string, Element> = {};
  $$: Record<string, NodeListOf<Element>> = {};

  constructor() {
    this.$.menu = this.#qs('[data-id="menu"]');
    this.$.menuItems = this.#qs('[data-id="menu-items"]');
    this.$.menuBtn = this.#qs('[data-id="menu-btn"]');
    this.$.resetBtn = this.#qs('[data-id="reset-btn"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.modal = this.#qs('[data-id="modal"]');
    this.$.modalText = this.#qs('[data-id="modal-text"]');
    this.$.modalBtn = this.#qs('[data-id="modal-btn"]');
    this.$.turn = this.#qs('[data-id="turn"]');
    this.$.p1Wins = this.#qs('[data-id="p1-wins"]');
    this.$.p2Wins = this.#qs('[data-id="p2-wins"]');
    this.$.ties = this.#qs('[data-id="ties"]');
    this.$.grid = this.#qs('[data-id="grid"');

    this.$$.squares = this.#qsAll('[data-id="square"]');

    //UI-only event listeners
    this.$.menuBtn.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  render(game: Store["game"], stats: Store["stats"]) {
    const { playerWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner },
    } = game;

    this.#closeAll();
    this.#clearMoves();
    this.#updateScoreboard(
      playerWithStats[0].wins,
      playerWithStats[1].wins,
      ties
    );
    this.#initializeMoves(moves);

    if (isComplete) {
      this.#openModal(winner ? `${winner.name} wins!` : "Tie!");
      return;
    }
    this.#setTurnIndicator(currentPlayer);
  }

  /**
   *
   * Register all the event listeners
   */

  bindGameResetEvent(handler: EventListener) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler: EventListener) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerNew(handler: (el: Element) => void) {
    this.#delegate(this.$.grid, '[data-id="square"]', "click", handler);
  }

  /**
   * DOM helper methods
   */

  #updateScoreboard(p1Wins: number, p2Wins: number, ties: number) {
    this.$.p1Wins.textContent = `${p1Wins} wins`;
    this.$.p2Wins.textContent = `${p2Wins} wins`;
    this.$.ties.textContent = `${ties} ties`;
  }

  #openModal(message: string) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.textContent = message;
  }

  #closeAll() {
    this.#closeModal();
    this.#closeMenu();
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #clearMoves() {
    this.$$.squares.forEach((square) => {
      square.replaceChildren();
    });
  }

  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuBtn.classList.remove("border");

    const icon = this.#qs("i", this.$.menuBtn);

    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.#qs("i", this.$.menuBtn);

    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  #handlerPlayerMove(squareEl: Element, player: Player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colorClass);
    squareEl.replaceChildren(icon);
  }

  #initializeMoves(moves: Move[]) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);

      if (existingMove) {
        this.#handlerPlayerMove(square, existingMove.player);
      }
    });
  }

  #setTurnIndicator(player: Player) {
    const icon = document.createElement("i");
    const label = document.createElement("p");

    icon.classList.add("fa-solid", player.colorClass, player.iconClass);

    label.classList.add(player.colorClass);
    label.innerText = `${player.name}, you're up!`;

    this.$.turn.replaceChildren(icon, label);
  }

  //private
  #qs(selector: string, parent?: Element) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) throw new Error("Could not find elements");

    return el;
  }

  //private
  #qsAll(selector: string) {
    const elList = document.querySelectorAll(selector);

    if (!elList) throw new Error("Could not find elements");

    return elList;
  }

  /**
   * Rather than registering event listeners on every child element in our Tic Tac Toe grid, we can
   * listen to the grid container and derive which square was clicked using the matches() function.
   *
   * @param {*} el the "container" element you want to listen for events on
   * @param {*} selector the "child" elements within the "container" you want to handle events for
   * @param {*} eventKey the event type you are listening for (e.g. "click" event)
   * @param {*} handler the callback function that is executed when the specified event is triggered on the specified children
   */
  #delegate(
    el: Element,
    selector: string,
    eventKey: string,
    handler: (el: Element) => void
  ) {
    el.addEventListener(eventKey, (event) => {
      if (!(event.target instanceof Element)) {
        throw new Error("Event target not found");
      }
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
