import React, { useEffect, useState, useCallback } from "react";
import "../../public/assets/styles/GameTable.css";
import "../../public/assets/styles/common.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameConfigStore } from "../../stores/gameConfigStore";
import WaitingOverlay from "../../components/game/WaitingOverlay";
import GameHeader from "../../components/game/GameHeader";
import CommunityCards from "../../components/game/CommunityCards";
import PlayerPosition from "../../components/game/PlayerPosition";
import { DoorOpenIcon, Volume2, VolumeX, X } from "lucide-react";
import { Tooltip } from "react-tooltip";

export function withRouter(Component: any) {
  return function ComponentWithRouterProp(props: any) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    return <Component {...props} router={{ params, location, navigate }} />;
  };
}

interface GameTableScreenProps {
  router: {
    params: {
      gameCode: string;
    };
    location: any;
    navigate: any;
  };
}

const GameTableScreen: React.FC<GameTableScreenProps> = ({ router }) => {
  const { gameCode } = router.params;
  const gameData = useGameConfigStore((state) => state.store.data);
  const { store } = useGameConfigStore();
  const navigate = useNavigate();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStartGame = async () => {
    store.startGame();
  };

  const handleNextRound = async () => {
    store.nextRound();
  };

  const handleSaveAndDelete = useCallback(async () => {
    try {
      await store.saveAndDelete();
      navigate("/");
    } catch (error) {
      console.error("Error saving and deleting game:", error);
    }
  }, [store, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const confirmationMessage =
        "If you exit now, your game state will be saved, but the game will end and become inaccessible.";

      const url = `/api/games/${gameCode}/saveAndDeleteBeacon`;
      const data = JSON.stringify({ reason: "unload" });

      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(url, data);
        if (!success) {
          console.error("sendBeacon failed to queue the request.");
        }
      } else {
        console.warn("navigator.sendBeacon is not supported.");
      }

      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameCode]);

  const playerPositions = Array.from(
    { length: Math.min(8, gameData ? gameData.players.length : 0) },
    (_, i) => {
      const angle = (i * Math.PI * 2) / 8;
      const x = Math.cos(angle) - 0.1;
      const y = Math.sin(angle) - 0.24;
      if (gameData) {
        const player = gameData.players[i];
        const isBettingTurn =
          gameData.turnQueue?.[0]?.username === player.username;

        return {
          x,
          y,
          playerGamesPlayed: player.profile && player.profile.games_played,
          playerName: player.username,
          playerChips: player.chips,
          playerPosition: player.position,
          playerState: player.state,
          playerCards: player.cards,
          showCards: gameData.state.includes("Showdown"),
          isBettingTurn: isBettingTurn ?? false,
        };
      }
      return {
        x,
        y,
        playerName: "Waiting...",
        playerChips: 0,
        playerPosition: "regular",
        playerState: "waiting",
        playerCards: [],
        showCards: false,
        isBettingTurn: false,
      };
    }
  );

  return (
    <>
      <WaitingOverlay
        gameData={gameData}
        gameCode={gameCode}
        onStartGame={handleStartGame}
      />
      {gameData && gameData.status !== "waiting" && (
        <audio
          src="/music/bg-track-1.mp3"
          loop
          autoPlay
          muted={!musicEnabled}
        />
      )}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-xl"
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
                CONFIRM
              </h2>
              <p className="mb-6 text-center text-gray-600">
                This action will save the current chip counts for all players
                and permanently delete this game session. Are you sure you want
                to continue?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleSaveAndDelete();
                  }}
                  className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                >
                  Confirm & End Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="screen-container"
      >
        <div className="game-container">
          <GameHeader
            gameCode={gameCode}
            gameData={gameData}
            onNextRound={handleNextRound}
            saveAndEnd={handleSaveAndDelete}
          />
          <div className="relative">
            <div className="absolute top-5 right-5 z-50 flex flex-col gap-2">
              <button
                data-tooltip-id="mute-tooltip"
                data-tooltip-content={
                  musicEnabled ? "Mute Music" : "Unmute Music"
                }
                className="game-option-button"
                onClick={() => setMusicEnabled(!musicEnabled)}
              >
                <Tooltip id="mute-tooltip" place="left" />
                {musicEnabled ? (
                  <Volume2 aria-label="Mute music" />
                ) : (
                  <VolumeX aria-label="Unmute music" />
                )}
              </button>

              <button
                data-tooltip-id="end-game-tooltip"
                data-tooltip-content="Save and End Game"
                className="game-option-button"
                onClick={() => setShowConfirmModal(true)}
              >
                <Tooltip id="end-game-tooltip" place="left" />
                <DoorOpenIcon aria-label="Save and End Game" />
              </button>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="poker-table"
          >
            <CommunityCards river={gameData?.river || []} />
            {playerPositions.map((pos, i) => (
              <PlayerPosition
                key={i}
                x={pos.x}
                y={pos.y + (i == 2 || i == 6 ? (i == 2 ? -0.25 : 0.15) : 0)}
                playerGamesPlayed={pos.playerGamesPlayed}
                playerName={pos.playerName}
                playerChips={pos.playerChips}
                playerPosition={pos.playerPosition}
                playerState={pos.playerState}
                playerCards={pos.playerCards}
                showCards={gameData?.state?.includes("Final:") || false}
                isBettingTurn={pos.isBettingTurn || false}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default withRouter(GameTableScreen);
