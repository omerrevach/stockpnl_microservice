from flask import Flask, render_template, request, redirect, jsonify
import requests

app = Flask(__name__)

# Home Page
@app.route("/")
def index():
    return render_template("index.html")

# Registration Page
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        response = requests.post("http://auth_service:5001/register", json={"username": username, "password": password})
        if response.status_code == 200:
            return redirect("/login")
        return "Registration failed", 400
    return render_template("register.html")

# Login Page
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        response = requests.post("http://auth_service:5001/login", json={"username": username, "password": password})
        if response.status_code == 200:
            return redirect("/trade")
        return "Login failed", 401
    return render_template("login.html")

# Trade Page
@app.route("/trade", methods=["GET", "POST"])
def trade():
    if request.method == "POST":
        trade_data = {
            "stock_ticker": request.form["stock_ticker"],
            "entry_price": float(request.form["entry_price"]),
            "position": request.form["position"],
            "risk_amount": float(request.form["risk_amount"]),
            "stop_loss": float(request.form["stop_loss"]) if request.form["stop_loss"] else None,
            "take_profit": float(request.form["take_profit"]) if request.form["take_profit"] else None
        }
        response = requests.post("http://trade_service:5002/trade", json=trade_data)
        return response.json()
    return render_template("trade.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
