CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    stock_ticker VARCHAR(10),
    entry_price FLOAT,
    position VARCHAR(10),
    risk_amount FLOAT,
    stop_loss FLOAT,
    take_profit FLOAT
);
