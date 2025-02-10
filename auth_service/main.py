from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from pydantic import BaseModel
import os

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    username: str
    password: str

db_config = {
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'host': 'mysql',
    'database': os.getenv('MYSQL_DATABASE')
}

@app.post("/register")
def register(user: User):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (user.username, user.password))
    conn.commit()
    conn.close()
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: User):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (user.username, user.password))
    if cursor.fetchone():
        return {"message": "Login successful"}
    conn.close()
    raise HTTPException(status_code=401, detail="Invalid credentials")
