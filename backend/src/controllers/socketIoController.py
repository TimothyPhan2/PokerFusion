from flask_socketio import SocketIO
from flask_socketio import join_room

socketio = SocketIO(cors_allowed_origins="*")
active_games = {}  # Track active game connections


@socketio.on("join_game")
def handle_join_game(data):
    """
    Expects data like: { "gameCode": "abc123" }
    The web client will join the room for that game.
    """
    game_code = data.get("gameCode")
    if game_code:
        join_room(game_code)
        active_games[game_code] = active_games.get(game_code, 0) + 1
        print(
            f"Client joined room for game {game_code}. Active connections: {active_games[game_code]}"
        )
        socketio.emit("joined_game", {"message": f"Joined room for game {game_code}"})
    else:
        socketio.emit("error", {"message": "Missing gameCode"})

@socketio.on("send_emoji")
def handle_send_emoji(data):
    """
    Expects data like: { "gameId": "abc123", "emoji": "smile" }
    The web client will display the emoji for the player.
    """
    game_id = data.get("gameId")
    emoji = data.get("emoji")
    username = data.get("username")
    if not all([game_id, emoji, username]):
        print("Error: Missing data in send_emoji event")
        socketio.emit("error", {"message": "Missing gameId or emoji or username"})
        return
    print(f"Received emoji '{emoji}' from '{username}' in game '{game_id}'")
    socketio.emit("display_emoji", {"gameId": game_id, "emoji": emoji, "username": username}, room=game_id)