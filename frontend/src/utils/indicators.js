/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(bars, period) {
    const result = [];
    if (bars.length < period)
        return result;
    for (let i = period - 1; i < bars.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += bars[i - j].close;
        }
        result.push({
            time: bars[i].time,
            value: Number((sum / period).toFixed(4)),
        });
    }
    return result;
}
/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(bars, period) {
    const result = [];
    if (bars.length < period)
        return result;
    const k = 2 / (period + 1);
    // Initial SMA as starting point
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += bars[i].close;
    }
    let prevEma = sum / period;
    result.push({
        time: bars[period - 1].time,
        value: Number(prevEma.toFixed(4)),
    });
    for (let i = period; i < bars.length; i++) {
        const currentPrice = bars[i].close;
        const ema = currentPrice * k + prevEma * (1 - k);
        result.push({
            time: bars[i].time,
            value: Number(ema.toFixed(4)),
        });
        prevEma = ema;
    }
    return result;
}
/**
 * Calculate Relative Strength Index (RSI - 14)
 */
export function calculateRSI(bars, period = 14) {
    const result = [];
    if (bars.length <= period)
        return result;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const change = bars[i].close - bars[i - 1].close;
        if (change > 0)
            gains += change;
        else
            losses -= change;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);
    result.push({
        time: bars[period].time,
        value: Number(rsi.toFixed(2)),
    });
    for (let i = period + 1; i < bars.length; i++) {
        const change = bars[i].close - bars[i - 1].close;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);
        result.push({
            time: bars[i].time,
            value: Number(rsi.toFixed(2)),
        });
    }
    return result;
}
/**
 * Calculate Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(bars, period = 20, stdDevMultiplier = 2) {
    const result = [];
    if (bars.length < period)
        return result;
    for (let i = period - 1; i < bars.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += bars[i - j].close;
        }
        const middle = sum / period;
        let varianceSum = 0;
        for (let j = 0; j < period; j++) {
            varianceSum += Math.pow(bars[i - j].close - middle, 2);
        }
        const stdDev = Math.sqrt(varianceSum / period);
        result.push({
            time: bars[i].time,
            upper: Number((middle + stdDev * stdDevMultiplier).toFixed(4)),
            middle: Number(middle.toFixed(4)),
            lower: Number((middle - stdDev * stdDevMultiplier).toFixed(4)),
        });
    }
    return result;
}
/**
 * Detects Known Trading Operations (Golden Cross, Death Cross, RSI Extremes, Bollinger Rebounds)
 * and produces visual chart markers and signals list.
 */
export function detectKnownOperations(bars) {
    const signals = [];
    const markers = [];
    if (bars.length < 30)
        return { signals, markers };
    const ema9 = calculateEMA(bars, 9);
    const ema21 = calculateEMA(bars, 21);
    const rsi14 = calculateRSI(bars, 14);
    const ema9Map = new Map(ema9.map((p) => [p.time, p.value]));
    const ema21Map = new Map(ema21.map((p) => [p.time, p.value]));
    const rsiMap = new Map(rsi14.map((p) => [p.time, p.value]));
    for (let i = 22; i < bars.length; i++) {
        const bar = bars[i];
        const prevBar = bars[i - 1];
        const curr9 = ema9Map.get(bar.time);
        const prev9 = ema9Map.get(prevBar.time);
        const curr21 = ema21Map.get(bar.time);
        const prev21 = ema21Map.get(prevBar.time);
        const currRsi = rsiMap.get(bar.time);
        const prevRsi = rsiMap.get(prevBar.time);
        // 1. EMA 9/21 Golden Cross (Bullish Signal)
        if (curr9 && prev9 && curr21 && prev21) {
            if (prev9 <= prev21 && curr9 > curr21) {
                signals.push({
                    time: bar.time,
                    type: 'BUY',
                    strategy: 'EMA Golden Cross (9/21)',
                    price: bar.close,
                    description: `EMA 9 crossed above EMA 21 at $${bar.close.toFixed(2)}`,
                });
                markers.push({
                    time: bar.time,
                    position: 'belowBar',
                    color: '#0ecb81',
                    shape: 'arrowUp',
                    text: 'BUY: Golden Cross',
                    size: 2,
                });
                continue;
            }
            // 2. EMA 9/21 Death Cross (Bearish Signal)
            if (prev9 >= prev21 && curr9 < curr21) {
                signals.push({
                    time: bar.time,
                    type: 'SELL',
                    strategy: 'EMA Death Cross (9/21)',
                    price: bar.close,
                    description: `EMA 9 crossed below EMA 21 at $${bar.close.toFixed(2)}`,
                });
                markers.push({
                    time: bar.time,
                    position: 'aboveBar',
                    color: '#f6465d',
                    shape: 'arrowDown',
                    text: 'SELL: Death Cross',
                    size: 2,
                });
                continue;
            }
        }
        // 3. RSI Oversold Mean Reversion (< 30 crossing up)
        if (currRsi && prevRsi) {
            if (prevRsi <= 30 && currRsi > 30) {
                signals.push({
                    time: bar.time,
                    type: 'BUY',
                    strategy: 'RSI Oversold Bounce',
                    price: bar.close,
                    description: `RSI recovered from oversold (${prevRsi.toFixed(1)} -> ${currRsi.toFixed(1)})`,
                });
                markers.push({
                    time: bar.time,
                    position: 'belowBar',
                    color: '#38bdf8',
                    shape: 'arrowUp',
                    text: 'BUY: RSI < 30',
                    size: 2,
                });
                continue;
            }
            // 4. RSI Overbought Pullback (> 70 crossing down)
            if (prevRsi >= 70 && currRsi < 70) {
                signals.push({
                    time: bar.time,
                    type: 'SELL',
                    strategy: 'RSI Overbought Rejection',
                    price: bar.close,
                    description: `RSI pulled back from overbought (${prevRsi.toFixed(1)} -> ${currRsi.toFixed(1)})`,
                });
                markers.push({
                    time: bar.time,
                    position: 'aboveBar',
                    color: '#fb923c',
                    shape: 'arrowDown',
                    text: 'SELL: RSI > 70',
                    size: 2,
                });
            }
        }
    }
    // Sort markers chronologically required by lightweight-charts
    markers.sort((a, b) => a.time - b.time);
    return { signals, markers };
}
