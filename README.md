A linear gauge chart type extension for Chart.js originally conceptualized by [A. Scott McCulloch, PhD](http://www.tapintu.com) and coded by [Alexander V.](https://www.elance.com/s/alexj874/)

# Options

All options extend any existing default chart.js settings

```javascript
{
	geometry: 'horizontal', // ('horizontal' or 'vertical') orientation of the chart
	range: { //range of chart
		startValue: 0,
		endValue: 100
	},
	axisColor: '',
	axisWidth: '',
	majorTicks: {
		interval: 100,	// if interval is 0 then ticks do not display
		customValues: [], // array of custom values
		width: 6,
		height: 2,
		offset: 0, // offset from center of the chart
		color: '#fff'
	},
	minorTicks {}, //  see majorTicks above
	tickLabels: { // font style and size you may adjust according chart.js settings
		units: '%', // will displayed after each label and in tooltips
		interval: 100,
		customValues: [],
		offset: -9,
		color: '#777b80'
	},
	scaleColorRanges: [{
			start: -20,
			end: 0,
			color: '#fe5066' // adds color segments to the axis
		}, {
			start: 30,
			end: 50,
			color: '#1224fc'
		}],
	padding: { // padding of chart
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	multiTooltipTitles: 'Total' // titles which will displayed on top of multitooltip popup
}
```

# Dataset properties

All options extend any existing default chart.js settings

```javascript
{
	value: '', // indicator value
	indicator: '' // ('range' | 'point') - indicator type
	shape: '' // ('circle' | 'rect' | 'triangle' | 'inverted-triangle' | 'bowtie' | 'diamond') - shape for point indicator
	width: ''
	height: ''
	offset: ''
	color: ''
	highlightFill: '' // mouse hover change color
	colorRanges: [{ // change color of indicator according to it's value
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
		}],
	tooltipRanges: [{ // change tooltip of indicator according to it's value
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
		}]
	img: '' // custom image for point indicator
	label: '' // shows before value in tooltips
}
