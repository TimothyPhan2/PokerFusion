import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { useGameStore } from "@/stores/game";
import { useAuthStore } from "@/stores/auth";
import Colors from "../constants/Colors";

export default function GameControls({ gameCode }: { gameCode: string }) {
  const [isFaceDown, setIsFaceDown] = useState(false);

  const [betAmount, setBetAmount] = useState(0);
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [isAllInConfirmVisible, setIsAllInConfirmVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const { bet, data } = useGameStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const username = isAuthenticated.user?.username;
  const [controlsEnabled, setControlsEnabled] = useState<boolean>(true)
  const isPlayerTurn = data?.turnQueue?.[0]?.username === username;
  const currentPlayer = data.players.find((p: any) => p.username === username);
  const currentBet = currentPlayer?.bet ?? 0;
  // Face down detection (Fold action)
  useEffect(() => {
    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { z } = accelerometerData;
      // Check if the device is faced down
      setIsFaceDown(z > 0.8);
    });

    // Start the accelerometer
    Accelerometer.setUpdateInterval(100); // Update every 100ms

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isFaceDown && isPlayerTurn) {
      // Handle face-down action
      console.log("Device is faced down");
      bet(0, gameCode, "fold");
    } else {
      console.log("Device is not faced down or not player's turn");
    }
  }, [isFaceDown, isPlayerTurn]);

  const getCurrentPlayerBalance = (): number => {
    if (!data?.players || !username) return 0;
    return currentPlayer?.chips ?? 0;
  };

  const handleBet = async (
    amount: number,
    action: "check" | "call" | "raise" | "fold"
  ) => {
    try {      
      setControlsEnabled(false)
      setBetModalVisible(false);
      await bet(amount, gameCode, action);
      setControlsEnabled(true)

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  const handleQuickRaise = async () => {
    const minBet = data?.minBet || 0;
    console.log("Quick raise - minBet:", minBet);

    const totalBet = minBet * 2;
    const need = Math.max(0, totalBet - currentBet);
    const playerBalance = getCurrentPlayerBalance();
    console.log(
      "Quick raise - totalBet:",
      totalBet,
      "need:",
      need,
      "playerBalance:",
      playerBalance
    );

    if (playerBalance > 0 && need >= playerBalance) {
      console.log("Quick raise - All-in situation detected");
      setBetAmount(playerBalance);
      setIsAllInConfirmVisible(true);
      setBetModalVisible(false);
    } else {
      console.log("Quick raise - Regular raise with amount:", minBet);
      await handleBet(minBet, "raise");
    }
  };

  const handleCall = () => {
    const minBet = data?.minBet || 0;
    const playerBalance = getCurrentPlayerBalance();

    if (playerBalance > 0 && minBet >= playerBalance) {
      console.log("Call - All-in situation detected");
      setBetAmount(playerBalance);
      setIsAllInConfirmVisible(true);
      setBetModalVisible(false);
    } else {
      console.log("Call - Regular call with amount:", minBet);
      handleBet(minBet, "call");
    }
  };
  const handleSubmitCustomRaise = () => {
    if (!isPlayerTurn) {
      console.log("Custom raise - Not player's turn");
      return;
    }
    const playerBalance = getCurrentPlayerBalance();
    console.log(
      "Custom raise - playerBalance:",
      playerBalance,
      "betAmount:",
      betAmount
    );

    const minValidRaise = data?.minBet || 0;
    const amountNeeded = Math.max(0, betAmount - minValidRaise);
    console.log(
      "Custom raise - minValidRaise:",
      minValidRaise,
      "amountNeeded:",
      amountNeeded
    );

    if (betAmount < minValidRaise) {
      console.log("Custom raise - Below minimum raise");
      alert(`Minimum raise is ${minValidRaise}.`);
      return;
    }
    if (playerBalance > 0 && amountNeeded >= playerBalance) {
      console.log("Custom raise - All-in situation detected");
      setBetAmount(playerBalance);
      setIsAllInConfirmVisible(true);
      setBetModalVisible(false);
    } else {
      console.log("Custom raise - Regular raise with amount:", amountNeeded);
      handleBet(amountNeeded, "raise");
    }
  };

  const handleConfirmAllIn = () => {
    const playerBalance = getCurrentPlayerBalance();
    console.log("All-in confirmed - amount:", playerBalance);
    handleBet(playerBalance, "raise");
    setIsAllInConfirmVisible(false);
  };

  return (
    <View style={[styles.container]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={betModalVisible}
        onRequestClose={() => setBetModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setBetModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Place Your Bet</Text>
                <View style={styles.minBetContainer}>
                  <MaterialCommunityIcons
                    name="poker-chip"
                    size={20}
                    color="#ffd33d"
                  />
                  <Text style={styles.minBetText}>
                    Minimum: {data?.minBet || 0}
                  </Text>
                </View>
                <View style={styles.minBetContainer}>
                  <MaterialCommunityIcons
                    name="poker-chip"
                    size={20}
                    color="#ffd33d"
                  />
                  <Text style={styles.minBetText}>
                    Current Bet: {currentBet}
                  </Text>
                </View>

                <View style={styles.minBetContainer}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color="#ffd33d"
                  />
                  <Text style={styles.minBetText}>
                    Total Bet: {currentPlayer?.total_bet || 0}
                  </Text>
                </View>
              </View>

              <View style={styles.quickActionsContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    styles.checkButton,
                    pressed && styles.buttonPressed,
                    { flex: 1 },
                  ]}
                  onPress={() => handleBet(0, "check")}
                >
                  <Text style={styles.quickActionText}>Check</Text>
                </Pressable>
                {Math.max(0, (data?.minBet || 0) - currentBet) !== 0 && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.quickActionButton,
                      styles.callButton,
                      pressed && styles.buttonPressed,
                      { flex: 1 },
                    ]}
                    onPress={handleCall}
                  >
                    <Text style={styles.quickActionText}>
                      Call {Math.max(0, (data?.minBet || 0) - currentBet)}
                    </Text>
                  </Pressable>
                )}
                {Math.max(0, (data?.minBet || 0) - currentBet) !== 0 && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.quickActionButton,
                      styles.raiseButton,
                      pressed && styles.buttonPressed,
                      { flex: 1 },
                    ]}
                    onPress={handleQuickRaise}
                  >
                    <Text style={styles.quickActionText}>Raise 2x</Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.customRaiseText}>Custom Raise</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.betInput}
                  keyboardType="number-pad"
                  value={betAmount.toString()}
                  onChangeText={(text) => setBetAmount(parseInt(text) || 0)}
                  placeholder="Enter amount"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setBetModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.confirmButton,
                    pressed && styles.buttonPressed,
                    (!isPlayerTurn && controlsEnabled) && styles.disabledButton,
                  ]}
                  onPress={handleSubmitCustomRaise}
                  disabled={(!isPlayerTurn && controlsEnabled)}
                >
                  <Text style={styles.modalButtonText}>Confirm Raise</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isAllInConfirmVisible}
        onRequestClose={() => setIsAllInConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAllInConfirmVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, styles.allInModalContent]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.allInModalTitle}>Confirm All In</Text>
            <Text style={styles.allInModalText}>
              {/* Raising {getCurrentPlayerBalance()} will put you all in. Are you sure? */}
              Are you sure you want to go all in?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setIsAllInConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleConfirmAllIn}
              >
                <Text style={styles.modalButtonText}>Yes, All In!</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isInfoModalVisible}
        onRequestClose={() => setIsInfoModalVisible(false)}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: '#23272f', width: '92%', maxWidth: 420, padding: 24 }]}>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalTitle, { color: '#ffd700', fontSize: 24, marginBottom: 10 }]}>
                  🃏 Betting Rules
                </Text>

                {/* Basic Actions */}
                <Text style={styles.sectionHeader}>Basic Actions</Text>
                <View style={{ marginBottom: 18 }}>
                  <Text style={styles.bullet}><Text style={styles.term}>Check:</Text> When no bet is required (<Text style={styles.term}>Call: 0</Text>)</Text>
                  <Text style={styles.bullet}><Text style={styles.term}>Call:</Text> Pay the difference between your current bet and the minimum bet</Text>
                  <Text style={styles.bullet}><Text style={styles.term}>Raise:</Text> Add to the minimum bet (<Text style={styles.term}>total = minBet + raise amount - what you already bet</Text>)</Text>
                  <Text style={styles.bullet}><Text style={styles.term}>Fold:</Text> Give up your hand</Text>
                  <Text style={styles.bullet}><Text style={styles.term}>All-in:</Text> Bet all your remaining chips</Text>
                </View>

                {/* Examples */}
                <Text style={styles.sectionHeader}>Examples</Text>
                <View style={styles.exampleBox}>
                  <Text>
                    <Text style={styles.term}>If minBet is 30 and you've bet 10:</Text>{'\n'}
                    <Text style={styles.exampleSub}>• Call would cost <Text style={styles.term}>20</Text> (30 - 10)</Text>{'\n'}
                    <Text style={styles.exampleSub}>• Raise of 30 would cost <Text style={styles.term}>60</Text> (30 + 30)</Text>{'\n\n'}
                    <Text style={styles.term}>If minBet is 0:</Text>{'\n'}
                    <Text style={styles.exampleSub}>• Call: 0 is the same as Check</Text>{'\n'}
                    <Text style={styles.exampleSub}>• Raise of 30 would cost <Text style={styles.term}>30</Text> (0 + 30)</Text>
                  </Text>
                </View>
              </ScrollView>
              <Pressable
                style={[styles.button, styles.buttonClose, { backgroundColor: '#5cb85c', marginTop: 10 }]}
                onPress={() => setIsInfoModalVisible(false)}
              >
                <Text style={styles.textStyle}>Got it!</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.controls}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.raiseButton,
            pressed && styles.buttonPressed,
            (!isPlayerTurn && controlsEnabled) && styles.disabledButton ,
          ]}
          onPress={() => setBetModalVisible(true)}
          disabled={(!isPlayerTurn && controlsEnabled)}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="hand-coin" size={22} color="white" />
            <Text style={styles.actionButtonText}>Bet</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.foldButton,
            pressed && styles.buttonPressed,
            (!isPlayerTurn && controlsEnabled) && styles.disabledButton,
          ]}
          onPress={() => handleBet(0, "fold")}
          disabled={(!isPlayerTurn && controlsEnabled)}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="close-circle" size={22} color="white" />
            <Text style={styles.actionButtonText}>Fold</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.infoButton}
          onPress={() => setIsInfoModalVisible(true)}
        >
          <Ionicons name="information-circle-outline" size={28} color="#007AFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.table.dark,
    borderTopWidth: 1,
    borderTopColor: Colors.table.medium,
    width: "100%",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    zIndex: 4,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  foldButton: {
    backgroundColor: Colors.action.red.medium,
  },
  checkButton: {
    backgroundColor: Colors.action.green.medium,
    borderColor: Colors.action.green.dark,
  },
  callButton: {
    backgroundColor: Colors.action.blue.medium,
    borderColor: Colors.action.blue.dark,
  },
  raiseButton: {
    backgroundColor: Colors.action.gold.medium,
    borderColor: Colors.action.gold.dark,
  },
  endTurnButton: {
    backgroundColor: "#43a047",
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: "#25292e",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 16,
  },
  minBetContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  minBetText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  betInput: {
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 20,
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  confirmButton: {
    backgroundColor: "#5cb85c",
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  confirmButtonText: {
    color: "white",
    marginLeft: 8,
  },
  confirmButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#1a1a1a",
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#666",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  quickActionButton: {
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginHorizontal: 2,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  customRaiseText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  allInModalContent: {
    padding: 25,
    alignItems: "center",
  },
  allInModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  allInModalText: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  infoButton: {
    padding: 5, // Add padding for easier tapping
    marginLeft: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sectionHeader: {
    color: Colors.action.blue.medium,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    marginTop: 10,
  },
  bullet: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 3,
  },
  term: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  exampleBox: {
    backgroundColor: '#2d313a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  exampleText: {
    color: '#eee',
    fontSize: 15,
  },
  exampleSub: {
    marginLeft: 10,
    color: '#b0b0b0',
    fontSize: 14,
  },
});
