import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ScatterPlot.css';

export type DataPoint = {
	chart_rank: number;
	danceability: number;
	region: string;
}

type ScatterPlotProps = {
	data: DataPoint[];
	selectedCountries: string[];
	margin: { top: number, right: number, bottom: number, left: number };
	width: number;
	height: number;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, selectedCountries, margin, width, height }) => {
	const svgRef = useRef();
	const legendRef = useRef();

	useEffect(() => {
		if (!data) {
			return;
		}

		const totalWidth = width + margin.left + margin.right;
		const totalHeight = height + margin.top + margin.bottom;

		const svg = d3.select(svgRef.current)
			.selectAll('svg')
			.data([null])
			.join('svg')
			.attr('width', totalWidth)
			.attr('height', totalHeight);

		svg.selectAll('*').remove(); // Clear the SVG

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const x = d3.scaleLinear()
			.domain([210, 1])
			.range([0, width]);

		const y = d3.scaleLinear()
			.domain([0, 1])
			.range([height, 0]);

		const color = d3.scaleOrdinal()
			.domain(selectedCountries)
			.range(d3.schemeCategory10);

		g.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x));

		g.append('g')
			.call(d3.axisLeft(y));

		const circles = g.selectAll('dot')
			.data(data)
			.join('circle')
			.attr('cx', d => x(d.chart_rank))
			.attr('cy', d => y(d.danceability))
			.attr('r', 4) // radius of each point
			.attr('opacity', 0.5)
			.style('fill', d => color(d.region) as string);

		// Add brushing functionality
		const brush = d3.brush()
			.extent([[margin.left, margin.top], [width + margin.left, height + margin.top]])
			.on("start", brushstarted)
			.on("brush", brushed)
			.on("end", brushended);

		svg.select('.brush').remove(); // Remove previous brush if any

		svg.append("g")
			.attr("class", "brush")
			.call(brush);

		function brushstarted() {
			circles.classed("hidden", true).style('fill', 'grey')
		}

		function getX(d: DataPoint) {
			return x(d.chart_rank) + margin.left;
		}

		function getY(d: DataPoint) {
			return y(d.danceability) + margin.top;
		}

		function getXY(d: DataPoint) {
			return [getX(d), getY(d)];
		}

		function isBrushed(d: DataPoint, event: d3.D3BrushEvent<SVGRectElement>) {
			const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];
			const [x_, y_] = getXY(d);

			const isWithinX = x0 <= x_ && x_ <= x1;
			const isWithinY = y0 <= y_ && y_ <= y1;

			return isWithinX && isWithinY;
		}

		function isHidden(d: DataPoint, event: d3.D3BrushEvent<SVGRectElement>) {
			return !isBrushed(d, event);
		}

		function getColor(d: DataPoint, event: d3.D3BrushEvent<SVGRectElement>) {
			if (isBrushed(d, event)) {
				return color(d.region) as string;
			}

			return 'grey';
		}

		function brushed(event: d3.D3BrushEvent<SVGRectElement>) {
			if (event.selection) {
				circles
					.classed("hidden", d => isHidden(d, event))
					.style('fill', d => getColor(d, event) as string)
			}
		}

		function brushended(event: d3.D3BrushEvent<SVGRectElement>) {
			if (!event.selection) {
				circles.classed("hidden", false).style('fill', d => color(d.region) as string);
			}
		}

		// TODO the legend should be added once for all scatter plots, not per component
		// TODO also, right now the legend is not visible due to the ScatterPlotContainer being too small for it
		d3.select(legendRef.current)
			.selectAll('*')
			.remove(); // Clear the legend

		d3.select(legendRef.current)
			.selectAll('legend')
			.data(selectedCountries)
			.join('div')
			.attr('class', 'legend')
			.style('color', d => color(d) as string)
			.text(d => d);
	}, [data, height, margin.bottom, margin.left, margin.right, margin.top, selectedCountries, width]);

	return <>
		<div ref={svgRef}></div>
		<div ref={legendRef}></div>
	</>
}
