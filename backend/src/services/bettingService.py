from flask import jsonify
from src.models.game import SidePot

def rebuild_side_pots(game):
    contributors = [p for p in game.players if p.total_bet > 0]
    levels = sorted({p.total_bet for p in contributors})

    side_pots = []
    prev = 0
    for lvl in levels:
        contrib_players = [p for p in contributors if p.total_bet > prev]
        amount = (lvl - prev) * len(contrib_players)
        eligibles = list({p.username for p in contrib_players if p.state != "folded"})

        if amount > 0 and eligibles:
            side_pots.append(
                SidePot(
                    minBet=lvl,
                    payout=amount,
                    eligible_players=eligibles,
                )
            )
        prev = lvl

    game.side_pots = side_pots
    game.save()


def handle_all_in(game, player, bet_type, allin_total):
    player.state = "all-in"
    action = f"{player.username} went all-in for ${allin_total}"

    # treat all-in as a raise if it meets the minimum increment
    if bet_type == "raise":
        previous_min = game.minBet
        increment = allin_total - previous_min
        if increment >= game.lastRaise:
            game.lastRaise = increment
            game.minBet = allin_total
            # reset the queue: active players must act again
            game.turnQueue.extend(
                [p for p in game.activePlayers if p.state == "active"]
            )
            
    if allin_total < game.minBet:
        rebuild_side_pots(game)
    return action


def make_bet(self, game, bet_type, amount=None):
    """
    Core betting logic: fold / check / call / raise / all-in.
    Enforces min-raise increments, cleans queues, advances streets, and handles side-pots.
    """
    # Pop the current bettor
    bettor_info = game.turnQueue.pop(0)
    player = next((p for p in game.players if p.username == bettor_info.username), None)
    if not player:
        return jsonify({"message": "Player not found"}), 400

    # === FOLD ===
    if bet_type == "fold":
        player.state = "folded"
        game.activePlayers = [
            p for p in game.activePlayers if p.username != player.username
        ]
        action = f"{player.username} folded"
        game.latestMove = action
        # Showdown if last standing
        remaining = [p for p in game.players
             if p.state not in ("folded","out")]
        if len(remaining) == 1:
            game.state = "Showdown"
            game.save()
            return jsonify({"message": f"{action}; showdown", "state": game.state}), 200
        game.save()
        

    # === CHECK ===
    elif bet_type == "check":
        if game.minBet > player.bet:
            diff = game.minBet - player.bet
            return jsonify(
                {"message": f"Cannot check; must call or raise ${diff}."}
            ), 400
        player.state = "active"
        game.activePlayers.append(player)
        action = f"{player.username} checked"

    # === CALL ===
    elif bet_type == "call":
        need = game.minBet - player.bet
        pay = min(need, player.chips)
        player.chips -= pay
        player.bet += pay
        player.total_bet += pay
        game.pot += pay
        if player.chips == 0 or pay < need:
            # all-in call
            player.state = "all-in"
            action = handle_all_in(game, player, bet_type, player.bet)
        else:
            player.state = "active"
            game.activePlayers.append(player)
            action = f"{player.username} called ${need}"

    # === RAISE ===
    elif bet_type == "raise":
        if amount is None:
            return jsonify({"message": "Raise increment required."}), 400
        increment = amount
        new_min = game.minBet + increment
        need = new_min - player.bet
        pay = min(need, player.chips)
        player.chips -= pay
        player.bet += pay
        player.total_bet += pay
        game.pot += pay
        if player.chips == 0 or pay < need:
            # all-in raise
            player.state = "all-in"
            action = handle_all_in(game, player, bet_type, player.bet)
        else:
            player.state = "active"
            game.minBet = new_min
            # reset queue: players must act again
            game.turnQueue.extend(
                [p for p in game.activePlayers if p.state == "active"]
            )
            game.activePlayers = [player]
            action = f"{player.username} raised to ${new_min}"

    else:
        return jsonify({"message": "Invalid bet type."}), 400

    game.latestMove = action
    game.save()

    # Showdown if only one or all-in
    alive = [p for p in game.players if p.state != "folded"]
    
    if len(alive) == 1:
        game.state = "Showdown"
        game.save()
        return jsonify({"message": action + "; showdown", "state": game.state}), 200
    transitions = {
            "Pre Flop": "The Flop",
            "The Flop - Betting": "The Turn",
            "The Turn - Betting": "The River",
            "The River - Betting": "Showdown",
        }
    # Advance street if betting round ended
    if len(game.turnQueue)==0:
        game.state = transitions.get(game.state, game.state)
        game.save()
        return jsonify({"message": "Betting complete", "state": game.state}), 200

    # Next to act
    next_user = game.turnQueue[0].username
    nxt = next((p for p in game.players if p.username == next_user), None)
    if nxt:
        nxt.state = "betting"
        game.save()

    return jsonify({"message": f"{action}; Next to act: {next_user}"}), 200


def player_counter(game):
    return (
        len(game.turnQueue),
        len(game.activePlayers),
        len([p for p in game.players if p.state == "all-in"]),
    )
