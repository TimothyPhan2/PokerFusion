// In your gameConfigStore file
import { io, Socket } from "socket.io-client";
import { ICreateGame } from "../types";
import HttpService from "../services/httpService";
import { toast } from "react-toastify";
import { create } from "zustand";

export class GameConfigStore {
  public gameCode: string | null = null;
  public error: string | null = null;
  public hasJoined: boolean = false;
  public data: any = null;
  private httpService: HttpService;
  public socket: Socket;
  private update: () => void;

  constructor(httpService: HttpService, update: () => void) {
    this.httpService = httpService;
    this.update = update;
    this.socket = io("http://127.0.0.1:4000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    this.hasJoined = false;

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection error. Trying to reconnect...");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.hasJoined = false;
      this.update();
    });
  }

  public deletePlayerFromGame = async (username: string): Promise<void> => {
    try {
      await this.httpService.post<{
        gameId: string;
        username: string;
      }>("/pre_game/delete_player_from_game", {
        gameId: this.data.gameId,
        username,
      });
      console.log("Player deleted successfully");
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  public async createGame(gameData: ICreateGame): Promise<string> {
    try {
      if (this.gameCode && this.hasJoined) {
        await this.leaveGame();
      }

      const response = await this.httpService.post<{ gameId: string }>(
        "/pre_game/create_game",
        gameData
      );
      console.log("Create game response:", response);
      this.gameCode = response.gameId;
      this.error = null;
      return this.gameCode;
    } catch (error: any) {
      this.error = error.message || "Error creating game";
      this.update();
      return error.message;
    }
  }

  public joinRoom(gameCode: string): boolean {
    // First leave any existing game
    if (this.gameCode && this.hasJoined && this.gameCode !== gameCode) {
      this.leaveGame();
    }

    if (this.socket.connected && !this.hasJoined) {
      console.log("Joining game room", gameCode);
      this.socket.emit("join_game", { gameCode });

      this.socket.off("game_update");

      this.socket.on("game_update", async (data: any) => {
        console.log("Received game update:", data);
        this.data = data; // Update the stored game data.
        this.update();
        if (this.data.state === "The Flop") {
          console.log("Here");
          await this.httpService.post<{ gameId: string }>("/in_game/the-flop", {
            gameId: this.data.gameId,
          });
        } else if (this.data.state === "The Turn") {
          await this.httpService.post<{ gameId: string }>("/in_game/the-turn", {
            gameId: this.data.gameId,
          });
        } else if (this.data.state === "The River") {
          await this.httpService.post<{ gameId: string }>(
            "/in_game/the-river",
            {
              gameId: this.data.gameId,
            }
          );
        } else if (this.data.state === "Showdown") {
          await this.httpService.post<{ gameId: string }>("/in_game/showdown", {
            gameId: this.data.gameId,
          });
        }
      });

      this.gameCode = gameCode;
      this.hasJoined = true;
      return true
    } else {
      console.log("Joining room failed");
      return false
    }
  }

  public async leaveGame(): Promise<void> {
    if (this.gameCode && this.hasJoined) {
      console.log("Leaving game room", this.gameCode);
      this.socket.emit("leave_game", { gameCode: this.gameCode });
      this.socket.off("game_update"); // Remove event listeners
      this.hasJoined = false;
      this.data = null;
      this.update();
    }
  }

  public async getPlayerImage(username: string) {
    const response = await 
      this.httpService.get<{ playerImage: string }>(
        `/user/getPlayerImage`,
        { params: { username } }
      )
    console.log(response)
    return response.playerImage
  }

  public async startGame() {
    await this.httpService.post<{ gameId: string }>("/pre_game/start_game", {
      gameId: this.data.gameId,
    });
    this.startGameCycle();
  }

  public async nextRound() {
    console.log(this.data.gameId);
    const response = await this.httpService.post<{ gameId: string }>(
      "/pre_game/next_round",
      {
        gameId: this.data.gameId,
      }
    );
    console.log("Next round response:", response);
    this.startGameCycle();
  }

  public async startGameCycle() {
    await this.httpService.post<{ gameId: string }>("/in_game/pre-flop", {
      gameId: this.data.gameId,
    });
  }

  public async saveAndDelete() {
    await this.httpService.post<{ gameId: string }>("/extras/save-game", {
      gameId: this.data.gameId,
    });
    this.data = null;
    await this.leaveGame();
    this.gameCode = null;
    this.update();
  }

  public async saveAndDeleteByCode(gameId: string) {
    await this.httpService.post<{ gameId: string }>("/extras/save-game", {
      gameId: gameId,
    });
    this.data = null;
    await this.leaveGame();
    this.gameCode = null;
    this.update();
  }
}

interface gameConfigStoreState {
  store: GameConfigStore;
}

const apiUrl = "http://127.0.0.1:4000";
const httpService = new HttpService(apiUrl);

export const useGameConfigStore = create<gameConfigStoreState>((set) => {
  const update = () => set((state) => ({ store: state.store }));
  const gameConfigStore = new GameConfigStore(httpService, update);
  return { store: gameConfigStore };
});
