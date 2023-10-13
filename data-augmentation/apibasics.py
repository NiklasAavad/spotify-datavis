import requests
import time
import os
from dotenv import load_dotenv, set_key

dotenv_path = '../.env'
load_dotenv(dotenv_path)

api_url_base = "https://api.spotify.com/"
api_url = api_url_base + "v1/"

track_url = api_url + "tracks/"
album_url = api_url + "albums/"
artist_url = api_url + "artists/"
track_feature_url = api_url + "audio-features/"

def ensure_valid_token(): 
    current_time = time.time()

    expire_ts = os.getenv("EXPIRES_AT")
    is_token_valid = expire_ts is not None and current_time <= float(expire_ts)
    if is_token_valid:
        return

    response = get_access_token()
    if response.status_code != 200:
        raise Exception("No access token was received:", response.text)
    parsed_response = response.json()

    token = parsed_response['access_token']
    set_key(dotenv_path, 'TOKEN', token)

    expires_at = current_time + parsed_response['expires_in']
    set_key(dotenv_path, 'EXPIRES_AT', str(expires_at))

    load_dotenv(dotenv_path, override=True) # Needs to reload to be able to use the new token!

    print("Access token was successfully updated!")

def get(url, params=None):
    ensure_valid_token()

    token = os.getenv('TOKEN')
    headers={'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 429:
        print("Too many requests, waiting 10 seconds...")
        time.sleep(10)
        return get(url, params)

    if response.status_code != 200:
        raise Exception("Error when calling Spotify API:", response.status_code, response.text)

    return response.json()

def get_access_token():
    token_url = "https://accounts.spotify.com/api/token"

    client_id = os.getenv("CLIENT_ID")
    if client_id is None:
        raise Exception("Please remember to add your Spotify Api Client Id to the .env file")

    client_secret = os.getenv("CLIENT_SECRET")
    if client_secret is None:
        raise Exception("Please remember to add your Spotify Api Client Secret to the .env file")

    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=payload, headers=headers)

    return response
