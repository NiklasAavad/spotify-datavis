from flask import Flask, jsonify

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run()
