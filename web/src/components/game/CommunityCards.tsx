import React from "react";
import { motion } from "framer-motion";
import { trace } from "console";

interface CommunityCardsProps {
  river: string[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ river }) => {
  return (
    <div className="community-cards">
      {river?.map(
        (card: string, i: number) =>
          i < 5 && (
            <motion.div
              key={i}
              className="card shadow-2xl"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              <img
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",

                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                src={`/cards/${card}.png`}
                alt={card}
              />
            </motion.div>
          )
      )}
    </div>
  );
};

export default CommunityCards;
