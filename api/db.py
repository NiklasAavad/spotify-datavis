# Global dicts, appear kinda as a database!
track_artist_dict = {}
artist_genre_dict = {}

def is_track_saved(track_id):
    return track_id in track_artist_dict

def add_track_artists(track_id, artist_ids):
    track_artist_dict[track_id] = artist_ids

def is_artist_saved(artist_id):
    return artist_id in artist_genre_dict

def add_artist_genre(artist_id, genre):
    artist_genre_dict[artist_id] = genre

# TODO only for testing purposes
def print_db():
    print("PRINTING DB")
    print(track_artist_dict)
    print(artist_genre_dict)
    print("DONE PRINTING DB")
