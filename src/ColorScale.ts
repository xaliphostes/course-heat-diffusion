type RGB = [number, number, number]

type Entry = {
    value: number,
    rgb: RGB
}

class ColorScale {
    private colors: Entry[] = []

    addColor(value: number, rgb: RGB) {
        this.colors.push({ value, rgb })
    }

    setColors(colors: string[]) {
        const n = colors.length
        colors.forEach( (color, i) => {
            const rgb = this.fromHexToRgb(color)
            this.addColor(i/(n-1), rgb)
        })
    }

    color(_value: number, min = 0, max = 1): RGB {
        const value = (_value-min)/(max-min)
        // console.log(_value, min, max)

        if (value === 0) {
            return this.colors[0].rgb
        }

        // Get the 2 colors for whihc value is enclosed
        const n = this.colors.length
        let start = 0
        for (let i = 0; i < n; ++i) {
            if (this.colors[i].value >= value) {
                start = i
                break
            }
        }
        if (start === n - 1) {
            return this.colors[n - 1].rgb
        }

        const c1 = this.colors[start]
        const c2 = this.colors[start + 1]
        const v = value - c1.value
        return [
            this.linear(c1.rgb[0], c2.rgb[0], v),
            this.linear(c1.rgb[1], c2.rgb[1], v),
            this.linear(c1.rgb[2], c2.rgb[2], v)
        ]
    }

    fromHexToRgb(c: string): RGB {
        const hex = c.replace("#", "")
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return [r,g,b] as RGB
    }

    private linear(a: number, b: number, t: number) {
        return a + t * b
    }
}