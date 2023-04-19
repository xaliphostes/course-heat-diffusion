class ColorTable {

    private colors: Array<{ value: number, color: string }> = []
    private stepSize = 32

    constructor(colors: Array<string>, private minValue: number, private maxValue: number) {
        // const colors = colors!== undefined ? colors :["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"]
        // Define the range of values for your color scale
        const range = maxValue - minValue

        // Calculate the step size for each color in your scale
        const stepSize = range / (colors.length - 1)

        // Generate an array of colors for your scale
        const colorScale = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            const value = minValue + (stepSize * i);
            colorScale.push({ value, color });
        }

        this.colors = colorScale
    }

    color(x: number) {
        if (x < this.minValue) {
            return this.colors[0]
        }
        if (x > this.maxValue) {
            return this.colors[this.colors.length - 1]
        }
        const i = Math.floor((x - this.minValue) / this.stepSize)
        if (i >= this.colors.length - 1) {
            return this.colors[this.colors.length - 1]
        }
        const colorRange = [this.colors[i], this.colors[i + 1]]
        const valueRange = [this.colors[i].value, this.colors[i + 1].value]
        const alpha = (x - valueRange[0]) / (valueRange[1] - valueRange[0])
        const color = this.interpolateColor(colorRange[0].color, colorRange[1].color, alpha)
        return color
    }

    private interpolateColor(color1: string, color2: string, alpha: number) {
        const hex1 = color1.replace("#", "")
        const hex2 = color2.replace("#", "")
        const r1 = parseInt(hex1.substring(0, 2), 16)
        const g1 = parseInt(hex1.substring(2, 4), 16)
        const b1 = parseInt(hex1.substring(4, 6), 16)
        const r2 = parseInt(hex2.substring(0, 2), 16)
        const g2 = parseInt(hex2.substring(2, 4), 16)
        const b2 = parseInt(hex2.substring(4, 6), 16)
        const r = Math.round(r1 + (alpha * (r2 - r1)))
        const g = Math.round(g1 + (alpha * (g2 - g1)))
        const b = Math.round(b1 + (alpha * (b2 - b1)))
        return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
    }
}