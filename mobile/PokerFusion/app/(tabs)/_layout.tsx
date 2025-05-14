import { RelativePathString, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore, User } from "@/stores/auth";
import { useGameStore } from "@/stores/game";
import { Alert } from "react-native";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import httpService from "@/services/httpservice";
export default function TabLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { inGame, gameId, leaveGame } = useGameStore();
  const username = isAuthenticated.user?.username;
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);

  // Initializing auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          console.log("Stored user:", user);
           // Fetch complete user data including game history
        const res = await httpService.post<{ message: string, user: User }>('/user/get-user-history', {
          username: user.username
        });
        
        if (res.message === "User history fetched") {
          useAuthStore.setState({
            isAuthenticated: {
              user: res.user, 
              status: true,
            },
          });
        }
        }
      } catch (error) {
        console.log("Failed to initialize auth state:", error);
      }
    };

    initializeAuth();
  }, []);

  const handleProtectedRoutes = () => {
    if (!isAuthenticated.status) {
      Alert.alert(
        "Sign In Required",
        "You need to sign in to access this feature",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            style: "default",
            onPress: () => router.push("/login"),
          },
        ]
      );
      return false;
    }
    return true;
  };

  const handleTabPress = (e: any, targetTab: string) => {
    // First check if route is protected
    if (!handleProtectedRoutes()) {
      e.preventDefault();
      return;
    }

    // If user is in a game and trying to switch tabs
    if (inGame && !isLeaving && pathname !== targetTab) {
      e.preventDefault();

      
      const tabName =
        targetTab === "(tabs)"
          ? "Home"
          : targetTab === "(tabs)/profile"
          ? "Profile"
          : "Play";

      Alert.alert(
        "Leave Current Game?",
        `Are you sure you want to leave your game to go to ${tabName}? You will be removed from the game.`,
        [
          {
            text: "Stay in Game",
            style: "cancel",
          },
          {
            text: "Leave Game",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLeaving(true);
                if (gameId && username) {
                  await leaveGame(gameId, username);
                }
                router.push(targetTab as RelativePathString);
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to leave the game. Please try again.",
                  [{ text: "OK" }]
                );
                
              } finally {
                setIsLeaving(false);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "(tabs)"),
        }}
      />
      <Tabs.Screen
        name="playgame"
        options={{
          title: "Play",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "game-controller" : "game-controller-outline"}
              color={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "(tabs)/playgame"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "(tabs)/profile"),
        }}
      />
    </Tabs>
  );
}
