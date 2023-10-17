import pandas as pd
from query import get_artist_ids, get_several_tracks, update_genre_for_artists, get_several_track_features, write_track_features_to_db
from db import write_artist_ids, save_db, load_db, get_artist_ids_from_db, OVERwrite_artist_ids, is_track_saved, get_tracks_artist_db, is_artist_saved, get_artist_genre_db, get_artist_wo_genre_from_db, get_list_of_all_tracks, get_track_feature_db
import json

def write_track_artist_to_db(file_path):
    chunk_size = 50
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    unsaved_artists = []

    start = load_db() + 1

    for i, chunk in enumerate(chunks, start=start):
        print('Processing chunk:', i+1)
        urls = [url.split('/')[-1] for url in chunk['url']]
        track_responses = get_several_tracks(urls)
        tracks = track_responses['tracks']
        unsaved_artists += get_artist_ids(tracks)
        if i % 50 == 0:
            print('Saving to db')
            write_artist_ids(unsaved_artists)
            save_db(i)
            unsaved_artists = []
   
    # track -> artist dict will be written during the get_aritst_ids method
    write_artist_ids(unsaved_artists)
    save_db(-1) # mean we're done!!!

def write_artist_genre_to_db():
    how_far_we_have_come = load_db()
    artist_list = get_artist_wo_genre_from_db()
    print("Arists in list:", len(artist_list))

    batch_size = 50

    # TODO change to how_far_we_have_come
    for i in range(0, len(artist_list), batch_size):
        print(f'Processing #{i}')
        batch = artist_list[i : i+batch_size]
        update_genre_for_artists(batch)
        if i % 1000 == 0:
            print('Saving to db')
            save_db(i)

    save_db(-1) # mean we're done!!!

def track_artist_for_tracks_not_in_db():
    _ = load_db()

    tracks_not_in_db = []
    with open('../../charts_missing_from_db.json') as json_file:
        tracks_not_in_db = json.load(json_file)
        print("Loaded tracks not in db")

    print("number of tracks not in db:", len(tracks_not_in_db))

    batch_size = 50

    unsaved_artists = []

    for i in range(0, len(tracks_not_in_db), batch_size):
        print(f'Processing #{i}')
        batch = tracks_not_in_db[i : i+batch_size]
        track_responses = get_several_tracks(batch)
        tracks = track_responses['tracks']
        unsaved_artists += get_artist_ids(tracks)
        if i % 1000 == 0:
            print('Saving to db')
            write_artist_ids(unsaved_artists)
            save_db(i)
            unsaved_artists = []

    write_artist_ids(unsaved_artists)
    save_db(-1) # mean we're done!!!


def remove_duplicates_from_artist_ids():
    how_far_we_have_come = load_db()
    artist_ids = get_artist_ids_from_db()
    artist_ids = list(set(artist_ids))
    OVERwrite_artist_ids(artist_ids)
    save_db(how_far_we_have_come)

def remove_duplicates(file_path, output_file_path):
    chunk_size = 1000000 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    unique_rows = pd.DataFrame()

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        chunk.drop_duplicates(subset='url', inplace=True)
        unique_rows = unique_rows.append(chunk)

    print('Saving unique rows to file')
    unique_rows.to_csv(output_file_path, index=False)  # index=False to exclude the index column

def remove_viral50(file_path, output_file_path):
    chunk_size = 1000000 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    filtered_rows = pd.DataFrame()

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        chunk = chunk[chunk['chart'] != 'viral50']
        filtered_rows = filtered_rows.append(chunk)

    print('Saving top200 rows to file')
    filtered_rows.to_csv(output_file_path, index=False)  # index=False to exclude the index column

def get_id_from_url(url):
    return url.split('/')[-1]


def remove_tracks_that_are_in_db(file_path, output_file_path):
    _ = load_db()

    chunk_size = 10000
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    tracks_db = get_tracks_artist_db()
    keys = tracks_db.keys()

    tracks_missing_in_db = []

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i)
        for row in chunk.itertuples(index=False):
            url = row.url
            id = get_id_from_url(url)
            if id not in keys:
                tracks_missing_in_db.append(id)

    with open(output_file_path, 'w') as outfile:
        json.dump(tracks_missing_in_db, outfile)

def check_number_of_rows_in_chart(file_path):
    chunk_size = 1000000 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    rows = 0

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        rows += len(chunk)

    print('Number of rows in chart:', rows)

def check_if_all_tracks_is_in_db(file_path):
    chunk_size = 100000
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    _ = load_db()

    tracks_not_in_db = 0

    for i, chunk in enumerate(chunks):
        tracks_missing_from_current_chunk = 0
        urls = [url.split('/')[-1] for url in chunk['url']]
        for url in urls:
            if not is_track_saved(url):
                tracks_not_in_db += 1
                tracks_missing_from_current_chunk += 1
        print(f'Tracks missing from chunk {i}:', tracks_missing_from_current_chunk)

    print("Number of tracks, NOT in db:", tracks_not_in_db)

def check_if_all_artists_is_in_db():
    _ = load_db()
    all_artist_ids = get_artist_ids_from_db()

    artists_not_in_db = 0

    for artist_id in all_artist_ids:
        if not is_artist_saved(artist_id):
            print(artist_id)
            artists_not_in_db += 1

    print("Number of artists, NOT in db:", artists_not_in_db)

def check_if_all_tracks_are_associated_with_genres():
    _ = load_db()
    track_artist_db = get_tracks_artist_db()

    missing_artists = 0

    for track_id, artist_ids in track_artist_db.items():
        for artist_id in artist_ids:
            if not is_artist_saved(artist_id):
                missing_artists += 1
                print(f'Artist {artist_id} is not in db, for track {track_id}')

    print("Number of artists, NOT in db:", missing_artists)

def get_all_genres():
    _ = load_db()
    
    artist_genre_dict = get_artist_genre_db()
    all_genres = set()

    for _, genres in artist_genre_dict.items():
        all_genres.update(genres)

    print("Number of genres:", len(all_genres))
    print("Genres:", all_genres)

# TODO wip
def get_genre_count():
    _ = load_db()
    
    artist_genre_dict = get_artist_genre_db()
    genre_count = {}

    for _, genres in artist_genre_dict.items():
        for genre in genres:
            if genre in genre_count:
                genre_count[genre] += 1
            else:
                genre_count[genre] = 1

    """ genres_with_one_count = 0 """
    """ for genre, count in genre_count.items(): """
    """     if count == 1: """
    """         genres_with_one_count += 1 """
    """         print(genre) """
    """"""
    """ print("Number of genres with 1 count:", genres_with_one_count) """


    new_artist_genre_dict = {}
    new_genres = set()
    artist_wo_genre = 0



    for artist, genres in artist_genre_dict.items():
        most_popular_genre = None
        count_of_most_popular = 0
        for genre in genres:
            count = genre_count[genre]
            if count > count_of_most_popular:
                most_popular_genre = genre
                count_of_most_popular = count
        if most_popular_genre == None:
            # print("Nothing was found, count of most popular:", count_of_most_popular, "artist:", artist)
            artist_wo_genre += 1
        new_artist_genre_dict[artist] = most_popular_genre
        new_genres.add(most_popular_genre)

    print("Number of genres:", len(new_genres))
    print("Songs without genre:", artist_wo_genre)

    """ genre_count = {} """
    """ for _, genres in new_artist_genre_dict.items(): """
    """     for genre in genres: """
    """         if genre in genre_count: """
    """             genre_count[genre] += 1 """
    """         else: """
    """             genre_count[genre] = 1 """
    """"""
    """ genres_with_one_count = 0 """
    """ for genre, count in genre_count.items(): """
    """     if count == 1: """
    """         genres_with_one_count += 1 """
    """         print(genre) """
    """"""
    """ print("Number of genres with 1 count:", genres_with_one_count) """

def check_artists_without_genre():
    _ = load_db()
    
    artist_genre_dict = get_artist_genre_db()
    artists_total = 0
    artist_wo_genre = 0

    for artist, genres in artist_genre_dict.items():
        artists_total += 1
        if len(genres) == 0:
            print(artist)
            artist_wo_genre += 1

    print("Artists without genre:", artist_wo_genre)
    print("Artists in total:", artists_total)

def write_track_features(): 
    how_far_we_have_come = load_db()

    track_list = get_list_of_all_tracks()

    batch_size = 100

    for i in range(how_far_we_have_come, len(track_list), batch_size):
        print(f'Processing #{i}')
        batch = track_list[i : i+batch_size]
        
        track_feature_responses = get_several_track_features(batch)
        write_track_features_to_db(track_feature_responses['audio_features'])

        if i % 1000 == 0:
            print('Saving to db')
            save_db(i)

    save_db(-1) # mean we're done!!!

def check_if_all_tracks_have_features():
    _ = load_db()

    track_list = get_list_of_all_tracks()
    
    track_feature_dict = get_track_feature_db()

    tracks_wo_features = 0

    for track in track_list:
        if track not in track_feature_dict:
            print(track)
            tracks_wo_features += 1

    print("tracks without features", tracks_wo_features)

def check_track_features_for_all_songs():
    _ = load_db()

    track_feature_dict = get_track_feature_db()

    tracks_wo_features = 0
    tracks_wo_danceability = 0
    tracks_wo_energy = 0
    tracks_wo_acousticness = 0
    tracks_wo_instrumentalness = 0
    tracks_wo_liveness = 0
    tracks_wo_loudness = 0
    tracks_wo_speechiness = 0
    tracks_wo_valence = 0
    tracks_wo_bpm = 0
    tracks_with_instrumentalness = 0

    for track, features in track_feature_dict.items():
        if features == None:
            print(track)
            tracks_wo_features += 1
        if features['danceability'] == None or features['danceability'] == 0:
            tracks_wo_danceability += 1
        if features['energy'] == None or features['energy'] == 0:
            tracks_wo_energy += 1
        if features['acousticness'] == None or features['acousticness'] == 0:
            tracks_wo_acousticness += 1
        if features['instrumentalness'] == None or features['instrumentalness'] == 0:
            tracks_wo_instrumentalness += 1
        if features['liveness'] == None or features['liveness'] == 0:
            tracks_wo_liveness += 1
        if features['loudness'] == None or features['loudness'] == 0:
            tracks_wo_loudness += 1
        if features['speechiness'] == None or features['speechiness'] == 0:
            tracks_wo_speechiness += 1
        if features['valence'] == None or features['valence'] == 0:
            tracks_wo_valence += 1
        if features['tempo'] == None or features['tempo'] == 0:
            tracks_wo_bpm += 1
        if features['instrumentalness'] == None or features['instrumentalness'] == 1:
            tracks_with_instrumentalness += 1

    print("tracks without features", tracks_wo_features)
    print("tracks without danceability", tracks_wo_danceability)
    print("tracks without energy", tracks_wo_energy)
    print("tracks without acousticness", tracks_wo_acousticness)
    print("tracks without instrumentalness", tracks_wo_instrumentalness)
    print("tracks without liveness", tracks_wo_liveness)
    print("tracks without loudness", tracks_wo_loudness)
    print("tracks without speechiness", tracks_wo_speechiness)
    print("tracks without valence", tracks_wo_valence)
    print("tracks without bpm", tracks_wo_bpm)
    print("tracks with instrumentalness", tracks_with_instrumentalness)

def print_one_row(file_path):
    chunk_size = 100 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        print(chunk.iloc[0])
        break

# We can remove chart category, because we no longer have viral50 in the dataset
def remove_chart_category(file_path, output_file_path):
    chunk_size = 1000000 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    filtered_rows = pd.DataFrame()

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        chunk = chunk.drop(columns=['chart'])
        filtered_rows = filtered_rows.append(chunk)

    print('Saving top200 rows to file')
    filtered_rows.to_csv(output_file_path, index=False)  # index=False to exclude the index column


if __name__ == "__main__":
    print_one_row('../../top200_charts.csv')
    print_one_row('../../top200_charts_no_category.csv')
    # remove_chart_category('../../top200_charts.csv', '../../top200_charts_no_category.csv')
