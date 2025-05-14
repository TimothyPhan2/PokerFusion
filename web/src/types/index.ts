export interface ICreateGame {
  gameId: string;
  smallBlind: number;
  bigBlind: number;
  initialChips: number;
  status: "waiting";
  maxPlayers: number;
  private: boolean;
}
