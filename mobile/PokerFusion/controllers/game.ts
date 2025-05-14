
import { useGameStore } from "../stores/game";

export class GameController {
  static async handleJoinGame(gameCode: string, username: string) {
    const { joinGame } = useGameStore.getState();
    try {
      await joinGame(gameCode, username);
    } catch (error) {
      console.log(error);
    }
  }
}
