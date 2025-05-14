import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";

import { Image } from "expo-image";
import PokerFusionLogo from "../../assets/images/poker-fusion-logo.png";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import Colors from "../../constants/Colors";
import DisplayGames from "@/components/DisplayGames";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 50 }}>
        <Image source={PokerFusionLogo} style={{ width: 350, height: 250 }} />
      </View>
      {!isAuthenticated.status ? (
        <Pressable
          onPress={() => router.push("/signup")}
          style={({ pressed }) => [
            styles.getStartedBtn,
            {
              opacity: pressed ? 0.5 : 1,
              backgroundColor: pressed
                ? Colors.primary.dark
                : Colors.primary.medium,
            },
          ]}
        >
          <Text style={styles.getStartedBtnText}>Get Started</Text>
        </Pressable>
      ) : <DisplayGames />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.table.medium,
  },
  getStartedBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  getStartedBtnText: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: "600",
  },
});
