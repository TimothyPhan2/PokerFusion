from flask import Blueprint, request, jsonify
from src.models.user import User
from mongoengine import Q
class userController:
    def __init__(self):
        self.blueprint = Blueprint('user', __name__)
        self.blueprint.add_url_rule('/create-user', view_func=self.create_user, methods=['POST'])
        self.blueprint.add_url_rule('/auth-user', view_func=self.auth_user, methods=['POST'])
        self.blueprint.add_url_rule('/get-user-history', view_func=self.get_user_history, methods=['POST'])
        self.blueprint.add_url_rule('/getPlayerImage', view_func=self.get_player_image_query, methods=['GET'])

    def get_player_image_query(self):
        username = request.args.get("username")
        if not username:
            return jsonify({"error": "Username required"}), 400

        user = User.objects(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"playerImage": user.profile_image}), 200

    def create_user(self):
        user_document = request.get_json()  
        try:
            new_user = User(**user_document)
            existing_user = User.objects(Q(username=new_user.username) | Q(email=new_user.email)).first()
            if(existing_user):
                
                if existing_user.username == new_user.username:
                    
                    return jsonify({"message": "Username already exists"}), 400
                else: 
                    
                    return jsonify({"message": "Email already exists"}), 400
            new_user.save()
            serializable_history = [
                {
                    "gameId": item.gameId,
                    "amount": item.amount,
                    "date": item.date.isoformat()  # Convert date to string
                }
                for item in new_user.game_history
            ]
            return jsonify({"message": "User created",
            "user": {
                "username": new_user.username,
                "email": new_user.email,
                "profile_image": new_user.profile_image,
                "game_history": serializable_history

            }}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def auth_user(self):
        user_info = request.get_json()
        try:
            user = User.objects.get(**user_info)
            serializable_history = [
                {
                    "gameId": item.gameId,
                    "amount": item.amount,
                    "date": item.date.isoformat()  # Convert date to string
                }
                for item in user.game_history
            ]
            return jsonify({"message": "authenticated", "user": {
                "email": user.email,
                "username": user.username,
                "profile_image": user.profile_image,
                "game_history": serializable_history
                
            }}), 200
        except User.DoesNotExist:
            return jsonify({"error": "not found"}), 400

    def get_user_history(self):
        user_info = request.get_json()

        username = user_info['username']
        try:
            user = User.objects(username=username).first()
            serializable_history = [
                {
                    "gameId": item.gameId,
                    "amount": item.amount,
                    "date": item.date.isoformat()  # Convert date to string
                }
                for item in user.game_history
            ]
            return jsonify({"message": "User history fetched", "user": {
                "email": user.email,
                "username": user.username,
                "profile_image": user.profile_image,
                "game_history": serializable_history
            
            }}), 200
        except User.DoesNotExist:
            return jsonify({"error": "not found"}), 400
      