let N = 5
let W = 500
let diff: Diffusion

const sliders: Array<Slider> = []
let residual: any = undefined

let iso = new Iso(W, W, N)
let plain = new Plain(W, W, N)

reset()

function reset() {
    diff = new Diffusion(W, W, N)
    sliders.forEach(s => s.setConstraintOn(diff))
}

function setup() {
    pixelDensity(1)
    createCanvas(W, W)

    const H = 60

    sliders.push(new Slider(Constraint.BOTTOM, 0, W + H, 'Top', diff))
    sliders.push(new Slider(Constraint.TOP, 0, W + H + 30, 'Bottom', diff))
    sliders.push(new Slider(Constraint.LEFT, 0, W + H + 60, 'Left', diff))
    sliders.push(new Slider(Constraint.RIGHT, 0, W + H + 90, 'Right', diff))

    residual = createInput('0').size(100)
    residual.position(50, 50)
}

function draw() {
    let res = 0
    for (let i = 0; i < 100; ++i) {
        res = diff.diffuse()
    }

    plain.draw(diff.temperature, -100, 100)
    // iso.draw(diff.temperature, -100, 100)

    residual.value(expo(res, 3))
}

function expo(x: number, f: number) {
    return x.toExponential(f)
}
