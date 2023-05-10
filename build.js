var ColorScale = (function () {
    function ColorScale() {
        this.colors = [];
    }
    ColorScale.prototype.addColor = function (value, rgb) {
        this.colors.push({ value: value, rgb: rgb });
    };
    ColorScale.prototype.setColors = function (colors) {
        var _this = this;
        var n = colors.length;
        colors.forEach(function (color, i) {
            var rgb = _this.fromHexToRgb(color);
            _this.addColor(i / (n - 1), rgb);
        });
    };
    ColorScale.prototype.color = function (_value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        var value = (_value - min) / (max - min);
        if (value === 0) {
            return this.colors[0].rgb;
        }
        var n = this.colors.length;
        var start = 0;
        for (var i = 0; i < n; ++i) {
            if (this.colors[i].value >= value) {
                start = i;
                break;
            }
        }
        if (start === n - 1) {
            return this.colors[n - 1].rgb;
        }
        var c1 = this.colors[start];
        var c2 = this.colors[start + 1];
        var v = value - c1.value;
        return [
            this.linear(c1.rgb[0], c2.rgb[0], v),
            this.linear(c1.rgb[1], c2.rgb[1], v),
            this.linear(c1.rgb[2], c2.rgb[2], v)
        ];
    };
    ColorScale.prototype.fromHexToRgb = function (c) {
        var hex = c.replace("#", "");
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b];
    };
    ColorScale.prototype.linear = function (a, b, t) {
        return a + t * b;
    };
    return ColorScale;
}());
var ColorTable = (function () {
    function ColorTable(colors, minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.colors = [];
        this.stepSize = 32;
        var range = maxValue - minValue;
        var stepSize = range / (colors.length - 1);
        var colorScale = [];
        for (var i = 0; i < colors.length; i++) {
            var color_1 = colors[i];
            var value = minValue + (stepSize * i);
            colorScale.push({ value: value, color: color_1 });
        }
        this.colors = colorScale;
    }
    ColorTable.prototype.color = function (x) {
        if (x < this.minValue) {
            return this.colors[0];
        }
        if (x > this.maxValue) {
            return this.colors[this.colors.length - 1];
        }
        var i = Math.floor((x - this.minValue) / this.stepSize);
        if (i >= this.colors.length - 1) {
            return this.colors[this.colors.length - 1];
        }
        var colorRange = [this.colors[i], this.colors[i + 1]];
        var valueRange = [this.colors[i].value, this.colors[i + 1].value];
        var alpha = (x - valueRange[0]) / (valueRange[1] - valueRange[0]);
        var color = this.interpolateColor(colorRange[0].color, colorRange[1].color, alpha);
        return color;
    };
    ColorTable.prototype.interpolateColor = function (color1, color2, alpha) {
        var hex1 = color1.replace("#", "");
        var hex2 = color2.replace("#", "");
        var r1 = parseInt(hex1.substring(0, 2), 16);
        var g1 = parseInt(hex1.substring(2, 4), 16);
        var b1 = parseInt(hex1.substring(4, 6), 16);
        var r2 = parseInt(hex2.substring(0, 2), 16);
        var g2 = parseInt(hex2.substring(2, 4), 16);
        var b2 = parseInt(hex2.substring(4, 6), 16);
        var r = Math.round(r1 + (alpha * (r2 - r1)));
        var g = Math.round(g1 + (alpha * (g2 - g1)));
        var b = Math.round(b1 + (alpha * (b2 - b1)));
        return "#" + [r, g, b].map(function (c) { return c.toString(16).padStart(2, "0"); }).join("");
    };
    return ColorTable;
}());
var Constraint;
(function (Constraint) {
    Constraint[Constraint["LEFT"] = 0] = "LEFT";
    Constraint[Constraint["RIGHT"] = 1] = "RIGHT";
    Constraint[Constraint["TOP"] = 2] = "TOP";
    Constraint[Constraint["BOTTOM"] = 3] = "BOTTOM";
})(Constraint || (Constraint = {}));
var Diffusion = (function () {
    function Diffusion(width, height, rez) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.rez = rez;
        this.T = [];
        this.dx = 0.01;
        this.dy = 0.01;
        this.dt = 0.0001;
        this.D = 0.1;
        this.nx = 0;
        this.ny = 0;
        this.constraints = [];
        this.nx = 1 + width / rez;
        this.ny = 1 + height / rez;
        this.T = Array.from({ length: this.nx }, function () { return new Array(_this.ny).fill(0); });
    }
    Object.defineProperty(Diffusion.prototype, "temperature", {
        get: function () {
            return this.T;
        },
        enumerable: false,
        configurable: true
    });
    Diffusion.prototype.reset = function () {
        for (var i = 1; i < this.nx - 1; i++) {
            for (var j = 1; j < this.ny - 1; j++) {
                if (!this.isAConstraint(i, j)) {
                    this.T[i][j] = 0;
                }
            }
        }
    };
    Diffusion.prototype.constraint = function (i, j, value) {
        this.T[i][j] = value;
        this.constraints.push({ i: i, j: j });
    };
    Diffusion.prototype.constraintBorder = function (where, value) {
        switch (where) {
            case Constraint.BOTTOM: {
                for (var i = 0; i < this.nx; ++i) {
                    this.T[i][0] = value;
                }
                break;
            }
            case Constraint.TOP: {
                for (var i = 0; i < this.nx; ++i) {
                    this.T[i][this.ny - 1] = value;
                }
                break;
            }
            case Constraint.LEFT: {
                for (var i = 0; i < this.ny; ++i) {
                    this.T[0][i] = value;
                }
                break;
            }
            case Constraint.RIGHT: {
                for (var i = 0; i < this.ny; ++i) {
                    this.T[this.nx - 1][i] = value;
                }
                break;
            }
        }
    };
    Diffusion.prototype.run = function (iter) {
        for (var i = 0; i < iter; ++i) {
            this.diffuse();
        }
    };
    Diffusion.prototype.diffuse = function () {
        var _this = this;
        var T = this.clone();
        for (var i = 1; i < this.nx - 1; i++) {
            for (var j = 1; j < this.ny - 1; j++) {
                if (!this.isAConstraint(i, j)) {
                    var laplacian = ((this.T[i - 1][j] - 2 * this.T[i][j] + this.T[i + 1][j]) / Math.pow(this.dx, 2) +
                        (this.T[i][j - 1] - 2 * this.T[i][j] + this.T[i][j + 1]) / Math.pow(this.dy, 2));
                    T[i][j] = this.T[i][j] + this.D * laplacian * this.dt;
                }
            }
        }
        var res = 0;
        T.forEach(function (row, i) {
            row.forEach(function (val, j) {
                var prev = _this.T[i][j];
                res += Math.pow((val - prev), 2);
                _this.T[i][j] = val;
            });
        });
        return res / this.nx / this.ny;
    };
    Diffusion.prototype.isAConstraint = function (i, j) {
        for (var k = 0; k < this.constraints.length; ++k) {
            var c = this.constraints[k];
            if (c.i === i && c.j === j) {
                return true;
            }
        }
        return false;
    };
    Diffusion.prototype.clone = function () {
        var _this = this;
        var T = Array.from({ length: this.nx }, function () { return new Array(_this.ny).fill(0); });
        for (var i = 0; i < this.nx; i++) {
            for (var j = 0; j < this.ny; j++) {
                T[i][j] = this.T[i][j];
            }
        }
        return T;
    };
    return Diffusion;
}());
var Iso = (function () {
    function Iso(width, height, rez) {
        this.width = width;
        this.height = height;
        this.rez = rez;
        this.t = { x: 0, y: 0 };
        this.cols = 1;
        this.rows = 1;
        this.resolution = 0.05;
        this.cols = 1 + width / this.rez;
        this.rows = 1 + height / this.rez;
    }
    Iso.prototype.draw = function (field, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        background(120);
        var rez = this.rez;
        strokeWeight(3);
        for (var h = -1; h < 1; h += this.resolution) {
            stroke(255 * h, 255 * -h, 127);
            for (var i = 0; i < this.cols - 1; i++) {
                for (var j = 0; j < this.rows - 1; j++) {
                    var f0 = field[i][j] - h;
                    var f1 = field[i + 1][j] - h;
                    var f2 = field[i + 1][j + 1] - h;
                    var f3 = field[i][j + 1] - h;
                    var x = i * rez;
                    var y = j * rez;
                    var a = createVector(x + rez * f0 / (f0 - f1), y);
                    var b = createVector(x + rez, y + rez * f1 / (f1 - f2));
                    var c = createVector(x + rez * (1 - f2 / (f2 - f3)), y + rez);
                    var d = createVector(x, y + rez * (1 - f3 / (f3 - f0)));
                    var state = this.getState(f0, f1, f2, f3);
                    switch (state) {
                        case 1:
                            this.drawLine(c, d);
                            break;
                        case 2:
                            this.drawLine(b, c);
                            break;
                        case 3:
                            this.drawLine(b, d);
                            break;
                        case 4:
                            this.drawLine(a, b);
                            break;
                        case 5:
                            this.drawLine(a, d);
                            this.drawLine(b, c);
                            break;
                        case 6:
                            this.drawLine(a, c);
                            break;
                        case 7:
                            this.drawLine(a, d);
                            break;
                        case 8:
                            this.drawLine(a, d);
                            break;
                        case 9:
                            this.drawLine(a, c);
                            break;
                        case 10:
                            this.drawLine(a, b);
                            this.drawLine(c, d);
                            break;
                        case 11:
                            this.drawLine(a, b);
                            break;
                        case 12:
                            this.drawLine(b, d);
                            break;
                        case 13:
                            this.drawLine(b, c);
                            break;
                        case 14:
                            this.drawLine(c, d);
                            break;
                    }
                }
            }
        }
    };
    Iso.prototype.drawLine = function (v1, v2) {
        line(v1.x + this.t.x, v1.y + this.t.y, v2.x + this.t.x, v2.y + this.t.y);
    };
    Iso.prototype.getState = function (a, b, c, d) {
        return (a > 0 ? 8 : 0) + (b > 0 ? 4 : 0) + (c > 0 ? 2 : 0) + (d > 0 ? 1 : 0);
    };
    return Iso;
}());
var Plain = (function () {
    function Plain(width, height, rez) {
        this.width = width;
        this.height = height;
        this.rez = rez;
        this.cols = 1;
        this.rows = 1;
        this.table = undefined;
        this.cols = 1 + width / rez;
        this.rows = 1 + height / rez;
        this.table = new ColorScale();
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
        ]);
    }
    Plain.prototype.draw = function (field, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        background(120);
        strokeWeight(0);
        for (var i = 0; i < this.cols; ++i) {
            for (var j = 0; j < this.rows; ++j) {
                var v = field[i][j];
                var x = i * this.rez;
                var y = j * this.rez;
                var c = this.table.color(v, min, max);
                fill(c);
                rect(x, y, this.rez);
            }
        }
    };
    return Plain;
}());
var Slider = (function () {
    function Slider(c, v, posH, name, diff) {
        var _this = this;
        this.c = c;
        this.v = v;
        this.posH = posH;
        this.name = name;
        this.diff = diff;
        this.slider = undefined;
        this.label = undefined;
        this.slider = createSlider(-100, 100, 0, 1);
        this.slider.input(function () {
            _this.v = _this.slider.value();
            _this.label.value(_this.v);
            _this.setConstraintOn(diff);
        });
        this.slider.position(90, this.posH);
        var labelName = createElement('h4', name);
        labelName.position(30, this.slider.y - 3);
        labelName.style('font-size', '18px');
        this.label = createInput('0').size(50);
        this.label.position(this.slider.x * 1.2 + this.slider.width, this.slider.y);
        this.label.input(function () {
            _this.v = float(_this.label.value());
            _this.slider.value(_this.v);
            _this.setConstraintOn(diff);
        });
    }
    Slider.prototype.setConstraintOn = function (diff) {
        switch (this.c) {
            case Constraint.TOP:
                diff.constraintBorder(Constraint.TOP, this.v);
                break;
            case Constraint.LEFT:
                diff.constraintBorder(Constraint.LEFT, this.v);
                break;
            case Constraint.RIGHT:
                diff.constraintBorder(Constraint.RIGHT, this.v);
                break;
            case Constraint.BOTTOM:
                diff.constraintBorder(Constraint.BOTTOM, this.v);
                break;
        }
    };
    return Slider;
}());
var N = 5;
var W = 500;
var diff;
var sliders = [];
var residual = undefined;
var iso = new Iso(W, W, N);
var plain = new Plain(W, W, N);
reset();
function reset() {
    diff = new Diffusion(W, W, N);
    sliders.forEach(function (s) { return s.setConstraintOn(diff); });
}
function setup() {
    pixelDensity(1);
    createCanvas(W, W);
    var H = 60;
    sliders.push(new Slider(Constraint.BOTTOM, 0, W + H, 'Top', diff));
    sliders.push(new Slider(Constraint.TOP, 0, W + H + 30, 'Bottom', diff));
    sliders.push(new Slider(Constraint.LEFT, 0, W + H + 60, 'Left', diff));
    sliders.push(new Slider(Constraint.RIGHT, 0, W + H + 90, 'Right', diff));
    residual = createInput('0').size(100);
    residual.position(50, 50);
}
function draw() {
    var res = 0;
    for (var i = 0; i < 100; ++i) {
        res = diff.diffuse();
    }
    plain.draw(diff.temperature, -100, 100);
    residual.value(expo(res, 3));
}
function expo(x, f) {
    return x.toExponential(f);
}
//# sourceMappingURL=src/src/build.js.map