import threading
from flask import Blueprint, request, jsonify
from src.models.game import Game
from src.services.preFlopService import set_turn_order, deal_cards
from src.services.theFlopService import the_flop
from src.services.turnService import the_turn
from src.services.riverService import the_river, showdown
from src.services.bettingService import make_bet
import logging
import json
from bson.json_util import dumps
from src.controllers.socketIoController import (
    socketio,
    active_games,
)  # shared SocketIO instance


class inGameController:
    def __init__(self):
        self.blueprint = Blueprint("in_game", __name__)
        self.blueprint.add_url_rule(
            "/pre-flop", view_func=self.pre_flop, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/the-flop", view_func=self.the_flop, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/the-turn", view_func=self.the_turn, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/the-river", view_func=self.the_river, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/showdown", view_func=self.showdown, methods=["POST"]
        )
        self.blueprint.add_url_rule(
            "/betting", view_func=self.betting, methods=["POST"]
        )
        # Start the change stream listener in a background thread.
        self.change_stream_thread = threading.Thread(
            target=self.listen_for_game_changes, daemon=True
        )
        self.change_stream_thread.start()

    def listen_for_game_changes(self):
        while True:  # Keep trying to reconnect if connection fails
            try:
                collection = Game._get_collection()
                with collection.watch(full_document="updateLookup") as stream:
                    for change in stream:
                        try:
                            full_doc = change.get("fullDocument", {})
                            game_code = full_doc.get("gameId")
                            # Only emit if game exists and has active connections
                            if (
                                game_code
                                and game_code in active_games
                                and active_games[game_code] > 0
                            ):
                                logging.info("Change detected for game %s", game_code)
                                serialized_change = json.loads(dumps(change))
                                print(serialized_change['updateDescription'])
                                socketio.emit(
                                    "game_update", serialized_change['fullDocument'], room=game_code
                                )
                        except Exception as inner_e:
                            logging.error("Error processing change: %s", inner_e)
                            continue  # Continue processing next change even if one fails
            except Exception as e:
                logging.error("Change stream connection error: %s", e)

    def pre_flop(self):
        data = request.get_json()
        gameId = data["gameId"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()

        # set turn queue
        play_on = set_turn_order(self, game)
        if play_on == 'continue':
            deal_cards(self, game)
            return jsonify({"message": "Pre-flop set"}), 200
        return jsonify({"message": "Game Complete"}), 200

    def the_flop(self):
        data = request.get_json()
        gameId = data["gameId"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()
        the_flop(self, game)
        return jsonify({"message": "The-flop set"}), 200

    def the_turn(self):
        data = request.get_json()
        gameId = data["gameId"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()
        the_turn(self, game)
        return jsonify({"message": "The-turn set"}), 200

    def the_river(self):
        data = request.get_json()
        gameId = data["gameId"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()
        the_river(self, game)
        return jsonify({"message": "The-river set"}), 200

    def showdown(self):
        data = request.get_json()
        gameId = data["gameId"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()
        sd = showdown(self, game)
        print(sd)
        message = "Winner found"
        print(message)
        return jsonify({"message": message}), 200

    def betting(self):
        data = request.get_json()
        print(data)
        gameId = data["gameId"]
        bet_type = data["bet_type"]
        amount = data["amount"]
        # find game data by gameId
        game = Game.objects(gameId=gameId).first()
        return make_bet(self=self, game=game, bet_type=bet_type, amount=amount)
        # return jsonify({"message": "Betting works"}), 200