from src.models.cards import cards
import random
from src.services.bettingService import handle_all_in
from src.controllers.extrasController import extras

def set_turn_order(
    self, game
):  # Method to establish poker game turn order and positions
    dealer = game.dealer
    players = game.players
    player_count = len(players)
    i = (dealer + 3) % player_count
    game.turnQueue = []
    
    for p in game.players:
        p.bet = 0

    visited = 0
    while visited < player_count and players[i] not in game.turnQueue:
        player = players[i]
        print(player.username)

        if player.chips <= 0:
            player.state = "out"
        else:
            if player.state != "out":
                player.bet = 0
                player.total_bet = 0
                player.state = 'active'
                game.turnQueue.append(player)
                print(f"{player.username} added to turnQueue")

        i = (i + 1) % player_count
        visited += 1 
    
    if len(game.turnQueue)<=1:
        game.latest = ''
        game.state = f"Game Over: {game.turnQueue[0].username} wins!"
        game.save()
        return 'ended'
    else:
        small_blind = game.turnQueue[-2]
        big_blind = game.turnQueue[-1]
        game.latest = 'Make your bets!'
        game.turnQueue[-3].position = "Dealer"
        small_blind.position = "Small Blind"
        big_blind.position = "Big Blind"

        game.save()

        if big_blind.chips < game.bigBlind:
            handle_all_in(game, big_blind, "", big_blind.chips)
            big_blind.bet = big_blind.chips
            big_blind.total_bet += big_blind.chips
            big_blind.chips = 0
        else:
            big_blind.chips -= game.bigBlind
            big_blind.bet = game.bigBlind
            big_blind.total_bet += game.bigBlind

        if small_blind.chips < game.smallBlind:
            handle_all_in(game, small_blind, "", small_blind.chips)
            small_blind.bet = small_blind.chips
            small_blind.total_bet += small_blind.chips
            small_blind.chips = 0
        else:
            small_blind.chips -= game.smallBlind
            small_blind.bet = game.smallBlind
            small_blind.total_bet += game.smallBlind

        game.minBet = game.bigBlind
        game.lastRaise = game.bigBlind

        game.pot = game.smallBlind + game.bigBlind
        extras.save_game_internal(game.gameId)
        game.save()
        return 'continue'
    


# def set_river(self, game):
#     deck = game.deck
#     game.river.append(deck.pop())
#     game.save()


def deal_cards(self, game):
    deck = cards.copy()
    random.shuffle(deck)
    iterations = len(game.turnQueue) * 2

    for i in range(0, iterations):
        player = game.turnQueue[i % len(game.turnQueue)]
        player.cards.append(deck.pop())

    game.deck = deck

    # Initialize all players to 'active' except first better
    for player in game.players:
        player.state = "active"
    game.save()

    # Set first player in turnQueue to betting
    first_player = game.turnQueue[0]
    for player in game.players:
        if player == first_player:
            player.state = "betting"
            game.save()
            break
    # Initialize empty active players list
    game.activePlayers = []
    game.state = "Pre Flop"
    game.save()
