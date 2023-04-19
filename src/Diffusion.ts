enum Constraint {
    LEFT, RIGHT, TOP, BOTTOM
}

class Diffusion {
    private T: Array<Array<number>> = []
    private dx = 0.01
    private dy = 0.01
    private dt = 0.0001
    private D = 0.1
    private nx = 0
    private ny = 0
    private constraints: Array<{i: number, j: number}> = []
    
    constructor(public readonly width: number, public readonly height: number, public readonly rez: number) {
        this.nx = 1 + width / rez
        this.ny = 1 + height / rez
        this.T = Array.from({ length: this.nx }, () => new Array(this.ny).fill(0))
    }

    get temperature() {
        return this.T
    }

    reset() {
        for (let i = 1; i < this.nx - 1; i++) {
            for (let j = 1; j < this.ny - 1; j++) {
                if (!this.isAConstraint(i,j)) {
                    this.T[i][j] = 0
                }
            }
        }
    }

    constraint(i: number, j: number, value: number) {
        this.T[i][j] = value
        this.constraints.push({i,j})
    }

    constraintBorder(where: Constraint, value: number) {
        switch (where) {
            case Constraint.BOTTOM: {
                for (let i=0; i<this.nx; ++i) {
                    this.T[i][0] = value
                }
                break
            }
            case Constraint.TOP: {
                for (let i=0; i<this.nx; ++i) {
                    this.T[i][this.ny-1] = value
                }
                break
            }
            case Constraint.LEFT: {
                for (let i=0; i<this.ny; ++i) {
                    this.T[0][i] = value
                }
                break
            }
            case Constraint.RIGHT: {
                for (let i=0; i<this.ny; ++i) {
                    this.T[this.nx-1][i] = value
                }
                break
            }
        }
    }

    run(iter: number) {
        for (let i=0; i<iter; ++i) {
            this.diffuse()
        }
    }

    diffuse() {
        const T = this.clone()

        for (let i = 1; i < this.nx - 1; i++) {
            for (let j = 1; j < this.ny - 1; j++) {
                if (!this.isAConstraint(i,j)) {
                    const laplacian = (
                        (this.T[i - 1][j] - 2 * this.T[i][j] + this.T[i + 1][j]) / this.dx ** 2 +
                        (this.T[i][j - 1] - 2 * this.T[i][j] + this.T[i][j + 1]) / this.dy ** 2
                    )
                    T[i][j] = this.T[i][j] + this.D * laplacian * this.dt
                }
            }
        }

        let res = 0
    
        T.forEach((row, i) => {
            row.forEach((val, j) => {
                const prev = this.T[i][j]
                //console.log(val, res)
                res += (val-prev)**2
                this.T[i][j] = val
            })
        })

        // console.log(res, this.nx, this.ny)

        return res / this.nx / this.ny
    }

    private isAConstraint(i: number, j: number): boolean {
        for (let k=0; k<this.constraints.length; ++k) {
            const c = this.constraints[k]
            if (c.i===i && c.j===j) {
                //console.log(i,j,'is a constraint')
                return true
            }
        }
        return false
    }

    private clone() {
        const T = Array.from({ length: this.nx }, () => new Array(this.ny).fill(0))
        for (let i = 0; i < this.nx; i++) {
            for (let j = 0; j < this.ny; j++) {
                T[i][j] = this.T[i][j]
            }
        }
        return T
    }
}