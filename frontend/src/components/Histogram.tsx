import * as d3 from 'd3';
import { DataPoint } from './ScatterPlot';
import { Attribute } from './AttributeParameterChanger';
import { useEffect, useRef } from 'react';

export type HistogramProps = {
	data: DataPoint[];
	selectedCountries: string[];
	selectedMetric: Attribute;
	margin: { top: number, right: number, bottom: number, left: number };
	width: number;
	height: number;
}

export const Histogram: React.FC<HistogramProps> = ({ data, selectedCountries, selectedMetric, margin, width, height }) => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!data) {
			console.log("no data yet, returning...");
			return;
		}

		d3.select(svgRef.current).selectAll("*").remove(); // clear the SVG

		// create the SVG element using the svgRef
		const svg = d3
			.select(svgRef.current)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// X axis: scale and draw
		const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
		svg
			.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(x));

		// set the parameters for the histogram
		const histogram = d3
			.histogram<DataPoint>()
			.value((d) => d[selectedMetric])
			.domain(x.domain())
			.thresholds([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);

		// get the unique regions
		const regions = Array.from(new Set(data.map((d) => d.region)));

		// create a color scale
		const color = d3.scaleOrdinal<string>().domain(regions).range(d3.schemeCategory10);

		// calculate the maximum bin count across all regions
		const maxBinCount = d3.max(
			regions,
			(region) => {
				const dataForRegion = data.filter((d) => d.region === region);
				const bins = histogram(dataForRegion);
				return d3.max(bins, (d) => d.length);
			},
		);

		// Y axis: scale and draw
		const y = d3.scaleLinear().range([height, 0]).domain([0, maxBinCount]);
		svg.append("g").call(d3.axisLeft(y));

		// create a histogram for each region
		selectedCountries.forEach((region, index) => {
			const dataForRegion = data.filter((d) => d.region === region);
			const bins = histogram(dataForRegion);

			// append the bars for this region
			svg
				.selectAll(`.bar-${index}`)
				.data(bins)
				.enter()
				.append("rect")
				.attr("class", `bar bar-${index}`)
				.attr("x", (d) => x(d.x0))
				.attr("y", (d) => y(d.length))
				.attr("width", (d) => (x(d.x1) - x(d.x0)) - 1)
				.attr("height", (d) => height - y(d.length))
				.style("fill", color(region))
				.style("opacity", 0.5);
		});
	}, [data, selectedCountries, selectedMetric]);

	return <svg ref={svgRef}></svg>;
};

