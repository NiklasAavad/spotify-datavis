import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type DataPoint = {
	chart_rank: number;
	danceability: number;
	region: string;
}

type ScatterPlotProps = {
	data: DataPoint[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
	const svgRef = useRef();
	const legendRef = useRef();

	useEffect(() => {
		const margin = { top: 10, right: 30, bottom: 30, left: 60 };
		const width = 460 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3.select(svgRef.current)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		const x = d3.scaleLinear()
			.domain([200, 1])
			.range([0, width]);

		const y = d3.scaleLinear()
			.domain([0, 1])
			.range([height, 0]);

		// Create a color scale for different regions
		const color = d3.scaleOrdinal()
			.domain(data.map(d => d.region))
			.range(d3.schemeCategory10);

		// Add X and Y axes
		svg.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x));

		svg.append('g')
			.call(d3.axisLeft(y));

		// Add scatter plot points
		svg.selectAll('dot')
			.data(data)
			.enter()
			.append('circle')
			.attr('cx', d => x(d.chart_rank))
			.attr('cy', d => y(d.danceability))
			.attr('r', 4) // radius of each point
			.attr('opacity', 0.7)
			.style('fill', d => color(d.region));

		// TODO det her vil formenligt blive byttet ud med selectedCountries
		const uniqueRegions = [...new Set(data.map(d => d.region))];
		const sortedUniqueRegions = uniqueRegions.sort((a, b) => a.localeCompare(b));
		console.log("sortedUniqueRegions", sortedUniqueRegions)

		// Add legend
		d3.select(legendRef.current)
			.selectAll('legend')
			.data(sortedUniqueRegions)
			.enter()
			.append('div')
			.attr('class', 'legend')
			.style('color', d => color(d))
			.text(d => d);
	}, [data]);

	return <>
		<div ref={svgRef}></div>;
		<div ref={legendRef}></div>;
	</>
}
