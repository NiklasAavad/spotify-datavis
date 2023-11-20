import * as d3 from 'd3';
import { DataPoint, Interval } from './ScatterPlot';
import { Attribute } from './AttributeParameterChanger';
import { useEffect, useRef } from 'react';

export type HistogramProps = {
	data: DataPoint[];
	selectedCountries: string[];
	selectedMetric: Attribute;
	brushedInterval: Interval[];
	margin: { top: number, right: number, bottom: number, left: number };
	width: number;
	height: number;
	colorScale: d3.ScaleOrdinal<string, unknown, never>;
}

export const Histogram: React.FC<HistogramProps> = ({ data, selectedCountries, selectedMetric, brushedInterval, margin, width, height, colorScale }) => {
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
			.call(d3.axisBottom(x)
				.ticks(10) // Set the number of ticks you want
				.tickFormat((d, i) => i % 2 === 0 ? d.toFixed(1) : "") // Show every other label
				.tickSizeOuter(0) // Optional: remove outer ticks
			)
			.selectAll('text') // Select all text elements of x-axis
			.style('font-size', '13px') // Adjust the font size as needed

		// set the parameters for the histogram
		const histogram = d3
			.histogram<DataPoint>()
			.value((d) => d[selectedMetric])
			.domain(x.domain())
			.thresholds([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);

		// get the unique regions
		const regions = Array.from(new Set(data.map((d) => d.region)));

		const getColor = (region: string, d: d3.Bin<number, number>) => {
			if (!brushedInterval) {
				return colorScale(region);
			}

			const isSelectedMetricBrushed = brushedInterval.some((interval) => interval.key === selectedMetric);
			if (!isSelectedMetricBrushed) {
				return "grey";
			}

			const isOverlappingBrushedInterval = brushedInterval.some((interval) => {
				if (interval.key === selectedMetric) {
					const [start, end] = interval.value;
					const isOutsideBrushedInterval = d.x1 < start || d.x0 > end;
					return !isOutsideBrushedInterval;
				}
				return false;
			});

			if (isOverlappingBrushedInterval) {
				return colorScale(region);
			}

			return "grey";
		}

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
		svg
			.append("g")
			.call(d3.axisLeft(y)
				.tickFormat((d, i) => i % 2 === 0 ? d : "") // Show every other label
				.tickSizeOuter(0) // Optional: remove outer ticks
			)
			.selectAll('text') // Select all text elements of y-axis
			.style('font-size', '13px') // Adjust the font size as needed

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
				.style("fill", (d) => getColor(region, d))
				.style("opacity", 0.5);
		});
	}, [brushedInterval, colorScale, data, height, margin.bottom, margin.left, margin.right, margin.top, selectedCountries, selectedMetric, width]);

	return <svg ref={svgRef}></svg>;
};

