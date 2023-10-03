from apibasics import get, track_url, album_url, artist_url
from db import is_track_saved, add_track_artists, is_artist_saved, add_artist_genre, print_db
from testsongs import *

def get_track(track_id):
    return get(track_url + track_id)

def get_several_tracks(track_ids):
    track_ids_string = ','.join(track_ids)
    params = {
        "ids": track_ids_string
    }
    return get(track_url, params=params)

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
    genres = album_response['genres']
    return genres
    
def get_genre_by_artist(track_response):
    artists = track_response['artists']
    artist_ids = [artist['id'] for artist in artists]
    all_genres = []
    for id in artist_ids:
        artist_response = get(artist_url + id)
        all_genres += artist_response['genres']
    return all_genres

# Assumes that a query for several tracks has been made
# TODO, need to consider how to properly go through artist ids, if there are more than 50 (limit from Spotify)
# Potentially have some form of Producer/Consumer system?
def get_several_artists(artist_ids):
    artist_ids_string = ','.join(artist_ids)
    params = {
        "ids": artist_ids_string
    }
    return get(artist_url, params=params)

def update_genre_for_artists(artist_ids):
    # TODO Cut it up into batches of size 50 or use Producer/Consumer?
    # TODO could also go through all tracks first and find their artists - THEN go through all artist and find their genres!
    artist_responses = get_several_artists(artist_ids)
    artists = artist_responses['artists']
    for artist in artists:
        artist_id = artist['id']
        genres = artist['genres']
        add_artist_genre(artist_id, genres)

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
        add_track_artists(track_id, artist_ids)

    return all_artist_ids

if __name__ == "__main__":
    tracks = [sprinter, hips_no_lie]
    update_genre_for_tracks(tracks)
    print_db()
