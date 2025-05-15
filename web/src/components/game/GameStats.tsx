import React from "react";
import { motion } from "framer-motion";

interface GameStatsProps {
  gameData: any;
  onNextRound: () => void;
  saveAndEnd: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({
  gameData,
  onNextRound,
  saveAndEnd,
}) => {
  if (!gameData) return null;

  const isEndOfRound =
    gameData.state.includes("Game Over:") ||
    gameData.state.includes("Final:") ||
    gameData.state.includes("by default");

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`game-stats ${isEndOfRound ? "game-stats-end-round" : ""}`}
    >
      {isEndOfRound ? (
        <>
          <div className="winner-info">
            {gameData.latestMove && (
              <p key={JSON.stringify(gameData.latestMove)}>
                <audio src="/music/ding-effect.mp3" autoPlay />
                {gameData.latestMove}
              </p>
            )}
            <h1 className="game-state">{gameData.state}</h1>{" "}
          </div>
          {gameData.state.includes("Game Over:") ? (
            <motion.button
              onClick={saveAndEnd}
              className="start-button w-[35%]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              End Game
            </motion.button>
          ) : (
            <motion.button
              className="start-button w-[35%]"
              onClick={onNextRound}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
            </motion.button>
          )}
        </>
      ) : (
        <>
          {/* Pot Stat */}
          <div className="stat-item">
            <h3>Pot</h3> 
            <p key={`pot-${gameData.pot}`}>${gameData.pot}</p>{" "}
          </div>

          {/* Call/MinBet Stat */}
          <div className="stat-item">
            <h3>Call</h3>
            <p key={`minBet-${gameData.minBet}`}>${gameData.minBet}</p>{" "}
          </div>

          {/* Latest Move Stat */}
          <div className="stat-item">
            <h3>Latest</h3> {/* Use CSS class */}
            {gameData.latestMove ? (
              <p key={JSON.stringify(gameData.latestMove)}>
                <audio src="/music/ding-effect.mp3" autoPlay />
                {gameData.latestMove}
              </p>
            ) : (
              <p>-</p> // Placeholder
            )}
          </div>

          {/* Betting Turn Stat */}
          <div className="stat-item">
            <h3>Betting</h3>
            {gameData.turnQueue?.[0] ? (
              <p key={JSON.stringify(gameData.turnQueue[0])}>
                {gameData.turnQueue[0].username}
              </p>
            ) : (
              <p>-</p> // Placeholder
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GameStats;
