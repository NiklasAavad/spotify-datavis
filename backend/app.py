from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

dotenv_path = '../.env'
load_dotenv(dotenv_path)

host = "localhost"
database = "spotify_datavis"
user = "root"
password = os.getenv("MYSQL_PASSWORD")
if password is None:
    raise Exception("Please remember to add your MySQL password to the .env file")

cursor = None
conn = None

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/test')
def test():
    fake_data = {
        "USA": 90,
        "Canada": 80,
        "Mexico": 85,
        "Spain": 80,
        "Portugal": 90,
        "France": 70,
        "Italy": 75,
        "Germany": 20,
        "England": 75,
        "Denmark": 90,
        "Sweden": 15,
        "Norway": 80,
        "Finland": 90,
        "Russia": 70,
        "China": 10,
        "Japan": 50,
        "South Korea": 60,
        "India": 30,
        "Australia": 80,
        "New Zealand": 90,
    }

    return jsonify(fake_data)

@app.route('/api/score')
def score():
    if cursor is None:
        raise Exception("No database connection")

    cursor.execute("""
        SELECT
            region,
            (COUNT(CASE WHEN danceability >= 0.7 THEN 1 END) / COUNT(*) * 100) AS percentage
        FROM spotify_chart
        GROUP BY region;
    """)

    # Fetch the result
    result = cursor.fetchall()

    # Create a dictionary with region as the key and percentage as the value
    data_dict = {row[0]: row[1] for row in result}

    return jsonify(data_dict)

def connect_to_db():
    global cursor, conn
    conn = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )
    cursor = conn.cursor()

if __name__ == '__main__':
    connect_to_db()
    if conn is None or not conn.is_connected():
        raise Exception("Could not connect to database")
    app.run()
