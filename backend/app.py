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

        dance_lower_bound, dance_upper_bound, \
        energy_lower_bound, energy_upper_bound, \
        valence_lower_bound, valence_upper_bound, \
        acousticness_lower_bound, acousticness_upper_bound, \
        instrumentalness_lower_bound, instrumentalness_upper_bound, \
        liveness_lower_bound, liveness_upper_bound, \
        speechiness_lower_bound, speechiness_upper_bound = _get_score_params(request)

        from_date, to_date = get_from_and_to_date()

        query = """
            SELECT
                region,
                (COUNT(CASE 
                       WHEN danceability >= %s AND danceability <= %s 
                       AND energy >= %s AND energy <= %s
                       AND valence >= %s AND valence <= %s
                       AND acousticness >= %s AND acousticness <= %s
                       AND instrumentalness >= %s AND instrumentalness <= %s
                       AND liveness >= %s AND liveness <= %s
                       AND speechiness >= %s AND speechiness <= %s
                       THEN 1 END) / COUNT(*))
            FROM spotify_chart
            WHERE date BETWEEN %s AND %s
            GROUP BY region;
        """

        params = (
            dance_lower_bound, dance_upper_bound,
            energy_lower_bound, energy_upper_bound,
            valence_lower_bound, valence_upper_bound,
            acousticness_lower_bound, acousticness_upper_bound,
            instrumentalness_lower_bound, instrumentalness_upper_bound,
            liveness_lower_bound, liveness_upper_bound,
            speechiness_lower_bound, speechiness_upper_bound,
            from_date, to_date
         )

        cursor.execute(query, params)

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

# TODO should probably use default values instead of required params
def _get_score_params(request):
        dance_lower_bound = request.args.get("dance_lower_bound")
        if dance_lower_bound is None:
            raise Exception("Please remember to add a lower bound on danceability")

        dance_upper_bound = request.args.get("dance_upper_bound")
        if dance_upper_bound is None:
            raise Exception("Please remember to add a upper bound on danceability")

        energy_lower_bound = request.args.get("energy_lower_bound")
        if energy_lower_bound is None:
            raise Exception("Please remember to add a lower bound on energy")

        energy_upper_bound = request.args.get("energy_upper_bound")
        if energy_upper_bound is None:
            raise Exception("Please remember to add a upper bound on energy")

        valence_lower_bound = request.args.get("valence_lower_bound")
        if valence_lower_bound is None:
            raise Exception("Please remember to add a lower bound on valence")

        valence_upper_bound = request.args.get("valence_upper_bound")
        if valence_upper_bound is None:
            raise Exception("Please remember to add a upper bound on valence")

        acousticness_lower_bound = request.args.get("acousticness_lower_bound")
        if acousticness_lower_bound is None:
            raise Exception("Please remember to add a lower bound on acousticness")

        acousticness_upper_bound = request.args.get("acousticness_upper_bound")
        if acousticness_upper_bound is None:
            raise Exception("Please remember to add a upper bound on acousticness")

        instrumentalness_lower_bound = request.args.get("instrumentalness_lower_bound")
        if instrumentalness_lower_bound is None:
            raise Exception("Please remember to add a lower bound on instrumentalness")

        instrumentalness_upper_bound = request.args.get("instrumentalness_upper_bound")
        if instrumentalness_upper_bound is None:
            raise Exception("Please remember to add a upper bound on instrumentalness")

        liveness_lower_bound = request.args.get("liveness_lower_bound")
        if liveness_lower_bound is None:
            raise Exception("Please remember to add a lower bound on liveness")

        liveness_upper_bound = request.args.get("liveness_upper_bound")
        if liveness_upper_bound is None:
            raise Exception("Please remember to add a upper bound on liveness")

        speechiness_lower_bound = request.args.get("speechiness_lower_bound")
        if speechiness_lower_bound is None:
            raise Exception("Please remember to add a lower bound on speechiness")

        speechiness_upper_bound = request.args.get("speechiness_upper_bound")
        if speechiness_upper_bound is None:
            raise Exception("Please remember to add a upper bound on speechiness")

        return dance_lower_bound, dance_upper_bound, energy_lower_bound, energy_upper_bound, valence_lower_bound, valence_upper_bound, acousticness_lower_bound, acousticness_upper_bound, instrumentalness_lower_bound, instrumentalness_upper_bound, liveness_lower_bound, liveness_upper_bound, speechiness_lower_bound, speechiness_upper_bound


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
                id, region, danceability, energy, valence, acousticness, instrumentalness, liveness, speechiness
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
                "energy": row[3],
                "valence": row[4],
                "acousticness": row[5],
                "instrumentalness": row[6],
                "liveness": row[7],
                "speechiness": row[8]
            }
            for row in result
        ]

        return jsonify(json_objects)
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

@app.route('/api/timeseries')
def timeseries():
    conn, cursor = connect_to_db()

    try:
        if cursor is None:
            raise Exception("No database connection")

        countries = request.args.get("countries")
        if countries is None:
            raise Exception("No countries specified")
        country_list = [country.strip() for country in countries.split(',')]
        print("country_list", country_list)

        attribute = request.args.get("attribute")
        if attribute is None:
            raise Exception("No attribute specified")
        print("attribute", attribute)

        query = f"""
            SELECT
                region, date, AVG({attribute})
            FROM spotify_chart
            WHERE 
                region IN ({', '.join(['%s' for _ in country_list])})
            GROUP BY region, date
        """

        cursor.execute(query, tuple(country_list))

        result = cursor.fetchall()

        print(result)

        json_objects = [
            {
                "region": row[0],
                "date": row[1].strftime('%Y-%m-%d'),
                "avg": row[2]
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
