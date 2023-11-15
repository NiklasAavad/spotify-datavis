import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import './ScatterPlot.css';
import { useBrushContext } from '../context/BrushContext';
import { Attribute } from './AttributeParameterChanger';

export type DataPoint = {
	id: number;
	chart_rank: number;
	region: string;
	// all the following attributes are between 0 and 1, see AttributeParameterChanger
	danceability: number;
	energy: number;
	valence: number;
	acousticness: number;
	instrumentalness: number;
	liveness: number;
	speechiness: number;
}

export type Interval = {
	key: Attribute;
	value: [number, number];
}

export type ScatterPlotProps = {
	data: DataPoint[];
	selectedCountries: string[];
	selectedMetric: Attribute;
	selectedMetric2: Attribute;
	setBrushedInterval: React.Dispatch<React.SetStateAction<Interval[]>>;
	margin: { top: number, right: number, bottom: number, left: number };
	width: number;
	height: number;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, selectedCountries, selectedMetric, selectedMetric2, setBrushedInterval, margin, width, height }) => {
	const svgRef = useRef();
	const legendRef = useRef();
	const { brushedIds, setBrushedIds } = useBrushContext();

	const color = useMemo(() => {
		return d3.scaleOrdinal()
			.domain(selectedCountries)
			.range(d3.schemeCategory10)
	}, [selectedCountries]);

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
			.domain([0, 1])
			.range([0, width]);

		const y = d3.scaleLinear()
			.domain([0, 1])
			.range([height, 0]);

		g.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x));

		g.append('g')
			.call(d3.axisLeft(y));

		g.selectAll('dot')
			.data(data)
			.join('circle')
			.attr('cx', d => x(d[selectedMetric]))
			.attr('cy', d => y(d[selectedMetric2]))
			.attr('r', 4) // radius of each point
			.attr('opacity', 0.5)
			.attr('fill', d => color(d.region) as string);

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
			console.log("not currently doing anything on brushstarted, consider changing")
			/* if (brushedIds?.length === 0) { */
			/* 	circles.classed("hidden", true).style('fill', 'grey') */
			/* } */
		}

		function getX(d: DataPoint) {
			return x(d[selectedMetric]) + margin.left;
		}

		function getY(d: DataPoint) {
			return y(d[selectedMetric2]) + margin.top;
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

		function updateBrushedInterval(event: d3.D3BrushEvent<SVGRectElement>) {
			const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];

			const selectedIntervalX: [number, number] = [
				x.invert(x0 - margin.left),
				x.invert(x1 - margin.left)
			];

			const selectedIntervalY: [number, number] = [
				y.invert(y1 - margin.top),
				y.invert(y0 - margin.top)
			];

			const brushedInvtervals = [
				{ key: selectedMetric2, value: selectedIntervalX }, // TODO dunno why this is inverted, but it works
				{ key: selectedMetric, value: selectedIntervalY }
			]

			setBrushedInterval(brushedInvtervals); // TODO this is heavy, as it seems that rerendering histograms is slow
		}

		function brushed(event: d3.D3BrushEvent<SVGRectElement>) {
			if (event.selection) {
				const brushedIds = data
					.filter(d => isBrushed(d, event))
					.map(d => d.id);

				setBrushedIds(new Set(brushedIds));
			}
		}

		function brushended(event: d3.D3BrushEvent<SVGRectElement>) {
			if (!event.selection) {
				setBrushedIds(undefined);
			} else {
				updateBrushedInterval(event); // TODO could do this on brushed, but this is slow and heavy
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
	}, [color, data, height, margin.bottom, margin.left, margin.right, margin.top, selectedCountries, selectedMetric, selectedMetric2, setBrushedIds, width]);

	useEffect(() => {
		const isHidden = (d: DataPoint) => {
			if (!brushedIds || brushedIds.has(d.id)) {
				return false;
			}
			return true;
		}

		const circles = d3.selectAll('circle') as d3.Selection<SVGCircleElement, DataPoint, HTMLElement, unknown>;
		circles.classed("hidden", isHidden)
	}, [brushedIds]);

	return <>
		<div ref={svgRef}></div>
		<div ref={legendRef}></div>
	</>
}
