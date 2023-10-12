import json

# Global dicts, appear kinda as a database!
track_artist_dict = {}
artist_genre_dict = {}
all_artist_ids = []
artist_wo_genre = []

# Paths for db
track_artist_dict_path = 'track_artist_dict.json'
artist_genre_dict_path = 'artist_genre_dict.json'
all_artist_ids_path = 'all_artist_ids.json'
index_of_how_far_we_made_it_path = 'index_of_how_far_we_made_it.json'
artist_wo_genre_path = 'artists_wo_genre.json'

def load_db():
    global track_artist_dict
    global artist_genre_dict
    global all_artist_ids
    global artist_wo_genre

    with open(track_artist_dict_path) as json_file:
        track_artist_dict = json.load(json_file)

    with open(artist_genre_dict_path) as json_file:
        artist_genre_dict = json.load(json_file)

    with open(all_artist_ids_path) as json_file:
        all_artist_ids = json.load(json_file)

    with open(artist_wo_genre_path) as json_file:
        artist_wo_genre = json.load(json_file)

    with open(index_of_how_far_we_made_it_path) as json_file:
        return json.load(json_file)


def save_db(index_of_how_far_we_made_it):
    # raise Exception("Do not use this method, we should have all data. Uncomment the method below, if you really need it")

    with open(index_of_how_far_we_made_it_path, 'w') as outfile:   
        json.dump(index_of_how_far_we_made_it, outfile)

    with open(artist_genre_dict_path, 'w') as outfile:
        json.dump(artist_genre_dict, outfile)

def is_track_saved(track_id):
    return track_id in track_artist_dict

def add_track_artists(track_id, artist_ids):
    track_artist_dict[track_id] = artist_ids

def get_tracks_artist_db():
    return track_artist_dict

def is_artist_saved(artist_id):
    return artist_id in artist_genre_dict

def add_artist_genre(artist_id, genre):
    artist_genre_dict[artist_id] = genre

def get_artist_genre_db():
    return artist_genre_dict

def write_artist_ids(artist_ids):
    global all_artist_ids
    all_artist_ids += artist_ids

def OVERwrite_artist_ids(artist_ids):
    global all_artist_ids
    all_artist_ids = artist_ids

def get_artist_ids_from_db():
    return all_artist_ids

def get_artist_wo_genre_from_db():
    return artist_wo_genre

def load_how_far_we_made_it():
    with open(index_of_how_far_we_made_it_path) as json_file:
        return json.load(json_file)


# TODO only for testing purposes
def print_db():
    with open(index_of_how_far_we_made_it_path, 'w') as outfile:   
        json.dump(-1, outfile)
