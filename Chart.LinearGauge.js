(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {
        geometry: 'vertical', // horizontal/vertical
        range: {
            startValue: -150,
            endValue: 300
        }, // startValue/endValue
        axisColor: '#c0c4cf',
        axisWidth: 6, // set to 0 so no axis line is displayed	
        majorTicks: {},
        minorTicks: {},
        tickLabels: {},
        scaleColorRanges: [],
        dataset: {
            value: 0,
            indicator: 'range', // 'range' or 'point' indicator
            shape: 'circle', // for point indicator available options - 'circle', 'rect', 'tringle'
            width: 8,
            height: 5, // for point indicator
            offset: 10, // for range indicator from center of the axis line 
            color: '#51f40b',
            colorRanges: [{
                startpoint: 0,
                breakpoint: 20,
                color: '#6154ab'
            }, {
                startpoint: 20,
                breakpoint: 70,
                color: '#74f40b'
            }, {
                startpoint: 70,
                breakpoint: 100,
                color: '#fd0902'
            }], // for the range, array with breakpoints and colors
            tooltipRanges: [{
                startpoint: 0,
                breakpoint: 20,
                tooltip: 'low'
            }, {
                startpoint: 20,
                breakpoint: 70,
                tooltip: 'normal'
            }, {
                startpoint: 70,
                breakpoint: 100,
                tooltip: 'high'
            }],
            img: '',
            label: ''
        },
        padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        multiTooltipTitles: 'Total'
    };

    //	Linear guage scale class
    Chart.LinearScale = Chart.Element.extend({
        initialize: function() {
            //	Calculate size of lable
            this.textDimention = function(val) {
                var width = 0;
                var height = this.fontSize;
                var str = val + "";
                width = (height / 1.5) * str.length;
                return {
                    width: width,
                    height: height
                };
            };

            //	Prepare values for ticks
            //	Major ticks
            if (typeof(this.majorTicks) == 'object' && this.majorTicks !== null && this.majorTicks.interval > 0) {
                var majorVals = [];
                if (this.majorTicks.customValues.length > 0) {
                    majorVals = this.majorTicks.customValues;
                } else {
                    var interval = this.majorTicks.interval;
                    var numOfMajor = (this.range.endValue - this.range.startValue) / interval;
                    for (var i = 0; i < numOfMajor - 1; i++) {
                        majorVals.push(this.range.startValue + (interval * (i + 1)));
                    }
                }
                this.majorVals = majorVals;
            }

            //	Minor ticks
            if (typeof(this.minorTicks) == 'object' && this.minorTicks !== null && this.minorTicks.interval > 0) {
                var minorVals = [];
                if (this.minorTicks.customValues.length > 0) {
                    minorVals = this.minorTicks.customValues;
                } else {
                    var interval = this.minorTicks.interval;
                    var numOfMinor = (this.range.endValue - this.range.startValue) / interval;
                    for (var i = 0; i < numOfMinor - 1; i++) {
                        minorVals.push(this.range.startValue + (interval * (i + 1)));
                    }
                }
                this.minorVals = minorVals;
            }

            //	Labels of ticks
            if (typeof(this.tickLabels) == 'object' && this.tickLabels !== null && this.tickLabels.interval > 0) {
                var labelVals = [];
                if (this.tickLabels.customValues.length > 0) {
                    labelVals = this.tickLabels.customValues;
                } else {
                    var interval = this.tickLabels.interval;
                    var numOfLabels = ((this.range.endValue - this.range.startValue) / interval) + 1;
                    for (var i = 0; i < numOfLabels; i++) {
                        labelVals.push(this.range.startValue + (interval * i));
                    }
                }
                this.labelVals = labelVals;
            }

            //	Horizontal orientation
            if (this.geometry == 'horizontal') {
                this.scalePoint = function(val) {
                    var displayW = this.width - this.padding.left - this.padding.right;
                    var rangeH = this.range.endValue - this.range.startValue;
                    var factor = displayW / rangeH;
                    return Math.round((val * factor) + this.padding.left - (this.range.startValue * factor));
                };
                this.base = this.height / 2; //	center of chart located at the center of canvas
            } else {
                this.scalePoint = function(val) {
                    var displayH = this.height - this.padding.top - this.padding.bottom;
                    var rangeH = this.range.endValue - this.range.startValue;
                    var factor = displayH / rangeH;
                    return Math.round(this.height - (val * factor - (this.range.startValue * factor)) - this.padding.bottom);
                };
                this.base = this.width / 2; //	center of chart located at the center of canvas
            }
        },
        update: function(newProps) {
            helpers.extend(this, newProps);
            this.initialize();
        },
        draw: function() {
            var ctx = this.ctx;
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "start";

            //	Horizontal orientation
            if (this.geometry == 'horizontal') {
                //	Draw scale background
                ctx.beginPath();
                ctx.fillStyle = this.axisColor;
                ctx.rect(this.padding.left, this.base - this.axisWidth / 2,
                    this.width - this.padding.left - this.padding.right, this.axisWidth);
                ctx.fill();
                ctx.closePath();

                //	Draw scale color ranges
                if (typeof(this.scaleColorRanges) == 'object' && this.scaleColorRanges.length > 0) {
                    helpers.each(this.scaleColorRanges, function(d, ind) {
                        var width = this.scalePoint(d.end) - this.scalePoint(d.start);
                        var height = this.axisWidth;
                        ctx.beginPath();
                        ctx.fillStyle = d.color;
                        ctx.rect(
                            this.scalePoint(d.start),
                            this.base - (height / 2),
                            width,
                            height
                        );
                        ctx.fill();

                    }, this);
                }

                //	Draw scale minor ticks
                ctx.beginPath();
                if (typeof(this.minorVals) == 'object' && this.minorVals.length > 0) {
                    ctx.fillStyle = this.minorTicks.color;
                    ctx.strokeStyle = this.minorTicks.color;
                    ctx.lineWidth = this.minorTicks.height;
                    for (var v = 0; v < this.minorVals.length; v++) {
                        var val = this.minorVals[v];
                        ctx.moveTo(this.scalePoint(val) - (this.minorTicks.height / 2),
                            this.base - (this.minorTicks.width / 2) + this.minorTicks.offset);
                        ctx.lineTo(this.scalePoint(val) - (this.minorTicks.height / 2), (this.base - (this.minorTicks.width / 2) + this.minorTicks.offset) + this.minorTicks.width);
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale major ticks
                ctx.beginPath();
                if (typeof(this.majorVals) == 'object' && this.majorVals.length > 0) {
                    ctx.fillStyle = this.majorTicks.color;
                    ctx.strokeStyle = this.majorTicks.color;
                    ctx.lineWidth = this.majorTicks.height;
                    for (var v = 0; v < this.majorVals.length; v++) {
                        var val = this.majorVals[v];
                        ctx.moveTo(this.scalePoint(val) - (this.majorTicks.height / 2),
                            this.base - (this.majorTicks.width / 2) + this.majorTicks.offset);
                        ctx.lineTo(this.scalePoint(val) - (this.majorTicks.height / 2), (this.base - (this.majorTicks.width / 2) + this.majorTicks.offset) + this.majorTicks.width);
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale labels
                ctx.beginPath();
                if (typeof(this.labelVals) == 'object' && this.labelVals.length > 0) {
                    ctx.fillStyle = this.tickLabels.color;
                    ctx.font = this.font;
                    for (var v = 0; v < this.labelVals.length; v++) {
                        var val = this.labelVals[v];
                        if (this.showLabels) {
                            var text = val + this.tickLabels.units;
                            ctx.fillText(text,
                                this.scalePoint(val) - this.textDimention(text).width / 2,
                                this.base + (this.tickLabels.offset > 0 ? 0 : this.textDimention(text).height) - this.tickLabels.offset
                            );
                        }
                    }
                }
                ctx.closePath();
            } else {
                //	Draw scale background
                ctx.beginPath();
                ctx.fillStyle = this.axisColor;
                ctx.rect(this.base - this.axisWidth / 2, this.padding.top, this.axisWidth, this.height - this.padding.top - this.padding.bottom);
                ctx.fill();
                ctx.closePath();

                //	Draw scale color ranges
                if (typeof(this.scaleColorRanges) == 'object' && this.scaleColorRanges.length > 0) {
                    helpers.each(this.scaleColorRanges, function(d, ind) {
                        var width = this.axisWidth;
                        var height = this.scalePoint(d.start) - this.scalePoint(d.end);
                        ctx.beginPath();
                        ctx.fillStyle = d.color;
                        ctx.rect(
                            this.base - (width / 2),
                            this.scalePoint(d.end),
                            width,
                            height
                        );
                        ctx.fill();

                    }, this);
                }

                //	Draw scale minor ticks
                ctx.beginPath();
                if (typeof(this.minorVals) == 'object' && this.minorVals.length > 0) {
                    ctx.fillStyle = this.minorTicks.color;
                    ctx.strokeStyle = this.minorTicks.color;
                    ctx.lineWidth = this.minorTicks.height;
                    for (var v = 0; v < this.minorVals.length; v++) {
                        var val = this.minorVals[v];
                        ctx.moveTo(this.base - (this.minorTicks.width / 2) + this.minorTicks.offset,
                            this.scalePoint(val) - (this.minorTicks.height / 2));
                        ctx.lineTo((this.base - (this.minorTicks.width / 2) + this.minorTicks.offset) + this.minorTicks.width,
                            this.scalePoint(val) - (this.minorTicks.height / 2));
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale major ticks
                ctx.beginPath();
                if (typeof(this.majorVals) == 'object' && this.majorVals.length > 0) {
                    ctx.fillStyle = this.majorTicks.color;
                    ctx.strokeStyle = this.majorTicks.color;
                    ctx.lineWidth = this.majorTicks.height;
                    for (var v = 0; v < this.majorVals.length; v++) {
                        var val = this.majorVals[v];
                        ctx.moveTo(this.base - (this.majorTicks.width / 2) + this.majorTicks.offset,
                            this.scalePoint(val) - (this.majorTicks.height / 2));
                        ctx.lineTo((this.base - (this.majorTicks.width / 2) + this.majorTicks.offset) + this.majorTicks.width,
                            this.scalePoint(val) - (this.majorTicks.height / 2));
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale labels
                ctx.beginPath();
                if (typeof(this.labelVals) == 'object' && this.labelVals.length > 0) {
                    ctx.fillStyle = this.tickLabels.color;
                    ctx.font = this.font;
                    for (var v = 0; v < this.labelVals.length; v++) {
                        var val = this.labelVals[v];
                        if (this.showLabels) {
                            var text = val + this.tickLabels.units;
                            ctx.fillText(text,
                                this.base - (this.tickLabels.offset > 0 ? 0 : this.textDimention(text).width) + this.tickLabels.offset,
                                this.scalePoint(val) + this.textDimention(text).height / 4
                            );
                        }
                    }
                }
                ctx.closePath();
            }
        }
    });

    Chart.Type.extend({
        name: "Linear",
        defaults: defaultConfig,
        initialize: function(data) {

            //Expose options as a scope variable here so we can access it in the ScaleClass
            var options = this.options;

            var padding = this.padding = {};
            padding.top = this.options.scaleFontSize + this.options.padding.top;
            padding.bottom = this.options.scaleFontSize + this.options.padding.bottom;
            padding.left = this.options.scaleFontSize * 2 + this.options.padding.left;
            padding.right = this.options.scaleFontSize * 2 + this.options.padding.right;

            this.RangeClass = Chart.Element.extend({
                strokeWidth: this.options.barStrokeWidth,
                showStroke: this.options.barShowStroke,
                ctx: this.chart.ctx,
                rangeColorImage: null,
                generateImage: function(colors, widths) {
                    var width = 0;
                    for (var i = 0; i < widths.length; i++)
                        width += widths[i];
                    var canvas = document.createElement('canvas'),
                        c = canvas.getContext('2d');
                    canvas.width = width;
                    canvas.height = 1;
                    var gw2 = widths[0];
                    var grd = c.createLinearGradient(0, 0, width, 0);
                    grd.addColorStop(0, colors[0]);
                    for (var k = 0; k < colors.length; k++) {
                        if ((k + 1) < colors.length) {
                            gw2 += widths[k + 1] / 2;
                            grd.addColorStop(gw2 / width, colors[k + 1]);
                        } else grd.addColorStop(1, colors[k]);
                        this.ctx.closePath();
                        if ((k + 1) < colors.length)
                            gw2 += widths[k + 1] / 2;
                    }
                    c.fillStyle = grd;
                    c.fillRect(0, 0, width, 20);
                    var imgd = c.getImageData(0, 0, canvas.width, 1);
                    return imgd;
                },
                getColor: function() {
                    var startColor = this.fillColor;
                    var out = 0;
                    var rc = 0;
                    var gc = 0;
                    var bc = 0;
                    var ac = 1;
                    //	If image data did not filled yet
                    if (this.rangeColorImage === null) {
                        var colors = [];
                        var widths = [];
                        //colors.push(startColor);
                        helpers.each(this.colorRanges, function(cl, i) {
                            if (i === 0)
                                widths.push((cl.breakpoint - this.axisRange.startValue) * this.scaleValue);
                            else
                                widths.push((cl.breakpoint - this.colorRanges[i - 1].breakpoint) * this.scaleValue);
                            colors.push(cl.color);

                        }, this);
                        this.rangeColorImages = this.generateImage(colors, widths);
                    }


                    var start = this.axisRange.startValue;

                    var k = Math.ceil((this.value - start) * this.scaleValue);
                    rc = this.rangeColorImages.data[k * 4 + 0];
                    gc = this.rangeColorImages.data[k * 4 + 1];
                    bc = this.rangeColorImages.data[k * 4 + 2];
                    ac = this.rangeColorImages.data[k * 4 + 3];

                    return 'RGBA(' + rc + ', ' + gc + ', ' + bc + ', ' + ac + ')';
                },
                draw: function() {
                    var ctx = this.ctx,
                        leftX, leftY, rightX, rightY;

                    if (this.img !== null) {
                        if (this.geometry == 'horizontal') {
                            var x = this.leftX = this.startPoint + ((this.value - this.startValue) * this.scaleValue) - this.width / 2,
                                y = this.leftY = this.base - this.width + this.offset * (-1),
                                width = this.width,
                                height = this.height;
                        } else {
                            var y = this.leftX = this.startPoint - ((this.value - this.startValue) * this.scaleValue) - this.height / 2,
                                x = this.leftY = this.base + this.offset,
                                width = this.width,
                                height = this.height;
                        }
                        this.x = x + this.width / 2;
                        this.y = y + this.height / 2;
                        this.rightX = this.leftX + this.width;
                        this.rightY = this.leftY + this.height;
                        ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, x, y, width, height);
                        return;
                    }

                    var startColor = this.fillColor;
                    //	Implement color ranges
                    if (typeof(this.colorRanges) == 'object' && this.colorRanges.length > 0) {
                        startColor = this.getColor();
                    }

                    ctx.beginPath();

                    ctx.fillStyle = startColor;
                    ctx.strokeStyle = this.strokeColor;
                    ctx.lineWidth = 1;

                    if (this.indicator == 'range') {
                        if (this.geometry == 'horizontal') {
                            leftX = this.leftX = this.startPoint;
                            leftY = this.leftY = this.base - (this.width / 2) + this.offset * (-1);
                            rightX = this.rightX = this.startPoint + ((this.value - this.startValue) * this.scaleValue);
                            rightY = this.rightY = this.base + (this.width / 2) + this.offset * (-1);
                            //	tooltips position
                            this.x = rightX;
                            this.y = this.base - this.offset;
                        } else {
                            leftX = this.leftX = this.base - (this.width / 2) + this.offset;
                            leftY = this.leftY = this.startPoint;
                            rightX = this.rightX = this.base + (this.width / 2) + this.offset;
                            rightY = this.rightY = this.startPoint - ((this.value - this.startValue) * this.scaleValue);
                            //	tooltips position
                            this.x = this.base + this.offset;
                            this.y = rightY;
                        }


                        ctx.moveTo(leftX, leftY);
                        ctx.lineTo(rightX, leftY);
                        ctx.lineTo(rightX, rightY);
                        ctx.lineTo(leftX, rightY);

                    }
                    if (this.indicator == 'point') {
                        if (this.shape == 'circle') {
                            if (this.geometry == 'horizontal') {
                                var x = this.x = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y = this.y = this.base - (this.height / 2) + this.offset * (-1),
                                    r = this.width / 2,
                                    sAngle = 0,
                                    eAngle = helpers.radians(360),
                                    counterclockwise = false;
                            } else {
                                var y = this.y = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x = this.x = this.base + (this.width / 2) + this.offset,
                                    r = this.width / 2,
                                    sAngle = 0,
                                    eAngle = helpers.radians(360),
                                    counterclockwise = false;
                            }
                            this.leftX = x - this.height / 2;
                            this.rightX = x + this.height / 2;
                            this.leftY = y - this.height / 2;
                            this.rightY = y + this.height / 2;
                            ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
                        }
                        if (this.shape == 'rect') {
                            if (this.geometry == 'horizontal') {
                                var x = this.leftX = this.startPoint + ((this.value - this.startValue) * this.scaleValue) - this.width / 2,
                                    y = this.leftY = this.base - this.width + this.offset * (-1),
                                    width = this.width,
                                    height = this.height;
                            } else {
                                var y = this.leftY = this.startPoint - ((this.value - this.startValue) * this.scaleValue) - this.height / 2,
                                    x = this.leftX = this.base + this.offset,
                                    width = this.width,
                                    height = this.height;
                            }
                            this.x = x + this.width / 2;
                            this.y = y + this.height / 2;
                            this.rightX = this.leftX + this.width;
                            this.rightY = this.leftY + this.height;
                            ctx.rect(x, y, width, height);
                        }
                        if (this.shape == 'triangle') {
                            if (this.geometry == 'horizontal') {
                                var x1 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y1 = this.base + this.offset * (-1),
                                    x2 = this.leftX = x1 - this.width / 2,
                                    y2 = this.leftY = y1 - this.height,
                                    x3 = x2 + this.width,
                                    y3 = y2;
                            } else {
                                var y1 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x1 = this.leftX = this.base + this.offset,
                                    x2 = x1 + this.width,
                                    y2 = this.leftY = y1 - this.height / 2,
                                    x3 = x2,
                                    y3 = y2 + this.height;
                            }

                            this.x = this.leftX + this.width / 2;
                            this.y = this.leftY + this.height / 2;
                            this.rightX = this.leftX + this.width;
                            this.rightY = this.leftY + this.height;

                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                        }
                        if (this.shape == 'inverted-triangle') {
                            if (this.geometry == 'horizontal') {
                                var x1 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y1 = this.leftY = this.base + this.offset * (-1) - this.height,
                                    x2 = this.leftX = x1 - this.width / 2,
                                    y2 = y1 + this.height,
                                    x3 = x2 + this.width,
                                    y3 = y2;
                            } else {
                                var y1 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x1 = this.base + this.offset + this.width,
                                    x2 = this.leftX = x1 - this.width,
                                    y2 = this.leftY = y1 - this.height / 2,
                                    x3 = x2,
                                    y3 = y2 + this.height;
                            }

                            this.x = this.leftX + this.width / 2;
                            this.y = this.leftY + this.height / 2;
                            this.rightX = this.leftX + this.width;
                            this.rightY = this.leftY + this.height;

                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                        }
                        if (this.shape == 'bowtie') {
                            if (this.geometry == 'horizontal') {
                                var local_height = this.height / 2;
                                var local_width = this.width;
                                var local_base = this.base - local_height;
                                var x1 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y1 = this.leftY = local_base + this.offset * (-1) + local_height,
                                    x2 = this.leftX = x1 - local_width / 2,
                                    y2 = y1 + local_height,
                                    x3 = x2 + local_width,
                                    y3 = y2;

                                var x11 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y11 = this.base + this.offset * (-1),
                                    x21 = x11 - local_width / 2,
                                    y21 = y11 - local_height,
                                    x31 = x21 + local_width,
                                    y31 = y21;
                            } else {
                                var local_width = this.width / 2;
                                var local_base = this.base - local_width;

                                var y1 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x1 = local_base + this.offset + local_width,
                                    x2 = this.leftX = x1 - local_width,
                                    y2 = this.leftY = y1 - this.height / 2,
                                    x3 = x2,
                                    y3 = y2 + this.height;

                                var y11 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x11 = this.base + this.offset,
                                    x21 = x11 + local_width,
                                    y21 = y11 - this.height / 2,
                                    x31 = x21,
                                    y31 = y21 + this.height;
                            }

                            this.x = this.leftX + this.width / 2;
                            this.y = this.leftY + this.height / 2;
                            this.rightX = this.leftX + this.width;
                            this.rightY = this.leftY + this.height;

                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                            ctx.lineTo(x11, y11);
                            ctx.lineTo(x21, y21);
                            ctx.lineTo(x31, y31);
                        }
                        if (this.shape == 'diamond') {
                            if (this.geometry == 'horizontal') {
                                var local_height = this.height / 2;
                                var local_width = this.width;
                                var local_base = this.base - local_height;
                                var x1 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y1 = this.leftY = local_base + this.offset * (-1),
                                    x2 = this.leftX = x1 - local_width / 2,
                                    y2 = y1 + local_height,
                                    x3 = x2 + local_width,
                                    y3 = y2;

                                var x11 = this.startPoint + ((this.value - this.startValue) * this.scaleValue),
                                    y11 = this.base + this.offset * (-1) + local_height,
                                    x21 = x11 - local_width / 2,
                                    y21 = y11 - local_height,
                                    x31 = x21 + local_width,
                                    y31 = y21;
                            } else {
                                var local_width = this.width / 2;
                                var local_base = this.base - local_width;

                                var y1 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x1 = this.base + this.offset + local_width,
                                    x2 = x1 - local_width,
                                    y2 = this.leftY = y1 - this.height / 2,
                                    x3 = x2,
                                    y3 = y2 + this.height;

                                var y11 = this.startPoint - ((this.value - this.startValue) * this.scaleValue),
                                    x11 = this.leftX = local_base + this.offset,
                                    x21 = x11 + local_width,
                                    y21 = y11 - this.height / 2,
                                    x31 = x21,
                                    y31 = y21 + this.height;
                            }

                            this.x = this.leftX + this.width / 2;
                            this.y = this.leftY + this.height / 2;
                            this.rightX = this.leftX + this.width;
                            this.rightY = this.leftY + this.height;

                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                            ctx.lineTo(x11, y11);
                            ctx.lineTo(x21, y21);
                            ctx.lineTo(x31, y31);
                        }
                    }

                    ctx.fill();
                },
                inRange: function(chartX, chartY) {
                    if (this.geometry == 'horizontal') {
                        return ((chartX >= this.leftX && chartX <= this.rightX) || (chartX >= this.rightX && chartX <= this.leftX)) &&
                            (chartY <= this.rightY && chartY >= this.leftY);
                    } else {
                        return (chartX >= this.leftX && chartX <= this.rightX) && ((chartY >= this.rightY && chartY <= this.leftY) ||
                            (chartY >= this.leftY && chartY <= this.rightY));
                    }
                }
            });


            this.startPoint = options.range.startValue > 0 ? options.range.startValue : 0;
            this.startPoint = options.range.endValue <= 0 ? options.range.startValue : this.startPoint;
            this.startValue = this.startPoint;

            this.scaleValue = 0;
            this.base = 0;
            if (options.geometry == 'horizontal') {
                this.scaleValue = (this.chart.width - (this.padding.left + this.padding.right)) / (options.range.endValue - options.range.startValue);
                this.startPoint = this.padding.left + (Math.abs(options.range.startValue * this.scaleValue) - (Math.abs(this.startPoint) * this.scaleValue));
                this.base = this.chart.height / 2;
            } else {
                this.scaleValue = (this.chart.height - (this.padding.top + this.padding.bottom)) / (options.range.endValue - options.range.startValue);
                this.startPoint = this.chart.height - (this.padding.bottom +
                    (Math.abs(options.range.startValue * this.scaleValue) - (Math.abs(this.startPoint) * this.scaleValue)));
                this.base = this.chart.width / 2;
            }

            this.datasets = [];

            //Iterate through each of the datasets, and build this into a property of the chart
            if (typeof(data) !== 'undefined' && data !== null && data.length > 0) {
                helpers.each(data, function(dataset, datasetIndex) {

                    this.addData(dataset);

                }, this);
            }

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

                    helpers.each(this.datasets, function(data) {
                        data.bar.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activeBars, function(activeBar) {
                        activeBar.fillColor = activeBar.highlightFill;
                        activeBar.strokeColor = activeBar.highlightStroke;
                    });
                    //this.update();
                    this.showTooltip(activeBars);
                });
            }

            this.buildScale();
            this.render();
        },
        getBarsAtEvent: function(e) {
            var barsArray = [],
                eventPosition = helpers.getRelativePosition(e),
                barIndex;

            for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
                if (this.datasets[datasetIndex].bar.inRange(eventPosition.x, eventPosition.y)) {
                    barsArray.push(this.datasets[datasetIndex].bar);
                }
            }

            return barsArray;
        },
        buildScale: function() {

            var o = this.options;

            //	Major ticks defaults
            var majorTicks = {
                interval: o.majorTicks.interval || 0,
                customValues: o.majorTicks.customValues || [],
                width: o.majorTicks.width || 6,
                height: o.majorTicks.height || 0.5,
                offset: o.majorTicks.offset || 0,
                color: o.majorTicks.color || '#fff'
            }

            //	Minor ticks defaults
            var minorTicks = {
                interval: o.minorTicks.interval || 0,
                customValues: o.minorTicks.customValues || [],
                width: o.minorTicks.width || 6,
                height: o.minorTicks.height || 0.5,
                offset: o.minorTicks.offset || 0,
                color: o.minorTicks.color || '#fff'
            }

            //	Tick labels defaults
            var tickLabels = {
                units: o.tickLabels.units || '',
                interval: o.tickLabels.interval || 0,
                customValues: o.tickLabels.customValues || [],
                offset: o.tickLabels.offset || -9,
                color: o.tickLabels.color || '#777b80'
            }

            var scaleOptions = {
                templateString: o.scaleLabel,
                height: this.chart.height,
                width: this.chart.width,
                ctx: this.chart.ctx,
                textColor: o.scaleFontColor,
                fontSize: o.scaleFontSize,
                fontStyle: o.scaleFontStyle,
                fontFamily: o.scaleFontFamily,
                integersOnly: o.scaleIntegersOnly,
                font: helpers.fontString(o.scaleFontSize, o.scaleFontStyle, o.scaleFontFamily),
                padding: this.padding,
                showLabels: o.scaleShowLabels,
                display: o.showScale,
                axisWidth: o.axisWidth,
                axisColor: o.axisColor,
                geometry: o.geometry,
                majorTicks: majorTicks,
                minorTicks: minorTicks,
                tickLabels: tickLabels,
                range: o.range,
                scaleColorRanges: o.scaleColorRanges || []
            }
            this.scale = new Chart.LinearScale(scaleOptions);
        },
        update: function() {
            var options = this.options;
            this.startPoint = options.range.startValue > 0 ? options.range.startValue : 0;
            this.startPoint = options.range.endValue <= 0 ? options.range.startValue : this.startPoint;
            this.startValue = this.startPoint;

            this.scaleValue = 0;
            this.base = 0;
            if (options.geometry == 'horizontal') {
                this.scaleValue = (this.chart.width - (this.padding.left + this.padding.right)) / (options.range.endValue - options.range.startValue);
                this.startPoint = this.padding.left + (Math.abs(options.range.startValue * this.scaleValue) - (Math.abs(this.startPoint) * this.scaleValue));
                this.base = this.chart.height / 2;
            } else {
                this.scaleValue = (this.chart.height - (this.padding.top + this.padding.bottom)) / (options.range.endValue - options.range.startValue);
                this.startPoint = this.chart.height - (this.padding.bottom +
                    (Math.abs(options.range.startValue * this.scaleValue) - (Math.abs(this.startPoint) * this.scaleValue)));
                this.base = this.chart.width / 2;
            }

            this.scale.update();

            var newBarProps = helpers.extend({
                base: this.base,
                scaleValue: this.scaleValue,
                startPoint: this.startPoint
            });

            helpers.each(this.datasets, function(d) {
                d.bar.update(newBarProps);
            });

            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore(['fillColor', 'strokeColor']);
            });

            helpers.each(this.datasets, function(d, datasetIndex) {
                d.bar.save();
            }, this);
            this.render();
        },
        addData: function(dataset) {
            var options = this.options;
            var imbuffer = new Image();
            if (typeof(dataset.img) !== 'undefined')
                imbuffer.src = dataset.img;

            var label = dataset.label || null,
                fillColor = dataset.color || options.dataset.color,
                strokeColor = dataset.color || options.dataset.color,
                highlightFill = dataset.highlightFill || options.dataset.color,
                highlightStroke = dataset.highlightStroke || options.dataset.color,
                indicator = dataset.indicator || options.dataset.indicator,
                shape = dataset.shape || options.dataset.shape,
                width = typeof(dataset.width) !== 'undefined' ? dataset.width : options.dataset.width,
                height = typeof(dataset.height) !== 'undefined' ? dataset.height : options.dataset.height,
                offset = typeof(dataset.offset) !== 'undefined' ? dataset.offset : options.dataset.offset,
                colorRanges = dataset.colorRanges || [],
                tooltipRanges = dataset.tooltipRanges || [],
                img = typeof(dataset.img) !== 'undefined' ? imbuffer : null;

            var datasetObject = {
                bar: new this.RangeClass({
                    label: label,
                    fillColor: fillColor,
                    strokeColor: strokeColor,
                    highlightFill: highlightFill,
                    highlightStroke: highlightStroke,
                    value: this.startValue,
                    startValue: this.startValue,
                    indicator: indicator,
                    shape: shape,
                    width: width,
                    height: height,
                    offset: offset,
                    colorRanges: colorRanges,
                    tooltipRanges: tooltipRanges,
                    img: img,
                    startPoint: this.startPoint,
                    scaleValue: this.scaleValue,
                    geometry: options.geometry,
                    axisRange: options.range,
                    base: this.base,
                    units: options.tickLabels.units || ''
                }),
                value: dataset.value
            }

            this.datasets.push(datasetObject);
        },
        removeData: function() {
            this.datasets.shift();
            this.update();
        },
        draw: function(ease) {
            var self = this;
            var easingDecimal = ease || 1;
            this.clear();

            var ctx = this.chart.ctx;

            this.scale.draw(easingDecimal);

            if (this.datasets.length > 0) {
                helpers.each(this.datasets, function(data, datasetIndex) {

                    data.bar.transition({
                        value: data.value
                    }, easingDecimal).draw();

                }, this);
            }
        },
        reflow: function() {
            var newScaleProps = helpers.extend({
                height: this.chart.height,
                width: this.chart.width
            });
            this.scale.update(newScaleProps);
            this.update();
        },
        showTooltip: function(ChartElements, forceRedraw) {

            //	Overload original function

            //	Tooltip ranges implementation function
            function rangeTooltip(templFunc, element) {
                var tooltip = '';
                var tooltipSet = false;
                if (typeof(element.tooltipRanges) == 'object' && element.tooltipRanges.length && element.tooltipRanges.length > 0) {
                    for (var i = 0; i < element.tooltipRanges.length; i++) {
                        var r = element.tooltipRanges[i];
                        if (element.value >= r.startpoint && element.value < r.breakpoint) {
                            tooltip = r.tooltip;
                            tooltipSet = true;
                            break;
                        }
                    }
                }
                if (!tooltipSet) {
                    tooltip = helpers.template(templFunc, element) + element.units;
                }
                return tooltip;
            }

            // Only redraw the chart if we've actually changed what we're hovering on.
            if (typeof this.activeElements === 'undefined') this.activeElements = [];

            var isChanged = (function(Elements) {
                var changed = false;

                if (Elements.length !== this.activeElements.length) {
                    changed = true;
                    return changed;
                }

                helpers.each(Elements, function(element, index) {
                    if (element !== this.activeElements[index]) {
                        changed = true;
                    }
                }, this);
                return changed;
            }).call(this, ChartElements);

            if (!isChanged && !forceRedraw) {
                return;
            } else {
                this.activeElements = ChartElements;
            }
            this.draw();

            if (this.options.customTooltips) {
                this.options.customTooltips(false);
            }
            if (ChartElements.length > 0) {
                // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
                if (this.datasets && ChartElements.length > 1) {
                    var dataArray,
                        dataIndex;

                    var tooltipLabels = [],
                        tooltipColors = [],
                        medianPosition = (function() {

                            // Get all the points at that particular index
                            var Elements = [],
                                dataCollection,
                                xPositions = [],
                                yPositions = [],
                                xMax,
                                yMax,
                                xMin,
                                yMin;

                            helpers.each(ChartElements, function(chartElement) {
                                if (chartElement.hasValue()) {
                                    Elements.push(chartElement);
                                }
                            }, this);

                            helpers.each(Elements, function(element) {
                                xPositions.push(element.x);
                                yPositions.push(element.y);


                                //Include any colour information about the element
                                tooltipLabels.push(rangeTooltip(this.options.multiTooltipTemplate, element));
                                tooltipColors.push({
                                    fill: element._saved.fillColor || element.fillColor,
                                    stroke: element._saved.strokeColor || element.strokeColor
                                });

                            }, this);

                            yMin = helpers.min(yPositions);
                            yMax = helpers.max(yPositions);

                            xMin = helpers.min(xPositions);
                            xMax = helpers.max(xPositions);

                            return {
                                x: (xMin > this.chart.width / 2) ? xMin : xMax,
                                y: (yMin + yMax) / 2
                            };
                        }).call(this);

                    new Chart.MultiTooltip({
                        x: medianPosition.x,
                        y: medianPosition.y,
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        xOffset: this.options.tooltipXOffset,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        titleTextColor: this.options.tooltipTitleFontColor,
                        titleFontFamily: this.options.tooltipTitleFontFamily,
                        titleFontStyle: this.options.tooltipTitleFontStyle,
                        titleFontSize: this.options.tooltipTitleFontSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        labels: tooltipLabels,
                        legendColors: tooltipColors,
                        legendColorBackground: this.options.multiTooltipKeyBackground,
                        title: this.options.multiTooltipTitles,
                        chart: this.chart,
                        ctx: this.chart.ctx,
                        custom: this.options.customTooltips
                    }).draw();

                } else {
                    helpers.each(ChartElements, function(Element) {
                        var tooltipPosition = Element.tooltipPosition();
                        new Chart.Tooltip({
                            x: Math.round(tooltipPosition.x),
                            y: Math.round(tooltipPosition.y),
                            xPadding: this.options.tooltipXPadding,
                            yPadding: this.options.tooltipYPadding,
                            fillColor: this.options.tooltipFillColor,
                            textColor: this.options.tooltipFontColor,
                            fontFamily: this.options.tooltipFontFamily,
                            fontStyle: this.options.tooltipFontStyle,
                            fontSize: this.options.tooltipFontSize,
                            caretHeight: this.options.tooltipCaretSize,
                            cornerRadius: this.options.tooltipCornerRadius,
                            text: rangeTooltip(this.options.tooltipTemplate, Element),
                            chart: this.chart,
                            custom: this.options.customTooltips
                        }).draw();
                    }, this);
                }
            }
            return this;
        }
    });


}).call(this);
