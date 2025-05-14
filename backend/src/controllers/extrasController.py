from flask import Blueprint, request, jsonify
from src.models.game import Game
from src.models.user import User, GameHistoryItem
from datetime import date
from src.controllers.socketIoController import (socketio) 
class extrasController:
    def __init__(self):
        self.blueprint = Blueprint("extras", __name__)
        self.blueprint.add_url_rule(
            "/save-game", view_func=self.save_game, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/delete-game", view_func=self.delete_game, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/public-games", view_func=self.get_public_games, methods=["GET"]
        )
        
    def save_game(self):
        data = request.get_json()
        gameId = data.get("gameId")
        if not gameId:
            return jsonify({"error": "Missing gameId"}), 400

        socketio.emit("game_ended", room=gameId)
        self._apply_game_outcomes(gameId)
        self._delete_game_internal(gameId)
        return jsonify({"message": "Game saved and deleted"}), 201
    
    def save_game_internal(self, gameId):
        self._apply_game_outcomes(gameId)
        return jsonify({"message": "Game outcomes saved"}), 200
    
    def delete_game(self):
        data = request.get_json()
        gameId = data.get("gameId")
        return self._delete_game_internal(gameId)

    def _delete_game_internal(self, gameId):
        game = Game.objects(gameId=gameId).first()
        if game:
            game.delete()
            return jsonify({"message": "Game deleted"}), 200
        else:
            return jsonify({"error": "Game not found"}), 404
            
    def get_public_games(self):
        public_games = Game.objects(private=False, status="waiting")
        game_list = []

        for game in public_games:
            game_list.append({
                "gameId": game.gameId,
                "maxPlayers": game.maxPlayers,
                "currentPlayers": len(game.players)
            })

        return jsonify({"publicGames": game_list}), 200

    def _apply_game_outcomes(self, gameId):
        game = Game.objects(gameId=gameId).first()
        if not game:
            return

        buy_in = game.initialChips
        to_save = game.players + game.leftEarly
        for player in to_save:
            outcome = player.chips - buy_in
            user = User.objects(username=player.username).first()
            if not user:
                continue

            # Check if game already exists in game history
            existing = next((g for g in user.game_history if g.gameId == gameId), None)
            if existing:
                existing.amount = outcome
                existing.date = date.today()
            else:
                user.game_history.append(GameHistoryItem(
                    gameId=gameId,
                    amount=outcome,
                    date=date.today()
                ))
            user.save()
            
extras = extrasController()
