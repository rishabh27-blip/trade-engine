function evaluateTrade() {
    const buy = +document.getElementById('buy').value;
    const sell = +document.getElementById('sell').value;
    const qty = +document.getElementById('qty').value;
    const transport = +document.getElementById('transport').value;
    const broker = +document.getElementById('broker').value;
    const days = +document.getElementById('days').value;
    const vol = +document.getElementById('vol').value;
    const rel = +document.getElementById('rel').value;

    if (!buy || !sell || !qty) {
        return document.getElementById('output').innerHTML = "Enter valid data";
    }

    const cost = buy + transport + broker;
    const profitPerKg = sell - cost;
    const totalProfit = profitPerKg * qty;

    const risk = vol * days;
    const rr = profitPerKg / risk;

    let decision = "NO TRADE";

    if (profitPerKg > 1 && rr >= 2 && rel >= 3) {
        decision = "TRADE ✅";
    }

    document.getElementById('output').innerHTML = `
        Profit/kg: ₹${profitPerKg.toFixed(2)} <br>
        Total Profit: ₹${totalProfit.toFixed(0)} <br>
        Risk: ₹${risk.toFixed(2)} <br>
        R:R: ${rr.toFixed(2)} <br>
        Decision: <b>${decision}</b>
    `;
}
