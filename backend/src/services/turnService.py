import time
from src.services.bettingService import player_counter
from src.controllers.extrasController import extras


def the_turn(self, game):
    game.state = "The Turn - Betting"
    game.minBet = 0
    game.save()
    game.deck.pop()  # burn a card
    game.lastRaise = 0

    # add the 4th card to the river
    game.river.append(game.deck.pop())
    game.save()
    time.sleep(1)

    counter = player_counter(game)
    print(counter)
    if counter[1] <= 1 and counter[2] > 0:
        game.state = "The River"
    else:
        game.turnQueue = game.activePlayers.copy()
        for p in game.turnQueue:
            p.bet = 0
        for p in game.players:
            p.bet = 0
        game.activePlayers = []

        # set first player to betting
        for player in game.players:
            if player.username == game.turnQueue[0].username:
                player.state = "betting"
                break
    game.save()
