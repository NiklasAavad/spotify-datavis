import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type DataItem = {
	region: string;
	score: number;
}

type BarChartProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any; // TODO should really try to figure out correct type for this and WorldMap
	selectedCountries: string[];
	setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BarChart: React.FC<BarChartProps> = ({ data, selectedCountries, setSelectedCountries }) => {
	const chartRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!data) {
			return;
		}

		const dataArray = Object.entries(data).map(([region, score]) => ({
			region,
			score
		})) as DataItem[];

		// Specify the chart’s dimensions.
		const width = 640;
		const height = 300;
		const marginTop = 20;
		const marginRight = 20;
		const marginBottom = 80;
		const marginLeft = 40;

		// Declare the x (horizontal position) scale and the corresponding axis generator.
		const x = d3
			.scaleBand()
			.domain(dataArray.map(d => d.region))
			.range([marginLeft, width - marginRight])
			.padding(0.1);

		const xAxis = d3.axisBottom(x).tickSizeOuter(0);

		// Declare the y (vertical position) scale.
		const y = d3
			.scaleLinear()
			.domain([0, 1]) // Change domain here
			.range([height - marginBottom, marginTop]);

		// Create the SVG container.
		const svg = d3
			.select(chartRef.current)
			.attr('viewBox', [0, 0, width, height])

		svg.selectAll("*").remove();

		const bar = svg
			.append('g')
			.attr('fill', 'red')
			.selectAll('rect')
			.data(dataArray)
			.join('rect')
			.style('mix-blend-mode', 'multiply')
			.attr('x', d => x(d.region) || 0)
			.attr('y', d => y(d.score) || 0)
			.attr('height', d => y(0) - y(d.score) || 0)
			.attr('width', x.bandwidth() || 0)
			.attr('cursor', 'pointer')

		bar.on('mouseover', function(_, d) {
			d3.select(this).attr('fill', 'orange'); // Change color to orange

			// Find the corresponding label and change its color
			svg
				.selectAll('text')
				.filter(label => label === d.region)
				.attr('fill', 'orange');
		});

		bar.on('mouseout', function(_, d) {
			d3.select(this).attr('fill', 'red'); // Change color back to red
			svg
				.selectAll('text')
				.filter(label => label === d.region)
				.attr('fill', 'white');
		});

		bar.on('click', function(_, d) {
			console.log("region:", d.region)
			if (selectedCountries.includes(d.region)) {
				setSelectedCountries(selectedCountries.filter(country => country !== d.region))
			} else {
				setSelectedCountries([...selectedCountries, d.region])
			}
		});

		const gx = svg
			.append('g')
			.attr('transform', `translate(0,${height - marginBottom})`)
			.call(xAxis)
			.selectAll('text') // Select the text elements
			.attr('transform', 'rotate(-45)') // Rotate the text
			.attr('x', -5) // Shift the text to the left so the center of the text is aligned with the tick TODO overvej at fjern
			.attr('font-size', '11px')
			.style('text-anchor', 'end'); // Align the text to the end

		const gy = svg
			.append('g')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y))
			.call(g => g.select('.domain').remove());

		// TODO hentet fra https://observablehq.com/@d3/bar-chart-transitions/2?intent=fork
		// Update function
		/* const updateChart = (order: (a: DataItem, b: DataItem) => number) => { */
		/* 	x.domain(data.sort(order).map(d => d.region)); */
		/**/
		/* 	const t = svg.transition().duration(750); */
		/**/
		/* 	bar.data(data, (d: DataItem) => d.region) */
		/* 		.order() */
		/* 		.transition(t) */
		/* 		.delay((d, i) => i * 20) */
		/* 		.attr('x', d => x(d.region) || 0); */
		/**/
		/* 	gx.transition(t) */
		/* 		.call(xAxis) */
		/* 		.selectAll('.tick') */
		/* 		.delay((d, i) => i * 20); */
		/* }; */

		// Assign the update function to the chartRef
		/* chartRef.current!.update = updateChart; */
	}, [data, selectedCountries, setSelectedCountries]);

	return <svg ref={chartRef}></svg>;
};
