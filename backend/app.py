from flask import Flask, jsonify, request
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
        "USA": 0.90,
        "Canada": 0.80,
        "Mexico": 0.85,
        "Spain": 0.80,
        "Portugal": 0.90,
        "France": 0.70,
        "Italy": 0.75,
        "Germany": 0.20,
        "England": 0.75,
        "Denmark": 0.90,
        "Sweden": 0.15,
        "Norway": 0.80,
        "Finland": 0.90,
        "Russia": 0.70,
        "China": 0.10,
        "Japan": 0.50,
        "South Korea": 0.60,
        "India": 0.30,
        "Australia": 0.80,
        "New Zealand": 0.90,
    }

    return jsonify(fake_data)

@app.route('/api/score')
def score():
    conn, cursor = connect_to_db()

    try:
        if cursor is None:
            raise Exception("No database connection")

        lower_bound = float(request.args.get("lower_bound", 0.0))
        upper_bound = float(request.args.get("upper_bound", 1.0))
        
        from_date, to_date = get_from_and_to_date()

        query = """
            SELECT
                region,
                (COUNT(CASE WHEN danceability >= %s AND danceability <= %s THEN 1 END) / COUNT(*))
            FROM spotify_chart
            WHERE date BETWEEN %s AND %s
            GROUP BY region;
        """

        cursor.execute(query, (lower_bound, upper_bound, from_date, to_date))

        # Fetch the result
        result = cursor.fetchall()

        # Create a dictionary with region as the key and percentage as the value
        data_dict = {row[0]: row[1] for row in result}

        return jsonify(data_dict)
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

@app.route('/api/attribute')
def attribute():
    conn, cursor = connect_to_db()

    try:
        if cursor is None:
            raise Exception("No database connection")

        attribute = request.args.get("attribute")
        if attribute is None:
            raise Exception("No attribute specified")

        from_date, to_date = get_from_and_to_date()

        query = f"""
            SELECT
                region,
                AVG({attribute})
            FROM spotify_chart
            WHERE date BETWEEN %s AND %s
            GROUP BY region;
        """

        cursor.execute(query, (from_date, to_date))

        # Fetch the result
        result = cursor.fetchall()

        # Create a dictionary with region as the key and average as the value
        data_dict = {row[0]: row[1] for row in result}

        return jsonify(data_dict)
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

@app.route('/api/metrics')
def metrics():
    conn, cursor = connect_to_db()

    try:
        if cursor is None:
            raise Exception("No database connection")

        countries = request.args.get("countries")
        if countries is None:
            raise Exception("No countries specified")
        country_list = [country.strip() for country in countries.split(',')]

        from_date, to_date = get_from_and_to_date()

        query = f"""
            SELECT
                id, region, danceability, chart_rank
            FROM spotify_chart
            WHERE 
                date BETWEEN %s AND %s
                AND region IN ({', '.join(['%s' for _ in country_list])})
        """

        cursor.execute(query, (from_date, to_date) + tuple(country_list))

        # Fetch the result
        result = cursor.fetchall()

        json_objects = [
            {
                "id": row[0],
                "region": row[1],
                "danceability": row[2],
                "chart_rank": row[3]
            }
            for row in result
        ]

        return jsonify(json_objects)
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

# Assumes active request
def get_from_and_to_date():
    from_date = request.args.get("fromDate", "2017-01-01")
    to_date = request.args.get("toDate", "2021-12-31")
    return from_date, to_date

def connect_to_db():
    global cursor, conn
    conn = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )
    return conn, conn.cursor()

if __name__ == '__main__':
    app.run()
