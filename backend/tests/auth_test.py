import requests

BASE_URL = "http://127.0.0.1:6000/user"  # Update if your server runs on a different host or port

def test_create_user():
    """
    Sends a POST request to create a new user.
    Expects to receive a 201 status code on success.
    """
    url = f"{BASE_URL}/create-user"
    payload = {
        "username": "testuser",
        "password": "testpass",
        "email": "test@example.com"
    }
    response = requests.post(url, json=payload)
    
    print("=== test_create_user ===")
    print("Status Code:", response.status_code)
    print("Response Body:", response.text)
    print("")

def test_auth_user():
    """
    Sends a POST request to authenticate the user created above.
    Expects to receive a 200 status code if the user is found.
    """
    url = f"{BASE_URL}/auth-user"
    payload = {
        "username": "testuser",
        "password": "testpass"
    }
    response = requests.post(url, json=payload)

    print("=== test_auth_user ===")
    print("Status Code:", response.status_code)
    print("Response Body:", response.text)
    print("")

if __name__ == "__main__":
    # Execute tests in order
    test_create_user()
    test_auth_user()
