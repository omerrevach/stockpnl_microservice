document.addEventListener("DOMContentLoaded", function () {
    const tradeForm = document.getElementById("tradeForm");
    const tradesTableBody = document.querySelector("#tradesTable tbody");
    const tradeChartCtx = document.getElementById("tradeChart").getContext("2d");
    let tradeChart = null;

    const TRADE_SERVICE_BASE_URL = "http://trade-service.default.svc.cluster.local";

    tradeForm.onsubmit = async function (event) {
        event.preventDefault();

        const formData = {
            stock_ticker: document.getElementById("stock_ticker").value,
            entry_price: parseFloat(document.getElementById("entry_price").value),
            position: document.getElementById("position").value,
            risk_amount: parseFloat(document.getElementById("risk_amount").value),
            stop_loss: document.getElementById("stop_loss").value ? parseFloat(document.getElementById("stop_loss").value) : null,
            take_profit: document.getElementById("take_profit").value ? parseFloat(document.getElementById("take_profit").value) : null
        };

        try {
            const response = await fetch(`${TRADE_SERVICE_BASE_URL}/trade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Trade placed successfully! Shares to Buy: ${result.shares_to_buy}`);
                fetchTrades();
            } else {
                throw new Error(result.message || "Failed to place trade");
            }
        } catch (error) {
            console.error("Error placing trade:", error);
            alert("Failed to place trade. Check console for details.");
        }
    };

    async function fetchTrades() {
        try {
            const response = await fetch(`${TRADE_SERVICE_BASE_URL}/get_trades`);
            const trades = await response.json();

            if (!response.ok) {
                throw new Error("Failed to fetch trades");
            }

            if (trades.length === 0) {
                alert("No trades found yet!");
                return;
            }

            tradesTableBody.innerHTML = "";
            const labels = [];
            const profitLoss = [];

            trades.forEach((trade) => {
                labels.push(trade.stock_ticker);
                profitLoss.push(trade.profit_loss);

                const row = `
                    <tr>
                        <td>${trade.stock_ticker}</td>
                        <td>${trade.entry_price}</td>
                        <td>${trade.shares_to_buy.toFixed(2)}</td>
                        <td>${trade.stop_loss || "N/A"}</td>
                        <td>${trade.take_profit || "N/A"}</td>
                        <td>${trade.risk_amount}</td>
                        <td>${trade.profit_loss.toFixed(2)}</td>
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
                    datasets: [
                        {
                            label: "Profit/Loss ($)",
                            data: profitLoss,
                            backgroundColor: profitLoss.map((p) => (p > 0 ? "green" : "red")),
                            borderColor: "black",
                            borderWidth: 1
                        }
                    ]
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