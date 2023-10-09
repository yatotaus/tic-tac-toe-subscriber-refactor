import React from "react";
import "./App.css";
import classNames from "../node_modules/classnames/index";
import { useLocalStorage } from "./useLocalStorage";

// Component imports
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import Menu from "./components/Menu";
import { GameState, Player } from "./types";

import { deriveGame, deriveStats } from "./utils";

export default function App() {
  /* Without local storage
  const [state, setState] = useState<GameState>({
    currentGameMoves: [],
    history: {
      currentRoundGames: [],
      allGames: [],
    },
  });
  */

  const [state, setState] = useLocalStorage<GameState>("game-state-key", {
    currentGameMoves: [],
    history: {
      currentRoundGames: [],
      allGames: [],
    },
  });

  const game = deriveGame(state);
  const stats = deriveStats(state);

  console.log("🚀 ~ file: App.tsx:129 ~ App ~ stats:", stats);

  const handlerPlayerMove = (squareId: number, player: Player) => {
    setState((prev) => {
      const { currentGameMoves } = structuredClone(prev);

      currentGameMoves.push({
        player,
        squareId,
      });

      return {
        ...prev,
        currentGameMoves,
      };
    });
  };

  const resetGame = (isNewRound: boolean) => {
    setState((prevState) => {
      const stateCopy = structuredClone(prevState);
      // If game is complete, archive it to history object
      if (game.status.isComplete) {
        const { moves, status } = game;
        stateCopy.history.currentRoundGames.push({
          moves,
          status,
        });
      }

      stateCopy.currentGameMoves = [];

      // Must archive current round in addition to resetting current game
      if (isNewRound) {
        stateCopy.history.allGames.push(...stateCopy.history.currentRoundGames);
        stateCopy.history.currentRoundGames = [];
      }

      return stateCopy;
    });
  };

  return (
    <>
      <main>
        <div className="grid">
          <div className={classNames("turn", game.currentPlayer.colorClass)}>
            <i
              className={classNames("fa-solid", game.currentPlayer.iconClass)}
            ></i>
            <p>{game.currentPlayer.name}, you're up!</p>
          </div>

          <Menu onAction={(action) => resetGame(action === "new-round")} />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((squareId) => {
            const existingMove = game.moves.find(
              (move) => move.squareId === squareId
            );

            return (
              <div
                key={squareId}
                className="square shadow"
                onClick={() => {
                  if (existingMove) return;
                  handlerPlayerMove(squareId, game.currentPlayer);
                }}
              >
                {existingMove && (
                  <i
                    className={classNames(
                      "fa-solid",
                      existingMove.player.colorClass,
                      existingMove.player.iconClass
                    )}
                  ></i>
                )}
              </div>
            );
          })}

          <div
            className="score shadow"
            style={{ backgroundColor: "var(--turquoise)" }}
          >
            <p>Player 1</p>
            <span>{stats.playerWithStats[0].wins} wins</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--light-gray)" }}
          >
            <p>Ties</p>
            <span>{stats.ties}</span>
          </div>
          <div
            className="score shadow"
            style={{ backgroundColor: "var(--yellow)" }}
          >
            <p>Player 2</p>
            <span>{stats.playerWithStats[1].wins} wins</span>
          </div>
        </div>
      </main>

      <Footer />
      {game.status.isComplete && (
        <Modal
          message={
            game.status.winner ? `${game.status.winner.name} wins!` : "Tie!"
          }
          onClick={() => resetGame(false)}
        />
      )}
    </>
  );
}
