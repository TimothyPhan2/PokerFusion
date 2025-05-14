import { create } from "zustand";
import config from "../config.json";
import httpService from "@/services/httpservice";
import { io, Socket } from "socket.io-client";
interface PublicGame {
  gameId: string;
  maxPlayers: number;
  currentPlayers: number;
}
interface GameState {
  inGame: boolean;
  socket: Socket | null;
  gameId: string | null;
  data: any | null;

  publicGames: PublicGame[];
  publicLoading: boolean;
  publicError: string | null;
  getPublicGames: () => Promise<void>;
  initialize: () => void;
  disconnect: () => void;
  leaveGame: (gameCode: string, username: string) => Promise<void>;
  joinGame: (gameCode: string, username: string) => Promise<void>;
  bet: (amount: number, gameCode: string, bet_type: string) => Promise<void>;
  endedGame: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  inGame: false,
  socket: null,
  gameId: null,
  data: null,
  publicGames: [],
  publicLoading: false,
  publicError: null,
  initialize: () => {
    const currSocket = get().socket;
    if (!currSocket || !currSocket.connected) {
      const socket = io(config.server.endpoint);
      // connection event listeners
      socket.on("connect", () => {
        console.log("Socket connected with ID:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (error) => {
        console.log("Socket connection error:", error);
      });

      socket.on("game_ended", () => {
        console.log("Socket event received: game_ended");
        get().endedGame();
      });

      // Debug all events
      // socket.onAny((eventName, ...args) => {
      //   console.log(`Socket event received: ${eventName}`, args);
      // });

      set({ socket });
    } else {
      console.log("Socket already initialized");
    }
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
  leaveGame: async (gameCode: string, username: string) => {
    try {
      console.log("Leaving game:", gameCode);
      const { socket } = get();
      if (socket) {
        socket.off("game_update");
      }
      await httpService.post<{ message: string }>(
        "/pre_game/delete_player_from_game",
        {
          gameId: gameCode,
          username: username,
        }
      );

      set({ inGame: false, data: null, gameId: null });
    } catch (error) {
      console.log(error);
    }
  },
  endedGame: async () => {
    set({ inGame: false, data: null, gameId: null });
    console.log("Game ended, resetting game state");
  },
  joinGame: async (gameCode, username) => {
    try {
      console.log(config.server.endpoint);
      const res = await httpService.post<{ message: string }>(
        "/pre_game/join_game",
        {
          gameId: gameCode,
          username: username || "test",
        }
      );
      const response = res;
      console.log(response);
      if (response.message === "Player added") {
        const { socket } = get();
        if (socket) {
          console.log("Inside of socket emit");
          socket.emit("join_game", { gameCode });

          socket.on("game_update", (update) => {
            // console.log("Game update listener triggered with data:", data);
            const state = get();
           
            console.log("Current gameId in state:", state.gameId);
            console.log("Received gameId in update:", update.gameId);
            if (update.gameId === state.gameId) {
              set((state) => ({
                ...state,
                data: update,
              }));
              console.log("Game data updated", update);
            } else {
              console.log(
                "GameId mismatch - State gameId:",
                state.gameId,
                "Update gameId:",
                update.gameId
              );
            }
          });
        }
        set({
          inGame: true,
          gameId: gameCode,
          data: {
            status: "waiting",
          },
        });
        console.log("Joined game!");
        // alert("Joined game!");
      } else if (response.message === "Game is already in progress") {
        alert("Game is already in progress");
      } else if (response.message === "Game is full") {
        alert("Game is full");
      } else if (response.message === "Game not found") {
        alert("Game not found");
      } else {
        console.log("Failed to join game");
        alert("Failed to join game");
      }
    } catch (error) {
      console.log(error);
      alert("Something unexpected happened. Please try again.");
    }
  },
  bet: async (amount: number, gameCode: string, bet_type: string) => {
    try {
      const res = await httpService.post<{ message: string }>(
        "in_game/betting",
        {
          gameId: gameCode,
          amount,
          bet_type,
        }
      );
      const { message } = res;
      console.log("Received response:", res);

      if (message) {
        console.log("✅ Bet placed successfully", message);
      } else {
        console.log("❌ Failed to place bet:", message);
      }
    } catch (error: any) {
      if (error.response?.data?.message === "Raise increment required.") {
        throw new Error("Raise increment required.");
      } else if (error.response?.data?.message === "Player not found") {
        throw new Error("Player not found")
      } else if (error.response?.data?.message === "Invalid bet type.") {
        throw new Error("Invalid bet type.")
      }
      console.log("Betting error:", error);
      // throw error
    }
  },
  getPublicGames: async () => {
    set({ publicLoading: true, publicError: null });
    try {
      const res = await httpService.get<{ publicGames: PublicGame[] }>(
        "/extras/public-games"
      );
      const { publicGames } = res;
      set({ publicGames, publicLoading: false })
      console.log("Received public games:", publicGames);
    } catch (error) {
      console.log("Failed to get public games:", error);
      set({ publicLoading: false, publicError: "Failed to get public games" })
    }
  },
}));
