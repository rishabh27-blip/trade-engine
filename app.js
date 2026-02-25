// ===== CONFIG =====
let capital = 100000;
let riskPercent = 0.02; // 2% max risk per trade

let trades = JSON.parse(localStorage.getItem("trades")) || [];

// ===== CORE ENGINE =====
function evaluateTrade() {
    let buy = +getVal("buy");
    let sell = +getVal("sell");
    let qty = +getVal("qty");
    let transport = +getVal("transport");
    let broker = +getVal("broker");
    let days = +getVal("days");
    let vol = +getVal("vol");
    let rel = +getVal("rel");

    if (!buy || !sell || !qty) return alert("Invalid inputs");

    // ===== UNIT ECONOMICS (₹/kg)
    let grossSpread = sell - buy;
    let totalCost = transport + broker;
    let netEdge = grossSpread - totalCost;

    // ===== RISK MODEL (₹/kg)
    let volatilityRisk = vol * days;

    // ===== HARD FILTERS (INSTITUTIONAL RULES)
    if (netEdge <= 0) return output("NO TRADE", "Negative edge");
    if (volatilityRisk <= 0) return output("NO TRADE", "Invalid volatility");

    let rr = netEdge / volatilityRisk;

    if (rr < 2) return output("NO TRADE", "RR < 2 (no edge)");

    // ===== POSITION SIZING (CAPITAL PROTECTION)
    let maxLossPerKg = volatilityRisk;
    let allowedLoss = capital * riskPercent;

    let positionSize = Math.floor(allowedLoss / maxLossPerKg);

    if (positionSize <= 0) return output("NO TRADE", "Position too risky");

    // ===== EXPECTANCY MODEL
    let winProb = estimateWinProbability(rel, rr);
    let expectedValue = (winProb * netEdge) - ((1 - winProb) * volatilityRisk);

    if (expectedValue <= 0) {
        return output("NO TRADE", "Negative expectancy");
    }

    // ===== FINAL TRADE METRICS
    let tradeQty = Math.min(qty, positionSize);
    let expectedProfit = netEdge * tradeQty;
    let maxLoss = volatilityRisk * tradeQty;

    let decision = "TRADE";

    // ===== SAVE CURRENT TRADE
    window.currentTrade = {
        netEdge,
        volatilityRisk,
        rr,
        qty: tradeQty,
        expectedProfit,
        maxLoss,
        winProb,
        decision
    };

    // ===== OUTPUT
    document.getElementById("output").innerHTML = `
        <div class="green">
            <h3>TRADE</h3>

            <p><b>Edge:</b> ₹${netEdge.toFixed(2)} / kg</p>
            <p><b>Risk:</b> ₹${volatilityRisk.toFixed(2)} / kg</p>
            <p><b>RR:</b> ${rr.toFixed(2)}</p>

            <hr>

            <p><b>Position Size:</b> ${tradeQty} kg</p>
            <p><b>Expected Profit:</b> ₹${expectedProfit.toFixed(0)}</p>
            <p><b>Max Loss:</b> ₹${maxLoss.toFixed(0)}</p>

            <hr>

            <p><b>Win Probability:</b> ${(winProb * 100).toFixed(1)}%</p>
            <p><b>Expectancy:</b> ₹${expectedValue.toFixed(2)} / kg</p>

            <hr>

            <p><b>Execution:</b> Strict SL at ₹${(buy - volatilityRisk).toFixed(2)}</p>
        </div>
    `;
}

// ===== WIN PROBABILITY MODEL (DATA + BEHAVIOR)
function estimateWinProbability(rel, rr) {
    let base = 0.5;

    // reliability proxy (supplier trust / execution risk)
    base += (rel - 3) * 0.05;

    // RR adjustment
    if (rr > 3) base += 0.1;
    else if (rr < 2) base -= 0.1;

    return Math.max(0.3, Math.min(0.75, base));
}

// ===== OUTPUT HELPER
function output(type, reason) {
    document.getElementById("output").innerHTML = `
        <div class="red">
            <h3>${type}</h3>
            <p>${reason}</p>
        </div>
    `;
}

// ===== SAVE TRADE
function saveTrade() {
    if (!window.currentTrade) return alert("Evaluate first");

    let pnl = +prompt("Enter final P&L (₹):");

    trades.push({
        ...window.currentTrade,
        pnl,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem("trades", JSON.stringify(trades));

    updateStats();
    renderHistory();
}

// ===== PERFORMANCE ENGINE (PROP LEVEL)
function updateStats() {
    let total = trades.length;
    let wins = trades.filter(t => t.pnl > 0).length;
    let pnl = trades.reduce((s, t) => s + t.pnl, 0);

    let winRate = total ? (wins / total) : 0;

    let avgWin = avg(trades.filter(t => t.pnl > 0).map(t => t.pnl));
    let avgLoss = avg(trades.filter(t => t.pnl <= 0).map(t => t.pnl));

    let expectancy = (winRate * avgWin) - ((1 - winRate) * Math.abs(avgLoss));

    document.getElementById("stats").innerHTML = `
        <div class="yellow">
            <h3>Performance Analytics</h3>

            <p>Total Trades: ${total}</p>
            <p>Win Rate: ${(winRate * 100).toFixed(1)}%</p>

            <hr>

            <p>Total P&L: ₹${pnl.toFixed(0)}</p>
            <p>Avg Win: ₹${avgWin.toFixed(0)}</p>
            <p>Avg Loss: ₹${avgLoss.toFixed(0)}</p>

            <hr>

            <p><b>Expectancy:</b> ₹${expectancy.toFixed(2)}</p>
        </div>
    `;
}

// ===== HISTORY
function renderHistory() {
    let html = "<h3>Trade History</h3>";

    trades.slice(-10).reverse().forEach(t => {
        html += `
            <div class="${t.pnl > 0 ? "green" : "red"}">
                <p>${t.date}</p>
                <p>RR: ${t.rr.toFixed(2)}</p>
                <p>P&L: ₹${t.pnl}</p>
            </div>
        `;
    });

    document.getElementById("history").innerHTML = html;
}

// ===== UTIL
function getVal(id) {
    return document.getElementById(id).value;
}

function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clearForm() {
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// ===== EXPORT
function exportData() {
    let data = JSON.stringify(trades);
    let blob = new Blob([data], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "trades.json";
    a.click();
}

// INIT
updateStats();
renderHistory();
