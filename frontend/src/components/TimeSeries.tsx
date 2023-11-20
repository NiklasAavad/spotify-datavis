import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

type DataPoint = {
	avg_danceability: number;
	date: string;
	region: string;
};

type TimeSeriesData = DataPoint[];

export type TimeSeriesProps = {
	data: TimeSeriesData;
	color: d3.ScaleOrdinal<string, unknown, never>;
	height: number;
	width: number;
	margin: { top: number; right: number; bottom: number; left: number; }
	domainType: 'full' | 'cropped';
};

export const TimeSeries: React.FC<TimeSeriesProps> = ({ data, color, height, width, margin, domainType }) => {
	const chartRef = useRef<null | HTMLDivElement>(null);

	useEffect(() => {
		if (!chartRef.current || !data) {
			return;
		}

		// Remove the existing SVG
		d3.select(chartRef.current).selectAll('svg').remove();

		// Append a new SVG
		const svg = d3.select(chartRef.current)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		// Parse the date / time
		const parseTime = d3.timeParse('%Y-%m-%d');

		// Set the ranges
		const x = d3.scaleTime().range([0, width]);
		const y = d3.scaleLinear().range([height, 0]);

		// Define the line
		const valueline = d3.line<DataPoint>()
			.x(d => x(parseTime(d.date)))
			.y(d => y(d.avg_danceability));

		// Scale the range of the data
		x.domain(d3.extent(data, d => parseTime(d.date)));

		const getDomainY = () => {
			if (domainType === 'full') {
				return [0, 1];
			}
			return d3.extent(data, d => d.avg_danceability);
		}

		y.domain(getDomainY());

		const dataByRegion = d3.group(data, d => d.region);

		// Add the valueline paths.
		dataByRegion.forEach((regionData, i) => {
			svg.append('path')
				.data([Array.from(regionData)])
				.attr('fill', 'none')
				.attr('stroke', color(i))
				.attr('stroke-width', 5)
				.attr('d', valueline);
		});

		// Add the X Axis
		svg.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x));

		// Add the Y Axis
		svg.append('g')
			.call(d3.axisLeft(y));
	}, [color, data, domainType, height, margin.bottom, margin.left, margin.right, margin.top, width]);

	return <div ref={chartRef}></div>;
};
