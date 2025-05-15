from flask import Blueprint, request, jsonify
from src.models.game import Game, PlayerProfile
from src.models.user import User
class preGameController:
    def __init__(self):
        self.blueprint = Blueprint('pre_game', __name__)
        self.blueprint.add_url_rule('/join_game', view_func=self.join_game, methods=['POST'])
        self.blueprint.add_url_rule('/start_game', view_func=self.start_game, methods=['POST'])
        self.blueprint.add_url_rule('/next_round', view_func=self.next_round, methods=['POST'])
        self.blueprint.add_url_rule('/create_game', view_func=self.create_game, methods=['POST'])
        self.blueprint.add_url_rule('/delete_player_from_game', view_func=self.delete_player_from_game, methods=['POST'])

    def join_game(self):
        content = request.get_json()
        gameId = content['gameId']
        username = content['username']
        game = Game.objects(gameId=gameId).first()

        if username in [p.username for p in game.turnQueue] or username in [p.username for p in game.activePlayers]:
            return jsonify({"message": "Player Rejoined"}), 201
        elif game.status != 'waiting':
            return jsonify({"message": "Game is already in progress"}), 401
        elif len(game.players) == game.maxPlayers:
            return jsonify({"message": "Game is full"}), 402
        elif not game:
            return jsonify({"message": "Game not found"}), 403
        else:
            user_object = User.objects(username=username).first()
            new_player = {"username": username, "profile": 
                PlayerProfile(profile_picture='',
                              games_played=len(user_object.game_history))}
            # new_player = {"username": username}
            game.update(push__players=new_player)
            return jsonify({"message": "Player added"}), 200


    def start_game(self):
        data = request.get_json()
        gameId = data['gameId']
        game = Game.objects(gameId=gameId).first()
        
        if not game:
            return jsonify({"error": f"Game with ID '{gameId}' not found"}), 404

        # Assign initial chips to all players
        initialChips = game.initialChips
        for player in game.players:
            player.chips = initialChips  # Ensure every player gets the initial chips

        # Save updates to the database
        game.update(set__status="in_progress", set__dealer=0, set__players=game.players)

        return jsonify({"message": "game started, all players received initial chips"}), 200

    def next_round(self):
        gameId = request.get_json()
        print(gameId)
        game = Game.objects(gameId=gameId['gameId']).first()
        if not game:
            print('Game not found')
            return jsonify({"error": f"Game with ID '{gameId}' not found"}), 404

        game.update(inc__dealer=1)
        game.river = []
        game.deck = []
        game.minBet = 0
        game.pot = 0
        game.state = 'Pre Flop'
        for player in game.players:  # Reset all players' hands
            player.cards = []
            player.position = "Regular"
        game.save()
        return jsonify({"message": "Dealer position incremented, next round ready"}), 200

    def create_game(self):
        content = request.get_json()
        new_game = Game(**content)
        insert_result = new_game.save()
        return jsonify({"message": "Game added", "gameId": str(insert_result.gameId)}), 201
    
    def validate_game(self):
        gameId = request.get_json()
        game = Game.objects(gameId=gameId).first()
        if not game:
            return jsonify({"error": f"Game with ID '{gameId}' not found"}), 404
        return jsonify({"message": "Game is valid"}), 200
    
    def delete_player_from_game(self):
        content = request.get_json()
        print(content)
        game = Game.objects(gameId=content['gameId']).first()
        if not game:
            return jsonify({"error": f"Game with ID '{content['gameId']}' not found"}), 404
        if (game.status != 'waiting'):
            player = None
            for p in game.players:
                if p.username == content['username']:
                    player = p
                    break
            game.leftEarly.append(p)
            game.save()
        result = game.update(pull__players__username=content['username'])
        if result:
            return jsonify({"message": "Player removed"}), 200
        else:
            return jsonify({"error": "Player not found in game"}), 404

