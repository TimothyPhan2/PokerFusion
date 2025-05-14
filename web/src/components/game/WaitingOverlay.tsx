import React from "react";
import { motion } from "framer-motion";
import { useGameConfigStore } from "../../stores/gameConfigStore";

interface WaitingOverlayProps {
  gameData: any;
  gameCode: string;
  onStartGame: () => void;
}

const WaitingOverlay: React.FC<WaitingOverlayProps> = ({
  gameData,
  gameCode,
  onStartGame,
}) => {
  const { store } = useGameConfigStore();

  if (gameData && gameData.status !== "waiting") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overlay flex-col"
    >
      <div className="game-code bg-none shadow-none mb-4 w-[80%] flex justify-center justify-self-center">
        <span className="game-code-text">Game Code: {gameCode}</span>
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="overlay-content"
      >
        <div className="mb-4">
          <h3 className="text-xl text-white mb-3">
            Joined Players: {gameData && "(" + gameData.players.length + ")"}
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {gameData?.players.map((p: any) => (
              <motion.button
                key={p.username}
                className="button"
                onClick={() => store.deletePlayerFromGame(p.username)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p.username}
              </motion.button>
            ))}
          </div>
        </div>

        {gameData && gameData.players.length >= 2 && (
          <motion.button
            className="start-button"
            onClick={onStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WaitingOverlay;
