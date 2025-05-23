import React from "react";
import { motion } from "framer-motion";
import GameStats from "./GameStats";

interface GameHeaderProps {
  gameCode: string | undefined;
  gameData: any;
  onNextRound: () => void;
  saveAndEnd: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameCode,
  gameData,
  onNextRound,
  saveAndEnd,
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="header"
    >
      <div className="logo-container">
        <img
          src="/logo/poker-fusion-logo.png"
          alt="Logo"
          width={128}
          height={128}
        />
      </div>

      {/* Render GameStats in the middle if gameData exists */}
      {gameData && gameData.status !== "waiting" && (
        <GameStats
          gameData={gameData}
          onNextRound={onNextRound}
          saveAndEnd={saveAndEnd}
        />
      )}

      <div className="game-code">
        <span className="game-code-text">#{gameCode}</span>{" "}
      </div>
    </motion.div>
  );
};

export default GameHeader;
