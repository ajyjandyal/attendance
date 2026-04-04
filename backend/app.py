from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# DB INIT
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS attendance(
        id INTEGER PRIMARY KEY,
        name TEXT,
        time TEXT
    )''')

    conn.commit()
    conn.close()

init_db()

# LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = c.fetchone()

    conn.close()

    if user:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "fail"})

# SAVE ATTENDANCE
@app.route("/attendance", methods=["POST"])
def attendance():
    data = request.json
    name = data["name"]
    time = data["time"]

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("INSERT INTO attendance(name,time) VALUES (?,?)", (name, time))
    conn.commit()
    conn.close()

    return jsonify({"status": "saved"})

# GET ATTENDANCE
@app.route("/logs")
def logs():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("SELECT * FROM attendance")
    rows = c.fetchall()

    conn.close()
    return jsonify(rows)

app.run(debug=True)
