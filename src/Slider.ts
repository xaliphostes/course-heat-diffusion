class Slider {
    private slider: any = undefined
    private label: any = undefined

    constructor(private c: Constraint, private v: number, private posH: number, private name: string, private diff: Diffusion) {
        this.slider = createSlider(-100, 100, 0, 1) as any
        this.slider.input( () => {
            this.v = this.slider.value()
            this.label.value(this.v)
            // reset()
            this.setConstraintOn(diff)
        })
        this.slider.position(90, this.posH)
        
        const labelName = createElement('h4', name)
        labelName.position(30, this.slider.y-3)
        labelName.style('font-size', '18px')
        

        this.label = createInput('0').size(50)
        this.label.position(this.slider.x * 1.2 + this.slider.width, this.slider.y)
        this.label.input( () => {
            this.v = float(this.label.value())
            this.slider.value(this.v)
            this.setConstraintOn(diff)
            // reset()
        })
    }

    setConstraintOn(diff: Diffusion) {
        switch(this.c) {
            case Constraint.TOP: diff.constraintBorder(Constraint.TOP, this.v); break
            case Constraint.LEFT: diff.constraintBorder(Constraint.LEFT, this.v); break
            case Constraint.RIGHT: diff.constraintBorder(Constraint.RIGHT, this.v); break
            case Constraint.BOTTOM: diff.constraintBorder(Constraint.BOTTOM, this.v); break
        }
    }
}
