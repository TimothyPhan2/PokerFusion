import time
import itertools
from collections import Counter
from src.services.bettingService import player_counter
from flask import jsonify
from src.controllers.extrasController import extras

# Card rankings for poker hand evaluation
RANK_VALUE = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14,
}

# Hand rankings mapping
HAND_RANKINGS = {
    9: "Straight Flush",
    8: "Four of a Kind",
    7: "Full House",
    6: "Flush",
    5: "Straight",
    4: "Three of a Kind",
    3: "Two Pair",
    2: "One Pair",
    1: "High Card",
}


def the_river(self, game):
    # Deal river card and update game state
    game.state = "The River - Betting"
    game.minBet = 0
    game.deck.pop()  # Burn card
    game.river.append(game.deck.pop())
    game.lastRaise = 0
    game.save()
    time.sleep(1)

    # Reset betting order
    counter = player_counter(game)
    if counter[1] <= 1 and counter[2] > 0:
        game.state = "Showdown"
    else:
        game.turnQueue = game.activePlayers.copy()
        for p in game.turnQueue:
            p.bet = 0
        for p in game.players:
            p.bet = 0
        game.activePlayers = []

        # Set first player to betting state
        next_better = next(
            p for p in game.players if p.username == game.turnQueue[0].username
        )
        next_better.state = "betting"
    game.save()


def evaluate_hand(cards):
    # Extract numeric ranks and suits.
    ranks = [RANK_VALUE[card[:-1]] for card in cards]
    suits = [card[-1] for card in cards]
    rank_counts = Counter(ranks)
    counts = sorted(rank_counts.values(), reverse=True)
    sorted_ranks = sorted(ranks, reverse=True)

    # Determine if the hand is a flush.
    is_flush = len(set(suits)) == 1

    # Determine if the hand is a straight.
    unique_ranks = sorted(set(ranks))
    straight_high = None
    if len(unique_ranks) >= 5:
        # Check all possible 5-card sequences.
        for i in range(len(unique_ranks) - 4):
            if unique_ranks[i + 4] - unique_ranks[i] == 4:
                straight_high = unique_ranks[i + 4]
        # Check for Ace-low straight (A-2-3-4-5).
        if not straight_high and set([14, 2, 3, 4, 5]).issubset(set(ranks)):
            straight_high = 5
    is_straight = straight_high is not None

    # Straight Flush: if flush, check if the flush cards form a straight.
    if is_flush and is_straight:
        flush_ranks = sorted([RANK_VALUE[card[:-1]] for card in cards if card[-1] == suits[0]])
        flush_unique = sorted(set(flush_ranks))
        sf_high = None
        if len(flush_unique) >= 5:
            for i in range(len(flush_unique) - 4):
                if flush_unique[i + 4] - flush_unique[i] == 4:
                    sf_high = flush_unique[i + 4]
            if not sf_high and set([14, 2, 3, 4, 5]).issubset(set(flush_ranks)):
                sf_high = 5
        if sf_high:
            # Return complete rank info for tiebreaking
            return (9, sf_high), HAND_RANKINGS[9]

    # Four of a Kind.
    if 4 in counts:
        quad_rank = next(rank for rank, count in rank_counts.items() if count == 4)
        kickers = [rank for rank in sorted_ranks if rank != quad_rank]
        return (8, quad_rank, kickers[0]), HAND_RANKINGS[8]

    # Full House.
    if (3 in counts and 2 in counts) or counts.count(3) == 2:
        triples = [rank for rank, count in rank_counts.items() if count == 3]
        pairs = [rank for rank, count in rank_counts.items() if count == 2]
        
        if len(triples) == 2:  # Two triples
            triple_rank = max(triples)
            pair_rank = min(triples)
        else:  # One triple, at least one pair
            triple_rank = triples[0]
            pair_rank = max(pairs)
            
        return (7, triple_rank, pair_rank), HAND_RANKINGS[7]

    # Flush.
    if is_flush:
        flush_cards = [rank for rank, suit in zip(ranks, suits) if suit == suits[0]]
        flush_ranks = sorted(flush_cards, reverse=True)[:5]
        return (6,) + tuple(flush_ranks), HAND_RANKINGS[6]

    # Straight.
    if is_straight:
        if straight_high == 5 and 14 in ranks:  # A-5 straight
            return (5, 5, 4, 3, 2, 1), HAND_RANKINGS[5]
        else:
            straight_cards = [straight_high - i for i in range(5)]
            return (5,) + tuple(straight_cards), HAND_RANKINGS[5]

    # Three of a Kind.
    if 3 in counts:
        triple_rank = next(rank for rank, count in rank_counts.items() if count == 3)
        kickers = sorted([rank for rank in ranks if rank != triple_rank], reverse=True)[:2]
        return (4, triple_rank) + tuple(kickers), HAND_RANKINGS[4]

    # Two Pair.
    if counts.count(2) >= 2:
        pairs = sorted([rank for rank, count in rank_counts.items() if count == 2], reverse=True)
        kickers = [rank for rank in ranks if rank not in pairs]
        return (3, pairs[0], pairs[1], max(kickers)), HAND_RANKINGS[3]

    # One Pair.
    if 2 in counts:
        pair_rank = next(rank for rank, count in rank_counts.items() if count == 2)
        kickers = sorted([rank for rank in ranks if rank != pair_rank], reverse=True)[:3]
        return (2, pair_rank) + tuple(kickers), HAND_RANKINGS[2]

    # High Card.
    return (1,) + tuple(sorted_ranks[:5]), HAND_RANKINGS[1]


def compare_hands(hand1, hand2):
    hand1_value, _ = hand1
    hand2_value, _ = hand2
    
    # Compare tuple values element by element
    for val1, val2 in zip(hand1_value, hand2_value):
        if val1 > val2:
            return 1
        elif val1 < val2:
            return -1
    
    # If we get here, all elements are equal
    return 0


def best_hand(hole_cards, river):
    # From 7 cards, choose the best 5-card combination.
    all_combinations = itertools.combinations(hole_cards + river, 5)
    return max(
        (evaluate_hand(list(combo)) for combo in all_combinations),
        key=lambda x: x[0]  # Sort by the hand value tuple
    )


def showdown(self, game):
    print("Showdown")
    # Handle single player win
    active_players = [p for p in game.players
                 if p.state not in ("folded", "out")]  # find all players in play
    if len(active_players) == 1:  # if only one player left, they win by default
        winner = next(
            p for p in game.players if p.username == active_players[0].username
        )
        for p in game.players:
            if p.state == 'betting':
                p.state = 'active'
        game.state = f"{winner.username} wins by default!"
        game.latestMove = f"{winner.username} receives ${game.pot} by default"
        winner.chips += game.pot
        game.pot = 0
        game.side_pots = []
        game.save()
        return jsonify(
            {
                "main_winners": [winner.username],
                "payouts": [],
                "latestMove": game.latestMove,
            }
        ), 200

    # Get all players still in the hand (active + all-in)
    contenders = list({p.username: p for p in (game.activePlayers + [p for p in game.players if p.state == "all-in"])}.values())

    # Evaluate hands for all contenders
    results = {}
    for player in contenders:
        hand_result = best_hand(player.cards, game.river[:5])
        results[player.username] = hand_result

    payouts_log = []
    for side_pot in sorted(game.side_pots, key=lambda x: x.minBet):
        eligible_contenders = side_pot.eligible_players
        # Find best hand using the hand comparison function
        pot_winners = []
        best_hand_result = None

        for uname in eligible_contenders:
            if uname not in results:
                continue
                
            hand_result = results[uname]
            
            if best_hand_result is None:
                best_hand_result = hand_result
                pot_winners = [uname]
            else:
                comparison = compare_hands(hand_result, best_hand_result)
                if comparison > 0:
                    best_hand_result = hand_result
                    pot_winners = [uname]
                elif comparison == 0:
                    pot_winners.append(uname)

        # Split the pot among winners
        split_amount = side_pot.payout // len(pot_winners)
        remainder = side_pot.payout % len(pot_winners)

        # Distribute winnings and record payout
        for winner in pot_winners:
            player = next(p for p in game.players if p.username == winner)
            player.chips += split_amount
            game.pot -= split_amount

        # Give remainder to first winner if any
        if remainder:
            first_winner = next(p for p in game.players if p.username == pot_winners[0])
            first_winner.chips += remainder

        # Log the payout details
        payouts_log.append(
            {
                "winners": pot_winners,
                "pot_size": side_pot.payout,
                "hand_won": results[pot_winners[0]][1],
                "each_gets": split_amount,
                "remainder_to": pot_winners[0] if remainder else None,
            }
        )

    game.side_pots = []

    if game.pot > 0:
        main_amount = game.pot

        # Only players who put in at least the final minBet this round
        main_eligible = [
            p.username
            for p in contenders
            if getattr(p, "bet", 0) >= game.minBet
        ]

        # Determine best hand among eligible players using proper comparison
        best_hand_result = None
        winners = []
        
        for uname in main_eligible:
            if uname not in results:
                continue
                
            hand_result = results[uname]
            
            if best_hand_result is None:
                best_hand_result = hand_result
                winners = [uname]
            else:
                comparison = compare_hands(hand_result, best_hand_result)
                if comparison > 0:
                    best_hand_result = hand_result
                    winners = [uname]
                elif comparison == 0:
                    winners.append(uname)

        # Split the pot and handle remainder
        split_amt = main_amount // len(winners)
        rem_amt = main_amount % len(winners)
        for uname in winners:
            pl = next(p for p in game.players if p.username == uname)
            pl.chips += split_amt
        if rem_amt:
            first = next(p for p in game.players if p.username == winners[0])
            first.chips += rem_amt

        # Prepend to your payouts log as the "main pot"
        payouts_log.insert(0, {
            "winners": winners,
            "pot_size": main_amount,
            "hand_won": results[winners[0]][1],
            "each_gets": split_amt,
            "remainder_to": winners[0] if rem_amt else None,
        })

        # Clear out the pot so it can't be paid twice
        game.pot = 0

    summary_lines = []
    for payout in payouts_log:
        winner_names = " & ".join(payout["winners"])
        summary = f"{winner_names} won ${payout['pot_size']} with {payout['hand_won']}"

        if len(payout["winners"]) > 1:
            summary += f" (${payout['each_gets']} each"
            if payout["remainder_to"]:
                summary += f", +$1 to {payout['remainder_to']}"
            summary += ")"

        summary_lines.append(summary)

    time.sleep(2)
    game.state = "Final: " + " | ".join(summary_lines)

    # Get main pot winners
    main_winners = payouts_log[0]["winners"] if payouts_log else []
    game.save()
    return jsonify(
        {
            "main_winners": main_winners,
            "payouts": payouts_log,
            "latestMove": game.latestMove,
        }
    ), 200