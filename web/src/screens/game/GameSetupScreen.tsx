import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../public/assets/styles/GameSetup.css";
import SharedLogo from "../../components/SharedLogo";
import SplashWrapper from "../../components/SplashWrapper";
import { useGameConfigStore } from "../../stores/gameConfigStore";
import { toast } from "react-toastify";

export default function GameSetupScreen() {
  const navigate = useNavigate();
  const { store } = useGameConfigStore();

  const [numPlayers, setNumPlayers] = useState(4);
  const [buyIn, setBuyIn] = useState(500);
  const [bigBlind, setBigBlind] = useState(30);
  const [smallBlind, setSmallBlind] = useState(15);
  const [privateGame, setPrivateGame] = useState(false);
  const handleCreateGame = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const ok = await store.createGame({
        gameId: code,
        smallBlind,
        bigBlind,
        initialChips: buyIn,
        status: "waiting",
        maxPlayers: numPlayers,
        private: privateGame,
      });
      if (ok) {
        const response = store.joinRoom(code);
        if (!response){
          toast.error("Something went wrong, please reload and try again")
          store.saveAndDeleteByCode(code)
          return
        }
        navigate(`/table/${code}`);
        return
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      alert(err);
    }
  };

  return (
    <SplashWrapper pauseMs={750}>
      <motion.div
        className="screen-container"
        initial={{ opacity: 0, y: "100%" }}
        animate={{
          opacity: 1,
          y: "5%",
          transition: { duration: 0.5 },
          scale: 1,
        }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      >
        <div className="setup-screen">
          <div className="setup-logo-container">
            <SharedLogo width={350} />
          </div>
          <div className="setup-card">
            <h2 className="setup-title">Game Setup</h2>
            <div className="form-section">
              {/* Max players */}
              <div>
                <label className="form-label">Max players: {numPlayers}</label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(+e.target.value)}
                  className="range-input"
                />
              </div>
              {/* Buy-in */}
              <div>
                <label className="form-label">Buy-In Amount</label>
                <input
                  type="number"
                  placeholder="500"
                  min={100}
                  onChange={(e) => setBuyIn(+e.target.value)}
                  className="text-input"
                />
              </div>
              {/* Blinds */}
              <div className="grid-2-cols">
                <div>
                  <label className="form-label">Big Blind</label>
                  <input
                    type="number"
                    placeholder="30"
                    onChange={(e) => setBigBlind(+e.target.value)}
                    className="text-input"
                  />
                </div>
                <div>
                  <label className="form-label">Small Blind</label>
                  <input
                    type="number"
                    placeholder="15"
                    onChange={(e) => setSmallBlind(+e.target.value)}
                    className="text-input"
                  />
                </div>
              </div>
              {/* Private toggle */}
              <button
                className="checkbox-container"
                onClick={() => setPrivateGame((prev) => !prev)}
              >
                <input
                  type="checkbox"
                  checked={privateGame}
                  onChange={(e) => setPrivateGame(e.target.checked)}
                  className="checkbox-input"
                />
                <label className="checkbox-label">Private Game?</label>
              </button>
            </div>
            <button onClick={handleCreateGame} className="create-button">
              Create Game
            </button>
          </div>
        </div>
      </motion.div>
    </SplashWrapper>
  );
}
