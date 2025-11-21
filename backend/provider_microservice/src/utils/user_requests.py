import requests
import os

api_user_url =  os.getenv("USER_API_URL", "http://localhost:3000")

def create_user(email: str) -> dict:
    try:
        response = requests.post(
            f"{api_user_url}/",
            json={
                "email": email,
                "role": "provider"
            }
        )

        if response.status_code != 201:
            raise Exception(f"Error creating user: {response.text}")
        else:
            return response.json()
    except requests.RequestException as e:
        raise Exception(f"Error connecting to user service: {str(e)}")


