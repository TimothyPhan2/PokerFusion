import {
  TextInput,
  SafeAreaView,
  Button,
  StyleSheet,
  Modal,
  View,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
// import Axios from "axios";
// import config from "../../config.json";
import { GameController } from "@/controllers/game";
import { useAuthStore } from "@/stores/auth";
import { useGameStore } from "@/stores/game";
import GameControls from "@/components/GameControls";
import GameArea from "@/components/GameArea";
import Colors from "../../constants/Colors";
import { useLocalSearchParams } from "expo-router";

export default function Game() {
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const [gameCode, setGameCode] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { initialize, disconnect, inGame, leaveGame, data, socket } =
    useGameStore();
  const [modalVisible, setModalVisible] = useState(false);

  const username = isAuthenticated.user?.username;

  // Sets game code from params
  useEffect(() => {
    if (gameId) {
      setGameCode(gameId);
      console.log("Game code set to:", gameId);
    }
  }, [gameId]);
  // Initialize socket when component mounts
  useEffect(() => {
    initialize();
    console.log("Initialized socket");

    // Cleanup socket when component unmounts
    return () => {
      disconnect();
    };
  }, []);

  // Displays waiting modal
  useEffect(() => {
    console.log("testing", inGame);
    if (inGame) {
      setModalVisible(true);
    }
  }, [inGame]);
  const handleSubmit = async () => {
    try {
      console.log("Auth state:", isAuthenticated);
      await GameController.handleJoinGame(gameCode, username!);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {data ? (
        data.status === "waiting" ? (
          <>
            {/* Waiting Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.modalText}>
                    Waiting for game to start...
                  </Text>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setModalVisible(false);
                      leaveGame(gameCode, username!);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </>
        ) : data.status === "in_progress" ? (
          <View style={styles.gameContainer}>
            <View style={styles.gameContent}>
              <GameArea />
            </View>
            <View style={[styles.controlsContainer]}>
              <GameControls gameCode={gameCode} />
            </View>
          </View>
        ) : (
          <Text>Unknown game status: {data.status}</Text>
        )
      ) : (
        // No data yet, show the join game form
        <View style={styles.joinGameContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={gameCode}
              onChangeText={setGameCode}
              placeholder="Enter game code"
              style={styles.input}
              placeholderTextColor={Colors.text.gray}
            />
          </View>
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.joinButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={styles.joinButtonText}>Join Game</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.table.medium,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalContent: {
    backgroundColor: Colors.primary.dark,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.primary.light,
    minWidth: 250,
  },
  modalText: {
    marginVertical: 15,
    textAlign: "center",
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  gameContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
  },
  gameContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    width: "100%",
  },
  joinGameContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.text.white,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 56,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.light,
    backgroundColor: Colors.primary.dark,
    borderRadius: 12,
    color: Colors.text.white,
    fontSize: 16,
  },
  joinButton: {
    width: '100%',
    backgroundColor: Colors.action.blue.medium,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.utility.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: Colors.text.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
