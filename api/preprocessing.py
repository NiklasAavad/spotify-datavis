import pandas as pd

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

def check_number_of_rows_in_chart(file_path):
    chunk_size = 1000000 
    chunks = pd.read_csv(file_path, chunksize=chunk_size)

    rows = 0

    for i, chunk in enumerate(chunks):
        print('Processing chunk:', i+1)
        rows += len(chunk)

    print('Number of rows in chart:', rows)

if __name__ == "__main__":
    file_path = '../../unique_charts.csv'
    check_number_of_rows_in_chart(file_path)
