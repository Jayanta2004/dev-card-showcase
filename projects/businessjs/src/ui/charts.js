/**
 * Charts Library
 * Handcrafted SVG charts.
 */
export class Charts {
    static createLineChart(data, width, height, color = '#38bdf8') {
        if (!data || data.length < 2) return '';

        // Normalize data
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const padding = 5;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Generate Path
        const points = data.map((val, index) => {
            const x = (index / (data.length - 1)) * chartWidth + padding;
            const y = chartHeight - ((val - min) / range) * chartHeight + padding;
            return `${x},${y}`;
        }).join(' ');

        // Zero Line
        let zeroLine = '';
        if (min < 0 && max > 0) {
            const zeroY = chartHeight - ((0 - min) / range) * chartHeight + padding;
            zeroLine = `<line x1="0" y1="${zeroY}" x2="${width}" y2="${zeroY}" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4" />`;
        }

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                ${zeroLine}
                <polyline 
                    fill="none" 
                    stroke="${color}" 
                    stroke-width="2" 
                    points="${points}" 
                    vector-effect="non-scaling-stroke"
                />
            </svg>
        `;
    }
}
