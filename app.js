// ===== CONFIG =====
let capital = 100000;
let riskPercent = 0.02;

// ===== LOAD DATA =====
let trades = JSON.parse(localStorage.getItem("trades")) || [];

// ===== CORE ENGINE =====
function evaluateTrade() {
    let buy = parseFloat(document.getElementById("buy").value);
    let sell = parseFloat(document.getElementById("sell").value);
    let qty = parseFloat(document.getElementById("qty").value);
    let transport = parseFloat(document.getElementById("transport").value);
    let broker = parseFloat(document.getElementById("broker").value);
    let days = parseFloat(document.getElementById("days").value);
    let vol = parseFloat(document.getElementById("vol").value);
    let rel = parseFloat(document.getElementById("rel").value);

    let margin = sell - buy - transport - broker;
    let risk = vol * days;
    let rr = margin / risk;
    let expectedProfit = margin * qty;

    let positionSize = (capital * riskPercent) / risk;

    let score = 0;
    let decision = "NO TRADE";
    let reason = [];

    // ===== DECISION LOGIC =====
    if (margin > 2) score += 2;
    else if (margin > 1) score += 1;
    else {
        score -= 2;
        reason.push("Low margin");
    }

    if (risk < margin) score += 2;
    else {
        score -= 3;
        reason.push("Risk > Margin");
    }

    if (rr >= 1.5) score += 2;
    else {
        score -= 1;
        reason.push("Low RR");
    }

    if (rel >= 3) score += 1;
    else {
        score -= 2;
        reason.push("Low reliability");
    }

    if (days <= 2) score += 1;
    else {
        score -= 1;
        reason.push("Long holding");
    }

    // ===== FINAL DECISION =====
    if (score >= 4) decision = "TRADE";
    else if (score >= 2) decision = "SMALL TRADE";

    // ===== STORE CURRENT TRADE =====
    window.currentTrade = {
        margin,
        risk,
        rr,
        qty,
        expectedProfit,
        decision,
        score
    };

    // ===== OUTPUT =====
    document.getElementById("output").innerHTML = `
        <div class="result ${decision === "TRADE" ? "green" : decision === "SMALL TRADE" ? "yellow" : "red"}">
            <h3>${decision}</h3>
            <p>Score: ${score}</p>
            <p>Margin: ₹${margin.toFixed(2)}</p>
            <p>Risk: ₹${risk.toFixed(2)}</p>
            <p>RR: ${rr.toFixed(2)}</p>
            <p>Expected Profit: ₹${expectedProfit.toFixed(2)}</p>
            <p>Suggested Qty: ${positionSize.toFixed(0)}</p>
            <p>Reason: ${reason.join(", ") || "Strong setup"}</p>
        </div>
    `;
}

// ===== SAVE TRADE =====
function saveTrade() {
    if (!window.currentTrade) {
        alert("Evaluate a trade first");
        return;
    }

    let pnl = parseFloat(prompt("Enter Actual Profit/Loss:"));

    let trade = {
        ...window.currentTrade,
        pnl
    };

    trades.push(trade);
    localStorage.setItem("trades", JSON.stringify(trades));

    updateStats();
    renderHistory();

    alert("Trade Saved");
}

// ===== PERFORMANCE =====
function updateStats() {
    let total = trades.length;
    let wins = trades.filter(t => t.pnl > 0).length;
    let pnl = trades.reduce((sum, t) => sum + t.pnl, 0);

    let avgWin = trades.filter(t => t.pnl > 0)
        .reduce((s, t) => s + t.pnl, 0) / (wins || 1);

    let avgLoss = trades.filter(t => t.pnl <= 0)
        .reduce((s, t) => s + t.pnl, 0) / ((total - wins) || 1);

    let winRate = total ? (wins / total) * 100 : 0;

    let ev = (winRate/100 * avgWin) - ((1 - winRate/100) * Math.abs(avgLoss));

    document.getElementById("stats").innerHTML = `
        <div class="result yellow">
            <h3>Performance</h3>
            <p>Total Trades: ${total}</p>
            <p>Win Rate: ${winRate.toFixed(2)}%</p>
            <p>Total P&L: ₹${pnl.toFixed(2)}</p>
            <p>Expected Value: ₹${ev.toFixed(2)}</p>
        </div>
    `;
}

// ===== HISTORY =====
function renderHistory() {
    let html = "<h3>Trade History</h3>";

    trades.slice(-5).reverse().forEach(t => {
        html += `
            <div class="result ${t.pnl > 0 ? "green" : "red"}">
                <p>Decision: ${t.decision}</p>
                <p>RR: ${t.rr.toFixed(2)}</p>
                <p>P&L: ₹${t.pnl}</p>
            </div>
        `;
    });

    document.getElementById("history").innerHTML = html;
}

// ===== INIT =====
updateStats();
renderHistory();
