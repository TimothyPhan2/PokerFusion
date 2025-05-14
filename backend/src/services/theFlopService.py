import time
from src.services.bettingService import player_counter
from src.controllers.extrasController import extras


def the_flop(self, game):
    game.state = "The Flop - Betting"
    game.minBet = 0
    game.save()
    game.deck.pop()  # burn a card
    game.lastRaise = 0
    # fill the river
    for i in range(0, 3):
        game.river.append(game.deck.pop())
        game.save()
        time.sleep(1)

    counter = player_counter(game)
    print(counter)
    if counter[1] <= 1 and counter[2] > 0:
        game.state = "The Turn"
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
