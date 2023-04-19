
class Plain {
    private cols = 1
    private rows = 1
    private table: ColorScale = undefined

    constructor(private readonly width: number, private readonly height: number, private readonly rez: number) {
        this.cols = 1 + width / rez
        this.rows = 1 + height /rez

        this.table = new ColorScale()
        this.table.setColors([
            '#003627',
            '#008A3B',
            '#68BE0D',
            '#D6DF00',
            '#FAD000',
            '#FFC010',
            '#FFAE0E',
            '#FF9B06',
            '#FA5800',
            '#E80008',
            '#880003'
        ])
    }

    draw(field: Array<Array<number>>, min = 0, max = 1) {
        background(120)
        strokeWeight(0)

        for (let i = 0; i < this.cols; ++i) {
            for (let j = 0; j < this.rows; ++j) {
                const v = field[i][j]
                let x = i * this.rez
                let y = j * this.rez

                const c = this.table.color(v, min, max) as any

                fill(c)
                rect(x, y, this.rez)
            }
        }
    }

}