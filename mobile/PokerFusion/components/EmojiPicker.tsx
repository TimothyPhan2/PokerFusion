import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Emojis } from "@shared/Emojis";
import { Image } from "expo-image";
interface EmojiPickerProps {
  onEmojiSelected: (emoji: string) => void;
}

const EMOJIS = Object.keys(Emojis);

const emojiImages = {
  laugh: require("../assets/images/emojis/laugh.png"),
  angry: require("../assets/images/emojis/angry.png"),
  poker_face: require("../assets/images/emojis/poker_face.png"),
  facepalm: require("../assets/images/emojis/facepalm.png"),
  yawn: require("../assets/images/emojis/yawn.png"),
  money_eyes: require("../assets/images/emojis/money_eyes.png"),
  smirk: require("../assets/images/emojis/smirk.png"),
  questioning: require("../assets/images/emojis/questioning.png"),

};
export default function EmojiPicker({ onEmojiSelected }: EmojiPickerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleEmojiPress = (emoji: string) => {
    onEmojiSelected(emoji);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.emojiButton}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiItem}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  {/* <Text style={styles.emojiText}>{emoji}</Text> */}
                  <Image
                    source={emojiImages[emoji as keyof typeof emojiImages]}
                    style={styles.emojiImage}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  emojiButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    // backgroundColor: "#2C3E50",
    borderRadius: 15,
    padding: 15,
    width: Dimensions.get("window").width * 0.8,
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emojiItem: {
    padding: 1,
    margin: 5,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  emojiImage: {
    width: 100,
    height: 100,
  },
  emojiText: {
    fontSize: 24,
  },
});
