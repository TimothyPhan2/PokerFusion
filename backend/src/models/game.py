import time
from datetime import datetime
from mongoengine import (
    Document,
    StringField,
    IntField,
    ListField,
    EmbeddedDocument,
    EmbeddedDocumentField,
    DateTimeField,
    BooleanField
)

class PlayerProfile(EmbeddedDocument):
    profile_picture = StringField(default = '')
    games_played = IntField(default = 0)

class GamePlayer(EmbeddedDocument):
    username = StringField(
        required=True, description="must be a string and is required"
    )
    profile = EmbeddedDocumentField(PlayerProfile)
    cards = ListField(
        StringField(), default=[], description="must be an array of strings"
    )
    bet = IntField(default=0, description="Current bet amount in the betting round")
    total_bet = IntField(
        default=0, description="Total amount bet by the player in the current hand"
    )
    chips = IntField(default=0)
    state = StringField(
        choices=["active", "folded", "out", "betting", "all-in"],
        required=True,
        default="active",
        description="must be one of 'active', 'folded', 'betting', 'all-in', or 'out'",
    )
    position = StringField(
        choices=["Small Blind", "Big Blind", "Dealer", "Regular"],
        required=True,
        default="Regular",
        description="must be one of choices",
    )


class SidePot(EmbeddedDocument):
    minBet = IntField(default=0, description="Minimum bet for this side pot")
    payout = IntField(default=0, description="payout of the side pot")
    eligible_players = ListField(
        StringField(),
        default=[],
        description="Usernames of players eligible for this pot",
    )


class Game(Document):
    gameId = StringField(
        required=True, unique=True, description="must be a string and is required"
    )
    createdAt = DateTimeField(
        default=lambda: datetime.fromtimestamp(time.time()),
        description="must be a date if provided",
    )
    lastRaise = IntField(default=0, description="must be an integer and is required")
    maxPlayers = IntField(
        required=True, description="must be an integer and is required"
    )
    smallBlind = IntField(required=True, description="must be a double and is required")
    bigBlind = IntField(required=True, description="must be a double and is required")
    initialChips = IntField(
        required=True, description="must be a double and is required"
    )

    status = StringField(
        choices=["waiting", "in_progress", "finished"],
        required=True,
        default="waiting",
        description="must be one of 'waiting', 'in_progress', or 'finished'",
    )

    dealer = IntField(default=0, description="dealer position")
    players = ListField(
        EmbeddedDocumentField(GamePlayer),
        default=[],
        description="must be an array of player objects and is required",
    )
    turnQueue = ListField(
        EmbeddedDocumentField(GamePlayer),
        default=[],
        description="must be an array of player objects and is required",
    )
    activePlayers = ListField(
        EmbeddedDocumentField(GamePlayer),
        default=[],
        description="must be an array of player objects and is required",
    )

    pot = IntField(default=0, description="total amount of chips in the pot")
    minBet = IntField(default=0, description="must be an integer and is required")
    river = ListField(
        StringField(), default=[], description="must be an array of strings"
    )
    deck = ListField(
        StringField(), default=[], description="must be an array of strings"
    )
    state = StringField(default="Pre Flop", required=True)
    latestMove = StringField(default="", required=True)
    side_pots = ListField(
        EmbeddedDocumentField(SidePot), default=[], description="List of side pots"
    )
    private = BooleanField(default=False, description="False is public, true is private")
    leftEarly = ListField(
        EmbeddedDocumentField(GamePlayer), default=[]
    )
    # meta = {
    #     'indexes': [
    #         {'fields': ['createdAt'], 'expireAfterSeconds': 9000}
    #     ]
    # }
