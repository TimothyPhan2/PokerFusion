import React, { useState } from "react";
import { motion } from "framer-motion";
// Assuming you have a Card component or similar
// import Card from './Card';
import { Emojis } from "../../../../shared/Emojis";
import { useGameConfigStore } from "../../stores/gameConfigStore";
import { Tooltip } from "react-tooltip";

interface PlayerPositionProps {
  x: number; 
  y: number;
  playerName: string;
  playerChips: number;
  playerPosition: string;
  playerState: string;
  playerCards: string[]; 
  showCards: boolean;
  isBettingTurn: boolean; 
  playerGamesPlayed: number;
}
interface EmojiProps {
  id: string;
  username: string;
  emoji: keyof typeof Emojis;
  url: string;
}
const PlayerPosition: React.FC<PlayerPositionProps> = ({
  x,
  y,
  playerName,
  playerChips,
  playerPosition,
  playerState,
  playerCards,
  showCards,
  isBettingTurn,
  playerGamesPlayed,
}) => {
  const style = {
    top: `${50 + y * 50}%`,
    left: `${50 + x * 50}%`,
  };

  const [selectedEmoji, setSelectedEmoji] = useState<EmojiProps | null>(null);
  const [emojiSound, setEmojiSound] = useState("");
  const emojiTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { store } = useGameConfigStore();
  const [playerImage, setPlayerImage] = React.useState<string | null>(null);

React.useEffect(() => {
  let isMounted = true;
  store.getPlayerImage(playerName)
    .then((img) => {
      if (isMounted) setPlayerImage(img);
    })
    .catch(() => {
      if (isMounted) setPlayerImage(null);
    });

  return () => {
    isMounted = false; // avoid setting state if component unmounts
  };
}, [store, playerName]);

  React.useEffect(() => {
    const handleDisplayEmoji = (data: { username: string; emoji: string }) => {
      console.log("Received display_emoji event:", data);

      if (!data.username || !data.emoji) {
        console.warn("Received incomplete emoji data:", data);
        return;
      }

      if (!(data.emoji in Emojis)) {
        console.warn(`Received unknown emoji key: ${data.emoji}`);
        return;
      }
      if (data.username === playerName) {
        const validKey = data.emoji as keyof typeof Emojis;

        const newEmoji: EmojiProps = {
          id: `${data.username}-${validKey}-${Date.now()}`,
          username: data.username,
          emoji: validKey,
          url: Emojis[validKey].img,
        };

        // Clear any existing timeout for the previous emoji display
        if (emojiTimeoutRef.current) {
          clearTimeout(emojiTimeoutRef.current);
        }

        setSelectedEmoji(newEmoji);
        setEmojiSound(`/emoji/` + validKey + `.mp3`);
        // Set a new timeout to clear this emoji after the duration
        emojiTimeoutRef.current = setTimeout(() => {
          // Check if the emoji currently displayed is the one this timeout was set for
          setSelectedEmoji((prev) => (prev?.id === newEmoji.id ? null : prev));
          setEmojiSound("");
          emojiTimeoutRef.current = null; // Clear the ref
        }, 2500);
      }
    };

    console.log("GameTableScreen: Subscribing to display_emoji");
    store.socket.on("display_emoji", handleDisplayEmoji);

    return () => {
      console.log("GameTableScreen: Unsubscribing from display_emoji");
      store.socket.off("display_emoji", handleDisplayEmoji);
      // Clear timeout on component unmount or effect re-run
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
      }
    };
  }, []);
  return (
    <motion.div
      data-tooltip-id="my-tooltip"
      data-tooltip-content={
        "Games Played: " + (playerGamesPlayed ? playerGamesPlayed : "0")
      }
      className="player-position"
      style={style} // Apply dynamic style for positioning
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tooltip id="my-tooltip" />
      {/* Add betting-turn class conditionally */}
      <div className={`player-info ${isBettingTurn ? "betting-turn" : ""}`}>
        <div className="player-avatar aspect-square">
          <img
            className="max-w-[5rem] p-2 aspect-square rounded-full"
            src={playerImage ||  "/logo/1.png"}
            alt={playerName.charAt(0).toUpperCase()}
            onError={(e) => (e.currentTarget.src = "/logo/1.png")}
          />
        </div>
        <div className="player-name">{playerName}</div>
        <div className="player-chips">${playerChips}</div>
        {/* Display position text if available */}

        {playerPosition.toLowerCase() !== "regular" && (
          <div className="player-position-text">{playerPosition}</div>
        )}

        {playerState !== "active" && playerState !== "betting" && (
          <div className="player-position-text text-xl text-[#c9FF2e]">
            {playerState}
          </div>
        )}
      </div>
      {selectedEmoji && (
        <div
          key={selectedEmoji.id}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translate(0, -80%)",
            zIndex: 150,
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            color: "white",
          }}
        >
          <img
            src={`/emoji/` + selectedEmoji?.emoji + `.png`}
            alt={selectedEmoji?.emoji}
            className="emote"
            style={{
              display: "block",
              margin: "0 auto 5px auto",
            }}
          />
          <audio
            src={emojiSound}
            autoPlay
            ref={(audio) => audio && (audio.volume = 1.0)}
          /> 
        </div>
      )}
      {playerCards && playerCards.length > 0 && (
        <div className="player-cards">
          {playerCards.map((card, index) => (
            <div key={index} className="player-card">
              <img
                src={`/cards/${showCards ? card : "blue_back"}.png`}
                alt={showCards ? card : "Card Back"}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PlayerPosition;
