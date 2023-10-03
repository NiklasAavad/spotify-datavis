import json

# Global dicts, appear kinda as a database!
track_artist_dict = {}
artist_genre_dict = {}
all_artist_ids = []

def load_db():
    global track_artist_dict
    global artist_genre_dict
    global all_artist_ids

    with open('track_artist_dict.json') as json_file:
        track_artist_dict = json.load(json_file)

    with open('artist_genre_dict.json') as json_file:
        artist_genre_dict = json.load(json_file)

    with open('all_artist_ids.json') as json_file:
        all_artist_ids = json.load(json_file)

def is_track_saved(track_id):
    return track_id in track_artist_dict

def add_track_artists(track_id, artist_ids):
    track_artist_dict[track_id] = artist_ids

def is_artist_saved(artist_id):
    return artist_id in artist_genre_dict

def add_artist_genre(artist_id, genre):
    artist_genre_dict[artist_id] = genre

def write_artist_ids(artist_ids):
    global all_artist_ids
    all_artist_ids += artist_ids
    # TODO write to file?

# TODO only for testing purposes
def print_db():
    print("PRINTING DB")
    print(len(track_artist_dict))
    print(len(artist_genre_dict))
    print("PRINTING ALL ARTIST IDS")
    print(len(all_artist_ids))
    print("DONE PRINTING DB")
