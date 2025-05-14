import {
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import React from "react";
import { useGameStore } from "@/stores/game";
import { useAuthStore } from "@/stores/auth";
import EmojiPicker from "./EmojiPicker";
import Colors from "../constants/Colors"; // Assuming Colors.utility.shadow exists
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
const cardImages: { [key: string]: ImageSourcePropType } = {
  // ... (keep your cardImages object as is)
  // Spades
  AS: require("../assets/images/cards/AS.png"),
  KS: require("../assets/images/cards/KS.png"),
  QS: require("../assets/images/cards/QS.png"),
  JS: require("../assets/images/cards/JS.png"),
  "10S": require("../assets/images/cards/10S.png"),
  "9S": require("../assets/images/cards/9S.png"),
  "8S": require("../assets/images/cards/8S.png"),
  "7S": require("../assets/images/cards/7S.png"),
  "6S": require("../assets/images/cards/6S.png"),
  "5S": require("../assets/images/cards/5S.png"),
  "4S": require("../assets/images/cards/4S.png"),
  "3S": require("../assets/images/cards/3S.png"),
  "2S": require("../assets/images/cards/2S.png"),
  // Hearts
  AH: require("../assets/images/cards/AH.png"),
  KH: require("../assets/images/cards/KH.png"),
  QH: require("../assets/images/cards/QH.png"),
  JH: require("../assets/images/cards/JH.png"),
  "10H": require("../assets/images/cards/10H.png"),
  "9H": require("../assets/images/cards/9H.png"),
  "8H": require("../assets/images/cards/8H.png"),
  "7H": require("../assets/images/cards/7H.png"),
  "6H": require("../assets/images/cards/6H.png"),
  "5H": require("../assets/images/cards/5H.png"),
  "4H": require("../assets/images/cards/4H.png"),
  "3H": require("../assets/images/cards/3H.png"),
  "2H": require("../assets/images/cards/2H.png"),
  // Diamonds
  AD: require("../assets/images/cards/AD.png"),
  KD: require("../assets/images/cards/KD.png"),
  QD: require("../assets/images/cards/QD.png"),
  JD: require("../assets/images/cards/JD.png"),
  "10D": require("../assets/images/cards/10D.png"),
  "9D": require("../assets/images/cards/9D.png"),
  "8D": require("../assets/images/cards/8D.png"),
  "7D": require("../assets/images/cards/7D.png"),
  "6D": require("../assets/images/cards/6D.png"),
  "5D": require("../assets/images/cards/5D.png"),
  "4D": require("../assets/images/cards/4D.png"),
  "3D": require("../assets/images/cards/3D.png"),
  "2D": require("../assets/images/cards/2D.png"),
  // Clubs
  AC: require("../assets/images/cards/AC.png"),
  KC: require("../assets/images/cards/KC.png"),
  QC: require("../assets/images/cards/QC.png"),
  JC: require("../assets/images/cards/JC.png"),
  "10C": require("../assets/images/cards/10C.png"),
  "9C": require("../assets/images/cards/9C.png"),
  "8C": require("../assets/images/cards/8C.png"),
  "7C": require("../assets/images/cards/7C.png"),
  "6C": require("../assets/images/cards/6C.png"),
  "5C": require("../assets/images/cards/5C.png"),
  "4C": require("../assets/images/cards/4C.png"),
  "3C": require("../assets/images/cards/3C.png"),
  "2C": require("../assets/images/cards/2C.png"),
};

// --- Adjust Card Size ---
const CARD_WIDTH = Dimensions.get("window").width * 0.6; // Increased width
const CARD_HEIGHT = CARD_WIDTH * 2; // Maintain aspect ratio (standard poker card ratio is ~1.4)

// --- Calculate Overlap ---
const HORIZONTAL_OFFSET = CARD_WIDTH * 0.15; // Overlap by 15% of card width
const VERTICAL_OFFSET = CARD_HEIGHT * 0.05; // Slight vertical offset

// --- Calculate Container Dimensions Needed ---
const CONTAINER_WIDTH = CARD_WIDTH + HORIZONTAL_OFFSET;
const CONTAINER_HEIGHT = CARD_HEIGHT + VERTICAL_OFFSET;

const styles = StyleSheet.create({
  gameAreaContainer: {
    flex: 1,
  },
  // This container centers the cardContainer and playerInfoContainer
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiPickerContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 10, // Ensure emoji picker is above cards
  },
  // This container holds the two overlapping cards and is itself centered
  cardContainer: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    bottom: 40,
  },
  cardImage: {
    position: "absolute", // Position cards absolutely within cardContainer
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: "contain",
    borderRadius: 12,
    // Ensure Colors.utility.shadow is defined in your Colors file
    shadowColor: Colors?.utility?.shadow || "#000", // Provide a fallback shadow color
    shadowOffset: { width: 0, height: 4 }, // Slightly larger shadow
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  // Specific styles for each card's position
  cardOneStyle: {
    top: VERTICAL_OFFSET, // Push down slightly
    left: 0,
    zIndex: 1, // Lower card
  },
  cardTwoStyle: {
    top: 0,
    left: HORIZONTAL_OFFSET, // Push right for overlap
    zIndex: 2, // Upper card
  },
  playerInfoContainer: {
    width: "120%",
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(44, 56, 85, 0.6)',
    borderRadius: 15,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playerInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  playerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoIcon: {
    
    color: "#ffd33d",
    marginRight: 8,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#4CAF50", // Default green color, will be dynamically set
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default function GameArea() {
  const { data, socket } = useGameStore();
  const authState = useAuthStore((state) => state.isAuthenticated);
  const username = authState?.user?.username;

  const playerCards =
    data?.players?.find(
      (player: { username: string | undefined }) => player.username === username
    )?.cards || [];

  const playerChips = data?.players?.find(
    (player: { username: string | undefined }) => player.username === username
  )?.chips;

  const playerStatus = data?.players?.find(
    (player: { username: string | undefined }) => player.username === username
  )?.state;

  const playerPosition = data?.players?.find(
    (player: { username: string | undefined }) => player.username === username
  )?.position;

  // Handle emoji selection
  const handleEmojiSelected = (emoji: string) => {
    console.log("Selected emoji:", emoji);
    if (socket && data?.gameId && username) {
      // Check username too
      const payload = {
        gameId: data.gameId,
        emoji,
        username,
      };
      socket.emit("send_emoji", payload);
      console.log("Sent emoji via WebSocket:", payload);
    } else {
      console.log("Cannot send emoji: Socket, gameId, or username missing.");
      console.log("Socket:", socket ? "Exists" : "Missing");
      console.log("Game ID:", data?.gameId || "Missing");
      console.log("Username:", username || "Missing");
    }
  };

  // Get status badge color based on player status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "betting":
        return "#FFC107"; // Amber
      case "folded":
        return "#F44336"; // Red
      case "all-in":
        return "#2196F3"; // Blue
      case "out":
        return "#9C27B0"; // Purple
      default:
        return "#4CAF50"; // Green (default)
    }
  };

  // Ensure we only try to render if we have exactly two cards for this layout
  const canRenderCards = playerCards.length === 2;

  return (
    <View style={styles.gameAreaContainer}>
      {/* Use a dedicated container for centering */}
      <View style={styles.centerContainer}>
      <View style={styles.playerInfoContainer}>
          {/* Status Badge - Always visible at the top */}
          <View style={styles.playerInfoHeader}>
            <Text style={styles.infoLabel}>Your Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(playerStatus || "") }]}>
              <Text style={styles.statusText}>{playerStatus || "Waiting"}</Text>
            </View>
          </View>

          {/* Player Info Details */}
          <View style={styles.playerInfoRow}>
            {/* Chips Info */}
            <View style={styles.infoItem}>
            <MaterialCommunityIcons
                    name="poker-chip"
                    size={24}
                    style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Chips</Text>
                <Text style={styles.infoValue}>{playerChips !== undefined ? playerChips : "-"}</Text>
              </View>
            </View>

            {/* Position Info */}
            <View style={styles.infoItem}>
            <MaterialIcons
                    name="person"
                    size={24}
                    style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Position</Text>
                <Text style={styles.infoValue}>{playerPosition || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Container - this View is now centered by its parent */}
        <View style={styles.cardContainer}>
          {/* Player cards - Render conditionally */}
          {canRenderCards && (
            <>
              <Image
                key={playerCards[0]} // Use card value as key if unique, otherwise index is fine
                source={cardImages[playerCards[0]]}
                style={[styles.cardImage, styles.cardOneStyle]}
              />
              <Image
                key={playerCards[1]}
                source={cardImages[playerCards[1]]}
                style={[styles.cardImage, styles.cardTwoStyle]}
              />
            </>
          )}
          {/* Optionally show a placeholder or message if cards aren't ready */}
          {!canRenderCards && (
            <View /* Optional: Placeholder style */>
              {/* <Text style={{ color: "white" }}>Waiting for cards...</Text> */}
            </View>
          )}
        </View>
        
      </View>

      {/* Emoji picker button - Outside the centering container */}
      <View style={[styles.emojiPickerContainer]}>
        <EmojiPicker onEmojiSelected={handleEmojiSelected} />
      </View>
    </View>
  );
}
