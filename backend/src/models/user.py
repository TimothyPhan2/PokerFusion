from mongoengine import Document, StringField, DateField,ListField, EmbeddedDocument, EmbeddedDocumentField, IntField, EmailField
from datetime import date

class GameHistoryItem(EmbeddedDocument):
    gameId = StringField(required=True, default='')
    amount = IntField(required=True, description="must be a double and is required")
    date = DateField(default=date.today)

class User(Document):
    username = StringField(required=True, unique=True, description="must be a string and is required")
    password = StringField(required=True, description="must be a string and is required")
    email = EmailField(required=True, unique=True, description="must be a valid email address and is required")
    game_history = ListField(EmbeddedDocumentField(GameHistoryItem), description="must be an array of game history items", default=[])
    profile_image = StringField(required=True, description="must be a string and is required")
