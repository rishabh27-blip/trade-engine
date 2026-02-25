// ===== CONFIG =====
let capital = 100000;
let riskPercent = 0.02;

let trades = JSON.parse(localStorage.getItem("trades")) || [];

// ===== CORE ENGINE =====
function evaluateTrade() {
    let buy = +buyEl("buy");
    let sell = +buyEl("sell");
    let qty = +buyEl("qty");
    let transport = +buyEl("transport");
    let broker = +buyEl("broker");
    let days = +buyEl("days");
    let vol = +buyEl("vol");
    let rel = +buyEl("rel");

    if (!buy || !sell || !qty) return alert("Invalid inputs");

    let margin = sell - buy - transport - broker;
    let risk = vol * days;
    let rr = margin / risk;
    let expectedProfit = margin * qty;

    let positionSize = (capital * riskPercent) / (risk || 1);

    // ===== SCORE ENGINE (0–100)
    let score = 50;

    if (margin > 2) score += 15;
    else if (margin > 1) score += 5;
    else score -= 20;

    if (rr >= 2) score += 20;
    else if (rr >= 1.5) score += 10;
    else score -= 15;

    if (rel >= 4) score += 10;
    else if (rel < 3) score -= 10;

    if (days <= 2) score += 5;
    else score -= 5;

    if (risk > margin) score -= 20;

    score = Math.max(0, Math.min(100, score));

    // ===== DECISION
    let decision = "NO TRADE";
    if (score >= 70) decision = "TRADE";
    else if (score >= 55) decision = "SMALL TRADE";

    window.currentTrade = {
        margin, risk, rr, qty, expectedProfit, decision, score
    };

    // ===== OUTPUT
    document.getElementById("output").innerHTML = `
        <div class="${decision === "TRADE" ? "green" : decision === "SMALL TRADE" ? "yellow" : "red"}">
            <h3>${decision}</h3>
            <p>Score: ${score}/100</p>
            <p>Margin: ₹${margin.toFixed(2)}</p>
            <p>Risk: ₹${risk.toFixed(2)}</p>
            <p>RR: ${rr.toFixed(2)}</p>
            <p>Expected Profit: ₹${expectedProfit.toFixed(0)}</p>
            <p>Suggested Qty: ${positionSize.toFixed(0)}</p>
        </div>
    `;
}

// ===== SAVE TRADE
function saveTrade() {
    if (!window.currentTrade) return alert("Evaluate first");

    let pnl = +prompt("Enter P&L:");

    trades.push({ ...window.currentTrade, pnl });

    localStorage.setItem("trades", JSON.stringify(trades));

    updateStats();
    renderHistory();
}

// ===== PERFORMANCE ENGINE
function updateStats() {
    let total = trades.length;
    let wins = trades.filter(t => t.pnl > 0).length;
    let pnl = trades.reduce((s, t) => s + t.pnl, 0);

    let winRate = total ? (wins / total) * 100 : 0;

    let avgWin = trades.filter(t => t.pnl > 0)
        .reduce((s, t) => s + t.pnl, 0) / (wins || 1);

    let avgLoss = trades.filter(t => t.pnl <= 0)
        .reduce((s, t) => s + t.pnl, 0) / ((total - wins) || 1);

    let ev = (winRate/100 * avgWin) - ((1 - winRate/100) * Math.abs(avgLoss));

    document.getElementById("stats").innerHTML = `
        <div class="yellow">
            <h3>Performance</h3>
            <p>Trades: ${total}</p>
            <p>Win Rate: ${winRate.toFixed(1)}%</p>
            <p>Total P&L: ₹${pnl.toFixed(0)}</p>
            <p>EV: ₹${ev.toFixed(2)}</p>
        </div>
    `;
}

// ===== HISTORY
function renderHistory() {
    let html = "<h3>Recent Trades</h3>";

    trades.slice(-5).reverse().forEach(t => {
        html += `
            <div class="${t.pnl > 0 ? "green" : "red"}">
                <p>${t.decision}</p>
                <p>Score: ${t.score}</p>
                <p>P&L: ₹${t.pnl}</p>
            </div>
        `;
    });

    document.getElementById("history").innerHTML = html;
}

// ===== UTIL
function buyEl(id) {
    return document.getElementById(id).value;
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
