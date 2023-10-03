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

# Global dicts, appear kinda as a database!
track_artist_dict = {} # TODO maybe choose one of these that works best?
artist_track_dict = {} # TODO maybe choose one of these that works best?
artist_genre_dict = {}

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
    headers={ 'Authorization': f'Bearer {token}' }
    return requests.get(url, headers=headers, params=params)

def get_track(track_id):
    response = get(track_url + track_id)
    if response.status_code != 200:
        raise Exception("Could not find song with id:", track_id, "text:", response.text) # TODO should probably not raise exception, but just keep going
    return response.json()

def get_several_tracks(track_ids):
    track_ids_string = ','.join(track_ids)
    params = {
        "ids": track_ids_string
    }
    responses = get(track_url, params=params)
    if responses.status_code != 200:
        raise Exception("Something went wrong when getting several tracks", responses.text)
    return responses.json()

def get_genres_from_track_id(track_id):
    track_response = get_track(track_id)
    return get_genres_from_track_response(track_response)

def get_genres_from_track_response(track_response):
    genres = get_genre_by_album(track_response)
    if len(genres) == 0:
        genres = get_genre_by_artist(track_response)
    return genres

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
            raise Exception("Could not find artist with id:", id, "text:", artist_response.text) # TODO should probably not raise exception, but just keep going
        all_genres += artist_response.json()['genres']
    return all_genres

# Assumes that a query for several tracks has been made
# TODO, need to consider how to properly go through artist ids, if there are more than 50 (limit from Spotify)
# Potentially have some form of Producer/Consumer system?
def get_several_artists(artist_ids):
    artist_ids_string = ','.join(artist_ids)
    params = {
        "ids": artist_ids_string
    }
    responses = get(artist_url, params=params)
    if responses.status_code != 200:
        raise Exception("Something went wrong when getting several tracks", responses.text)
    return responses.json()

def update_genre_for_artists(artist_ids):
    # TODO Cut it up into batches of size 50 or use Producer/Consumer?
    # TODO could also go through all tracks first and find their artists - THEN go through all artist and find their genres!
    artist_responses = get_several_artists(artist_ids)
    artists = artist_responses['artists']
    for artist in artists:
        artist_id = artist['id']
        genres = artist['genres']
        artist_genre_dict[artist_id] = genres

# TODO clipholder
def update_genre_for_tracks(track_ids):
    # TODO Cut it up into batches of size 50
    track_responses = get_several_tracks(track_ids)
    tracks = track_responses['tracks']
    artist_ids = get_artist_ids(tracks)
    update_genre_for_artists(artist_ids)
    
def get_artist_ids(tracks):
    all_artist_ids = []
    for track in tracks:
        artists = track['artists']
        artist_ids = [artist['id'] for artist in artists]
        all_artist_ids += artist_ids

        # Update db dicts
        track_id = track['id']
        track_artist_dict[track_id] = artist_ids
        for artist_id in artist_ids:
            artist_track_dict[artist_id] = track_id

    return all_artist_ids

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
    tracks = [sprinter, hips_no_lie]
    update_genre_for_tracks(tracks)
    print("track/artist")
    print(track_artist_dict)
    print("artist/track")
    print(artist_track_dict)
    print("artist/genre")
    print(artist_genre_dict)
