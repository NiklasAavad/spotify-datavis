from pickle import load
import pandas as pd
from query import get_artist_ids, get_several_tracks
from db import write_artist_ids, save_db, load_db, get_artist_ids_from_db, OVERwrite_artist_ids, is_track_saved, get_tracks_artist_db
import json

def write_to_db(file_path):
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
        

if __name__ == "__main__":
    """ file_path = '../../unique_charts.csv' """
    file_path = '../../top200_charts.csv'
    """ write_to_db(file_path) """
    check_if_all_tracks_is_in_db(file_path)
    """ output_path = "../../charts_missing_from_db.json" """
    """ remove_tracks_that_are_in_db(file_path, output_path) """
    """ track_artist_for_tracks_not_in_db() """
    """ remove_duplicates_from_artist_ids() """
