import requests
import time
import random
import string

BASE_URL = "http://127.0.0.1:4000"  # Pre-game endpoints
IN_GAME_URL = "http://127.0.0.1:4000/in_game"    # In-game endpoints

# def test_create_game():
#     """
#     Test the endpoint that inserts a new game document into the 'games' collection.
#     """
#     url = f"{BASE_URL}/create_game"
#     # Provide valid data that matches your game_model schema
#     payload = {
#         "gameId": "CTSL5V",
#         "smallBlind": 10.0,
#         "bigBlind": 20.0,
#         "initialChips": 1000.0,
#         "players": [
#             {
#                 "username": "Joe"
#             },
#             {
#                 "username": "Bob"
#             }
#         ],
#         "status": "waiting"
#     }
#     response = requests.post(url, json=payload)
#     print("=== /create_game ===")
#     print("Status Code:", response.status_code)
#     print("Response Text:", response.text, "\n")

def generate_game_id():
    """
    Generate a random 6-character game ID
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def test_join_game(name, gameId):
    """
    Tests the /join_game endpoint by sending a POST request
    to add a new player to the specified gameCode.
    """
    url = f"{BASE_URL}/pre_game/join_game"
    payload = {
        "gameId": gameId,  # Must match an existing gameCode in your DB
        "username": name
    }
    response = requests.post(url, json=payload)
    print("=== /join_game ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")

def test_make_bet(game_id, bet_type, amount):
    """
    Test the betting endpoint by sending a POST request with bet information.
    """
    url = f"{BASE_URL}/in_game/betting"
    payload = {
        "gameId": game_id,
        "bet_type": bet_type,
        "amount": amount
    }
    response = requests.post(url, json=payload)
    print(f"=== Betting: {bet_type} {amount} ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")
    return response

def simulate_betting_round(game_id):
    """
    Simulates a complete betting round with multiple players making different actions.
    """
    # Player 1 (UTG) raises to 60
    test_make_bet(game_id, "raise", 60)
    
    # Player 2 calls the raise
    test_make_bet(game_id, "call", 60)
    
    # Player 3 re-raises to 120
    test_make_bet(game_id, "raise", 120)
    
    # Player 4 folds
    test_make_bet(game_id, "fold", 0)
    
    # Player 5 calls the re-raise
    test_make_bet(game_id, "call", 120)
    
    # # Back to Player 1 who calls
    test_make_bet(game_id, "call", 120)
    
    # # Player 2 folds
    test_make_bet(game_id, "fold", 0)

def test_the_flop(game_id):
    """
    Test the flop endpoint by sending a POST request.
    """
    url = f"{IN_GAME_URL}/the-flop"
    payload = {
        "gameId": game_id
    }
    response = requests.post(url, json=payload)
    print("=== The Flop ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")
    return response

def test_the_turn(game_id):
    """
    Test the turn endpoint by sending a POST request.
    """
    url = f"{IN_GAME_URL}/the-turn"
    payload = {
        "gameId": game_id
    }
    response = requests.post(url, json=payload)
    print("=== The Turn ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")
    return response

def test_the_river(game_id):
    """
    Test the river endpoint by sending a POST request.
    """
    url = f"{IN_GAME_URL}/the-river"
    payload = {
        "gameId": game_id
    }
    response = requests.post(url, json=payload)
    print("=== The River ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")
    return response

def test_showdown(game_id):
    """
    Test the showdown endpoint by sending a POST request.
    """
    url = f"{IN_GAME_URL}/showdown"
    payload = {
        "gameId": game_id
    }
    response = requests.post(url, json=payload)
    print("=== Showdown ===")
    print("Status Code:", response.status_code)
    print("Response Text:", response.text, "\n")
    return response

# ... (imports and constants remain unchanged)

def simulate_betting_round(game_id):
    """
    Simulates a complete pre-flop betting round with 8 players.
    """
    test_make_bet(game_id, "raise", 40)   # Alice
    test_make_bet(game_id, "call", 40)    # Bob
    test_make_bet(game_id, "raise", 80)   # Charlie
    test_make_bet(game_id, "call", 80)    # David
    test_make_bet(game_id, "fold", 0)     # Eve
    test_make_bet(game_id, "call", 80)    # George
    test_make_bet(game_id, "fold", 0)     # Harry
    test_make_bet(game_id, "call", 80)    # Ian

def simulate_flop_betting_round(game_id):
    """
    Simulates a betting round after the flop with 8 players.
    """
    test_make_bet(game_id, "check", 0)    # Alice
    test_make_bet(game_id, "check", 0)    # Bob
    test_make_bet(game_id, "raise", 60)   # Charlie
    test_make_bet(game_id, "call", 60)    # David
    test_make_bet(game_id, "fold", 0)     # Eve
    test_make_bet(game_id, "fold", 0)     # George
    test_make_bet(game_id, "call", 60)    # Harry
    test_make_bet(game_id, "call", 60)    # Ian

def simulate_turn_betting_round(game_id):
    """
    Simulates a betting round after the turn with remaining players.
    """
    test_make_bet(game_id, "check", 0)    # Alice
    test_make_bet(game_id, "raise", 100) # Bob
    test_make_bet(game_id, "call", 100)  # Charlie
    test_make_bet(game_id, "fold", 0)    # David
    test_make_bet(game_id, "call", 100)  # Ian

def simulate_river_betting_round(game_id):
    """
    Simulates a betting round after the river with final active players.
    """
    test_make_bet(game_id, "raise", 120)  # Charlie
    test_make_bet(game_id, "call", 120)   # Bob
    test_make_bet(game_id, "fold", 0)     # Alice
    test_make_bet(game_id, "call", 120)   # Ian

def run_poker_round(round_number):
    GAME_ID = "SR9KCU"  # Use unique if needed
    print(f"\n\n=== STARTING POKER ROUND {round_number} - GAME ID: {GAME_ID} ===")

    usernames = ["Alice", "Bob", "Charlie", "David", "Eve", "George", "Harry", "Ian"]
    for name in usernames:
        test_join_game(name, GAME_ID)
    
    time.sleep(5)

    print("\n=== PRE-FLOP BETTING ROUND ===")
    simulate_betting_round(GAME_ID)
    time.sleep(2)

    print("\n=== THE FLOP ===")
    test_the_flop(GAME_ID)
    time.sleep(2)

    print("\n=== FLOP BETTING ROUND ===")
    simulate_flop_betting_round(GAME_ID)
    time.sleep(2)

    print("\n=== THE TURN ===")
    test_the_turn(GAME_ID)
    time.sleep(2)

    print("\n=== TURN BETTING ROUND ===")
    simulate_turn_betting_round(GAME_ID)
    time.sleep(2)

    print("\n=== THE RIVER ===")
    test_the_river(GAME_ID)
    time.sleep(2)

    print("\n=== RIVER BETTING ROUND ===")
    simulate_river_betting_round(GAME_ID)
    time.sleep(2)

    print("\n=== SHOWDOWN ===")
    test_showdown(GAME_ID)
    print(f"\n=== COMPLETED POKER ROUND {round_number} ===")

if __name__ == "__main__":
    run_poker_round(1)

    
    # print("\n\nWaiting 10 seconds before starting next round...")
    # time.sleep(10)
    
    # run_poker_round(2)
    
    # print("\n\nWaiting 10 seconds before starting next round...")
    # time.sleep(10)
    
    # run_poker_round(3)
