let lastTrade = null;

// ================= EVALUATE =================
function evaluateTrade() {
    let buy = parseFloat(document.getElementById("buy").value);
    let sell = parseFloat(document.getElementById("sell").value);
    let qty = parseFloat(document.getElementById("qty").value);
    let transport = parseFloat(document.getElementById("transport").value);
    let broker = parseFloat(document.getElementById("broker").value);
    let days = parseFloat(document.getElementById("days").value);
    let vol = parseFloat(document.getElementById("vol").value);
    let rel = parseFloat(document.getElementById("rel").value);

    if ([buy, sell, qty, transport, broker, days, vol, rel].some(isNaN)) {
        showToast("❌ Please fill all fields correctly", "error");
        return;
    }

    if (rel < 1 || rel > 5) {
        showToast("❌ Reliability must be between 1-5", "error");
        return;
    }

    let margin = sell - buy - transport - broker;
    let risk = vol * days;
    let totalProfit = margin * qty;
    let rr = risk > 0 ? margin / risk : Infinity;

    let score = 0;
    let reasons = [];
    let flags = [];

    // Margin evaluation
    if (margin > 2) {
        score += 30;
        reasons.push("Excellent margin");
    } else if (margin > 1) {
        score += 20;
        reasons.push("Good margin");
    } else if (margin > 0) {
        score += 10;
        flags.push("⚠️ Low margin");
    } else {
        flags.push("❌ Negative margin");
    }

    // Risk evaluation
    if (risk < 0.5 * margin) {
        score += 30;
        reasons.push("Very low risk");
    } else if (risk < margin) {
        score += 20;
        reasons.push("Acceptable risk");
    } else {
        score += 5;
        flags.push("⚠️ High risk vs margin");
    }

    // Holding period
    if (days <= 2) {
        score += 20;
        reasons.push("Quick turnaround");
    } else if (days <= 5) {
        score += 15;
    } else {
        score += 10;
        flags.push("⚠️ Long holding period");
    }

    // Reliability
    score += rel * 4;
    if (rel >= 4) {
        reasons.push("Reliable counterparty");
    } else if (rel <= 2) {
        flags.push("⚠️ Low counterparty reliability");
    }

    let decision = "NO TRADE";
    let decisionClass = "red";

    if (margin <= 0) {
        decision = "NO TRADE";
        reasons = ["Negative margin - certain loss"];
    } else if (risk > margin) {
        decision = "NO TRADE";
        reasons = ["Risk exceeds margin"];
    } else if (score >= 70) {
        decision = "✅ TRADE";
        decisionClass = "green";
    } else if (score >= 55) {
        decision = "⚠️ CONSIDER (50% SIZE)";
        decisionClass = "yellow";
        reasons.push("Moderate opportunity - reduce position size");
    } else {
        reasons = ["Score too low for trade"];
    }

    lastTrade = {
        buy,
        sell,
        qty,
        transport,
        broker,
        days,
        vol,
        rel,
        margin,
        risk,
        totalProfit,
        rr,
        decision,
        score,
        timestamp: new Date().toLocaleString(),
        actualProfit: null
    };

    displayResult(lastTrade, decisionClass, reasons, flags);
    
    // Vibrate on mobile
    if (navigator.vibrate) {
        navigator.vibrate(decision.includes("TRADE") ? [50, 30, 50] : [100]);
    }
}

function displayResult(trade, decisionClass, reasons, flags) {
    let warningsHtml = flags.length > 0 ? `
        <div class="warnings">
            <strong>⚠️ Warnings:</strong><br>
            ${flags.join("<br>")}
        </div>
    ` : '';

    document.getElementById("output").innerHTML = `
        <div class="result ${decisionClass}">
            <h3>${trade.decision}</h3>
            
            <div class="result-item">
                <span class="result-label">Margin/kg:</span>
                <span class="result-value">₹${trade.margin.toFixed(2)}</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Risk/kg:</span>
                <span class="result-value">₹${trade.risk.toFixed(2)}</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Risk/Reward:</span>
                <span class="result-value">${trade.rr === Infinity ? '∞' : trade.rr.toFixed(2)}</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Total Profit:</span>
                <span class="result-value">₹${trade.totalProfit.toFixed(2)}</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Score:</span>
                <span class="result-value">${trade.score}/100</span>
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                <strong>Reasons:</strong><br>
                ${reasons.join(" • ")}
            </div>
            
            ${warningsHtml}
        </div>
    `;
}

// ================= SAVE =================
function saveTrade() {
    if (!lastTrade) {
        showToast("❌ Evaluate trade first", "error");
        return;
    }

    let actual = prompt("Enter ACTUAL profit/loss (₹):");

    if (actual === null || actual === "") {
        return;
    }

    actual = parseFloat(actual);

    if (isNaN(actual)) {
        showToast("❌ Invalid input", "error");
        return;
    }

    lastTrade.actualProfit = actual;

    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    trades.push(lastTrade);

    localStorage.setItem("trades", JSON.stringify(trades));

    showToast("✅ Trade saved successfully", "success");
    
    // Clear form after saving
    clearForm();
}

// ================= HISTORY =================
function showTrades() {
    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    if (trades.length === 0) {
        document.getElementById("output").innerHTML = `
            <div class="result yellow">
                <h3>No Trades</h3>
                <p style="text-align: center; margin-top: 10px;">
                    Save your evaluated trades to build history
                </p>
            </div>
        `;
        return;
    }

    let totalProfit = 0;
    let wins = 0;
    let totalTrades = trades.length;

    let tradesHtml = trades.slice().reverse().map((t, i) => {
        totalProfit += t.actualProfit || 0;
        if (t.actualProfit > 0) wins++;

        let profitClass = t.actualProfit > 0 ? "profit" : "loss";
        let profitIcon = t.actualProfit > 0 ? "📈" : "📉";

        return `
            <div class="trade-item ${profitClass}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong>#${totalTrades - i}</strong>
                    <span style="font-size: 0.85em; color: #94a3b8;">${t.timestamp}</span>
                </div>
                <div style="font-size: 0.9em; color: #cbd5e1;">
                    Decision: <strong>${t.decision}</strong><br>
                    Score: <strong>${t.score}</strong> | 
                    Actual P/L: ${profitIcon} <strong>₹${t.actualProfit.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }).join('');

    let winRate = (wins / totalTrades) * 100;
    let avgProfit = totalProfit / totalTrades;

    document.getElementById("output").innerHTML = `
        <div class="box">
            <h2>📜 Trade History</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${totalTrades}</div>
                    <div class="label">Total Trades</div>
                </div>
                <div class="stat-card">
                    <div class="value">${winRate.toFixed(1)}%</div>
                    <div class="label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="value">₹${totalProfit.toFixed(2)}</div>
                    <div class="label">Total Profit</div>
                </div>
                <div class="stat-card">
                    <div class="value">₹${avgProfit.toFixed(2)}</div>
                    <div class="label">Avg Profit</div>
                </div>
            </div>
            
            <div class="trade-history" style="margin-top: 20px;">
                ${tradesHtml}
            </div>
        </div>
    `;
}

// ================= LEARNING =================
function analyzePerformance() {
    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    if (trades.length < 5) {
        document.getElementById("output").innerHTML = `
            <div class="result yellow">
                <h3>Insufficient Data</h3>
                <p style="text-align: center; margin-top: 10px;">
                    Need at least 5 saved trades for analytics<br>
                    Current: ${trades.length} trades
                </p>
            </div>
        `;
        return;
    }

    let buckets = {
        high: [],
        mid: [],
        low: []
    };

    trades.forEach(t => {
        if (t.score >= 70) buckets.high.push(t);
        else if (t.score >= 50) buckets.mid.push(t);
        else buckets.low.push(t);
    });

    function stats(arr) {
        if (arr.length === 0) return { avg: 0, win: 0, count: 0 };

        let total = 0,
            wins = 0;

        arr.forEach(t => {
            total += t.actualProfit;
            if (t.actualProfit > 0) wins++;
        });

        return {
            avg: total / arr.length,
            win: (wins / arr.length) * 100,
            count: arr.length
        };
    }

    let h = stats(buckets.high);
    let m = stats(buckets.mid);
    let l = stats(buckets.low);

    document.getElementById("output").innerHTML = `
        <div class="box">
            <h2>📈 Performance Analytics</h2>
            
            <div class="result green" style="margin-bottom: 15px;">
                <h3 style="font-size: 1.2em;">HIGH Score (70+)</h3>
                <div class="result-item">
                    <span class="result-label">Trades:</span>
                    <span class="result-value">${h.count}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Avg Profit:</span>
                    <span class="result-value">₹${h.avg.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Win Rate:</span>
                    <span class="result-value">${h.win.toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="result yellow" style="margin-bottom: 15px;">
                <h3 style="font-size: 1.2em;">MID Score (50-70)</h3>
                <div class="result-item">
                    <span class="result-label">Trades:</span>
                    <span class="result-value">${m.count}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Avg Profit:</span>
                    <span class="result-value">₹${m.avg.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Win Rate:</span>
                    <span class="result-value">${m.win.toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="result red">
                <h3 style="font-size: 1.2em;">LOW Score (<50)</h3>
                <div class="result-item">
                    <span class="result-label">Trades:</span>
                    <span class="result-value">${l.count}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Avg Profit:</span>
                    <span class="result-value">₹${l.avg.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Win Rate:</span>
                    <span class="result-value">${l.win.toFixed(1)}%</span>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #0f172a; border-radius: 8px;">
                <strong>💡 Insight:</strong><br>
                ${generateInsight(h, m, l)}
            </div>
        </div>
    `;
}

function generateInsight(high, mid, low) {
    if (high.count === 0) {
        return "Focus on high-score opportunities (70+) for better results.";
    }
    
    if (high.win > 70) {
        return "Excellent! High-score trades are performing well. Stick to your criteria.";
    } else if (high.win > 50) {
        return "High-score trades show moderate success. Review loss patterns.";
    } else if (mid.win > high.win && mid.count > 3) {
        return "Mid-score trades outperforming high-score. Consider recalibrating scoring.";
    } else {
        return "More data needed for reliable pattern analysis.";
    }
}

// ================= EXPORT =================
function exportData() {
    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    if (trades.length === 0) {
        showToast("❌ No trades to export", "error");
        return;
    }

    let csv = "Timestamp,Decision,Score,Buy,Sell,Qty,Margin,Risk,RR,Predicted Profit,Actual Profit\n";

    trades.forEach(t => {
        csv += `"${t.timestamp}","${t.decision}",${t.score},${t.buy},${t.sell},${t.qty},${t.margin.toFixed(2)},${t.risk.toFixed(2)},${t.rr.toFixed(2)},${t.totalProfit.toFixed(2)},${t.actualProfit}\n`;
    });

    let blob = new Blob([csv], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `trade-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    showToast("✅ Data exported successfully", "success");
}

// ================= UTILITIES =================
function clearForm() {
    ['buy', 'sell', 'qty', 'transport', 'broker', 'days', 'vol', 'rel'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    document.getElementById('output').innerHTML = '';
    lastTrade = null;
    
    showToast("🔄 Form cleared", "info");
}

function showToast(message, type) {
    let bgColor;
    switch(type) {
        case 'success': bgColor = '#22c55e'; break;
        case 'error': bgColor = '#ef4444'; break;
        default: bgColor = '#3b82f6';
    }
    
    let toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);
