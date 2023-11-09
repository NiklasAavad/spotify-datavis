import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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

		const svg = d3.select(svgRef.current)
			.selectAll('svg')
			.data([null])
			.join('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom);

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

		g.selectAll('dot')
			.data(data)
			.join('circle')
			.attr('cx', d => x(d.chart_rank))
			.attr('cy', d => y(d.danceability))
			.attr('r', 4) // radius of each point
			.attr('opacity', 0.5)
			.style('fill', d => color(d.region) as string);

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
