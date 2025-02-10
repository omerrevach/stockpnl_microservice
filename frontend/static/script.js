document.addEventListener("DOMContentLoaded", function () {
    const tradeForm = document.getElementById("tradeForm");
    const tradesTableBody = document.querySelector("#tradesTable tbody");
    const tradeChartCtx = document.getElementById("tradeChart").getContext("2d");
    let tradeChart = null;

    const TRADE_SERVICE_BASE_URL = "/proxy";

    tradeForm.onsubmit = async function (event) {
        event.preventDefault();

        const formData = {
            stock_ticker: document.getElementById("stock_ticker").value,
            entry_price: parseFloat(document.getElementById("entry_price").value),
            position: document.getElementById("position").value,
            risk_amount: parseFloat(document.getElementById("risk_amount").value),
            stop_loss: document.getElementById("stop_loss").value
                ? parseFloat(document.getElementById("stop_loss").value)
                : null,
            take_profit: document.getElementById("take_profit").value
                ? parseFloat(document.getElementById("take_profit").value)
                : null
        };

        try {
            const response = await fetch(`${TRADE_SERVICE_BASE_URL}/trade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Failed to place trade");
            }

            const result = await response.json();
            alert(`Trade placed successfully!\nShares to Buy: ${result.shares_to_buy}\nProfit/Loss Estimate: ${result.profit_loss.toFixed(2)}`);
            
            fetchTrades();
        } catch (error) {
            console.error("Error placing trade:", error);
            alert("Failed to place trade. Check console for details.");
        }
    };

    async function fetchTrades() {
        try {
            const response = await fetch(`${TRADE_SERVICE_BASE_URL}/get_trades`);
            if (!response.ok) {
                throw new Error("Failed to fetch trades");
            }

            const trades = await response.json();
            if (trades.length === 0) {
                alert("No trades found yet!");
                return;
            }

            tradesTableBody.innerHTML = "";
            const labels = [];
            const profitLoss = [];

            trades.forEach(trade => {
                const shares_to_buy = trade.risk_amount / (trade.entry_price - (trade.stop_loss || trade.entry_price * 0.95));
                const total_cost = shares_to_buy * trade.entry_price;
                const risk_dollar = shares_to_buy * (trade.entry_price - (trade.stop_loss || trade.entry_price * 0.95));
                const profit_loss = shares_to_buy * ((trade.take_profit || trade.entry_price * 1.1) - trade.entry_price);

                labels.push(trade.stock_ticker);
                profitLoss.push(profit_loss);

                const row = `
                    <tr>
                        <td>${trade.stock_ticker}</td>
                        <td>${trade.entry_price.toFixed(2)}</td>
                        <td>${shares_to_buy.toFixed(2)}</td>
                        <td>${trade.stop_loss ? trade.stop_loss.toFixed(2) : "N/A"}</td>
                        <td>${trade.take_profit ? trade.take_profit.toFixed(2) : "N/A"}</td>
                        <td>${trade.risk_amount.toFixed(2)}</td>
                        <td>${profit_loss.toFixed(2)}</td>
                        <td>${total_cost.toFixed(2)}</td>
                        <td>${risk_dollar.toFixed(2)}</td>
                    </tr>
                `;
                tradesTableBody.innerHTML += row;
            });

            if (tradeChart) {
                tradeChart.destroy();
            }

            tradeChart = new Chart(tradeChartCtx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Profit/Loss ($)",
                        data: profitLoss,
                        backgroundColor: profitLoss.map(p => (p > 0 ? "green" : "red")),
                        borderColor: "black",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...profitLoss) + 20,
                            suggestedMin: Math.min(...profitLoss) - 20
                        }
                    }
                }
            });

        } catch (error) {
            console.error("Error fetching trades:", error);
        }
    }

    fetchTrades();
});

