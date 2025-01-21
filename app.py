from flask import Flask, render_template, request, redirect, jsonify
import requests

app = Flask(__name__)

TRADE_SERVICE_BASE_URL = "http://trade-service.default.svc.cluster.local"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        response = requests.post(
            "http://auth-service.default.svc.cluster.local/register",
            json={"username": username, "password": password},
        )
        if response.status_code == 200:
            return redirect("/login")
        return "Registration failed", response.status_code
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        response = requests.post(
            "http://auth-service.default.svc.cluster.local/login",
            json={"username": username, "password": password},
        )
        if response.status_code == 200:
            return redirect("/trade")
        return "Login failed", response.status_code
    return render_template("login.html")

@app.route("/trade")
def trade_page():
    return render_template("trade.html")

@app.route("/proxy/trade", methods=["POST"])
def proxy_trade():
    trade_data = request.get_json()
    response = requests.post(f"{TRADE_SERVICE_BASE_URL}/trade", json=trade_data)
    return jsonify(response.json()), response.status_code

@app.route("/proxy/get_trades", methods=["GET"])
def proxy_get_trades():
    response = requests.get(f"{TRADE_SERVICE_BASE_URL}/get_trades")
    return jsonify(response.json()), response.status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)