import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { AuthController } from "@/controllers/auth";
import Colors from "../../constants/Colors";

export default function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const handleLogin = async () => {
    try {
      await AuthController.handleLogin(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login to your account</Text>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* <Pressable 
              onPress={() => router.push("/forgot_password")}
              style={({ pressed }) => [
                styles.forgotPasswordButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable> */}

            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account?</Text>
              <Pressable 
                onPress={() => router.push("/signup")}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.linkBtn}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.table.medium,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.white,
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.text.white,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.text.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary.medium,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Colors.text.white,
    fontWeight: "700",
    fontSize: 16,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  linkText: {
    color: Colors.text.white,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  linkBtn: {
    color: Colors.primary.medium,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 5,
  },
  forgotPassword: {
    color: "#374151",
    fontWeight: "500",
  },
  errorText: {
    color: Colors.action.red.medium,
    marginTop: 10,
    textAlign: "center",
  },
});
