import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="signup" options={{title: "Sign Up"}} />
      <Stack.Screen name="login" options={{title: "Sign In"}} />
      <Stack.Screen name="forgot_password" options={{title: "Forgot Password"}} />
    </Stack>
  )
}
