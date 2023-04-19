// See from https://editor.p5js.org/oliholli/sketches/NB5Syz-3g
class Iso {
    private t = {x: 0, y:0}
    private cols = 1
    private rows = 1
    private resolution = 0.05

    constructor(private readonly width: number, private readonly height: number, private readonly rez: number) {
        this.cols = 1 + width / this.rez
        this.rows = 1 + height / this.rez
    }

    draw(field: Array<Array<number>>, min = 0, max = 1) {
        background(120)

        const rez = this.rez

        strokeWeight(3)

        for (let h = -1; h < 1; h += this.resolution) {
            stroke(255 * h, 255 * -h, 127)

            for (let i = 0; i < this.cols - 1; i++) {
                for (let j = 0; j < this.rows - 1; j++) {
                    let f0 = field[i][j] - h
                    let f1 = field[i + 1][j] - h
                    let f2 = field[i + 1][j + 1] - h
                    let f3 = field[i][j + 1] - h

                    let x = i * rez
                    let y = j * rez
                    let a = createVector(x + rez * f0 / (f0 - f1), y)
                    let b = createVector(x + rez, y + rez * f1 / (f1 - f2))
                    let c = createVector(x + rez * (1 - f2 / (f2 - f3)), y + rez)
                    let d = createVector(x, y + rez * (1 - f3 / (f3 - f0)))

                    let state = this.getState(f0, f1, f2, f3)
                    switch (state) {
                        case 1:
                            this.drawLine(c, d)
                            break
                        case 2:
                            this.drawLine(b, c)
                            break
                        case 3:
                            this.drawLine(b, d)
                            break
                        case 4:
                            this.drawLine(a, b)
                            break
                        case 5:
                            this.drawLine(a, d)
                            this.drawLine(b, c)
                            break
                        case 6:
                            this.drawLine(a, c)
                            break
                        case 7:
                            this.drawLine(a, d)
                            break
                        case 8:
                            this.drawLine(a, d)
                            break
                        case 9:
                            this.drawLine(a, c)
                            break
                        case 10:
                            this.drawLine(a, b)
                            this.drawLine(c, d)
                            break
                        case 11:
                            this.drawLine(a, b)
                            break
                        case 12:
                            this.drawLine(b, d)
                            break
                        case 13:
                            this.drawLine(b, c)
                            break
                        case 14:
                            this.drawLine(c, d)
                            break
                    }
                }
            }
        }
    }

    private drawLine(v1: p5.Vector, v2: p5.Vector) {
        line(v1.x + this.t.x, v1.y + this.t.y, v2.x + this.t.x, v2.y + this.t.y)
        // console.log(v1, v2)
    }

    private getState(a: number, b: number, c: number, d: number) {
        return (a > 0 ? 8 : 0) + (b > 0 ? 4 : 0) + (c > 0 ? 2 : 0) + (d > 0 ? 1 : 0)
    }
}
