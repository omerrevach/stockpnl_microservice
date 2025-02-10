from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from pydantic import BaseModel
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Trade(BaseModel):
    stock_ticker: str
    entry_price: float
    position: str
    risk_amount: float
    stop_loss: float = None
    take_profit: float = None

db_config = {
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'host': 'mysql',
    'database': os.getenv('MYSQL_DATABASE')
}

@app.post("/trade")
def place_trade(trade: Trade):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        shares_to_buy = trade.risk_amount / (trade.entry_price - (trade.stop_loss or trade.entry_price * 0.95))
        potential_loss = shares_to_buy * (trade.entry_price - (trade.stop_loss or trade.entry_price * 0.95))
        potential_profit = shares_to_buy * ((trade.take_profit or trade.entry_price * 1.1) - trade.entry_price)

        cursor.execute(
            """
            INSERT INTO trades (stock_ticker, entry_price, position, risk_amount, stop_loss, take_profit, shares_to_buy, profit_loss) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (trade.stock_ticker, trade.entry_price, trade.position, trade.risk_amount, trade.stop_loss, trade.take_profit, shares_to_buy, potential_profit - potential_loss)
        )
        conn.commit()
        conn.close()

        return {
            "message": "Trade placed successfully",
            "shares_to_buy": shares_to_buy,
            "profit_loss": potential_profit - potential_loss
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/get_trades")
def get_trades():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM trades")
        trades = cursor.fetchall()
        conn.close()

        return trades
    except Exception as e:
        return {"error": str(e)}
