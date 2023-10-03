import requests
import time
import os
from dotenv import load_dotenv, set_key

dotenv_path = '.env'
load_dotenv(dotenv_path)

api_url_base = "https://api.spotify.com/"
api_url = api_url_base + "v1/"

track_url = api_url + "tracks/"
album_url = api_url + "albums/"
artist_url = api_url + "artists/"

shakira_song = "6mICuAdrwEjh6Y6lroV2Kg"
sprinter = "2FDTHlrBguDzQkp7PVj16Q"
hips_no_lie = "3ZFTkvIE7kyPt6Nu3PEa7V"
psycho = "0FWAIRd9Uz5uNek7cALYNC"

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

    load_dotenv(dotenv_path) # Needs to reload to be able to use the new token!

    print("Access token was successfully updated!")

def get(url):
    ensure_valid_token()
    token = os.getenv('TOKEN')
    headers={ 'Authorization': f'Bearer {token}' }
    return requests.get(url, headers=headers)

def get_track(track_id):
    response = get(track_url + track_id)
    if response.status_code != 200:
        raise Exception("Could not find song with id:", track_id, "text:", response.text) # TODO should probably not raise exception, but just keep going
    return response.json()

def get_genres(track_id):
    track_response = get_track(track_id)
    genres = get_genre_by_album(track_response)
    if len(genres) == 0:
        genres = get_genre_by_artist(track_response)
    print(genres)

def get_genre_by_album(track_response):
    album_id = track_response['album']['id']
    album_response = get(album_url + album_id)
    if album_response.status_code != 200:
        raise Exception("Could not find album with id:", album_id, "text:", album_response.text) # TODO should probably not raise exception, but just keep going
    genres = album_response.json()['genres']
    return genres
    
def get_genre_by_artist(track_response):
    artists = track_response['artists']
    artist_ids = [artist['id'] for artist in artists]
    all_genres = []
    for id in artist_ids:
        artist_response = get(artist_url + id)
        if artist_response.status_code != 200:
            raise Exception("Could not find artist with id:", id, "text:", arist_response.text) # TODO should probably not raise exception, but just keep going
        all_genres += artist_response.json()['genres']
    return all_genres

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

if __name__ == "__main__":
    get_genres(sprinter)
