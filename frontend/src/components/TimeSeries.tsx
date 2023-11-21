import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { QueryType } from '../hooks/useQueryFunction';

type DataPoint = {
	avg: number;
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
	queryType: QueryType;
};

export const TimeSeries: React.FC<TimeSeriesProps> = ({ data, color, height, width, margin, domainType, queryType }) => {
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
			.defined(d => d.avg !== null)
			.x(d => x(parseTime(d.date)))
			.y(d => y(d.avg));

		// Scale the range of the data
		x.domain(d3.extent(data, d => parseTime(d.date)));

		const getDomainY = () => {
			if (domainType === 'full') {
				return [0, 1];
			}
			return d3.extent(data, d => d.avg);
		}

		y.domain(getDomainY());

		const startDate = new Date('2017-01-01')
		const endDate = new Date('2021-12-31')
		const allDates = d3.timeDays(startDate, endDate)

		const dataByRegion = d3.group(data, d => d.region);
		const modifiedDataByRegion = new Map();

		dataByRegion.forEach((value, key) => {
			modifiedDataByRegion.set(key, allDates.map(date => {
				const dataPoint = value.find(d => parseTime(d.date).getTime() === date.getTime());
				return dataPoint ? dataPoint : { date: date.toISOString().slice(0, 10), avg: null, region: key };
			}));
		});

		const getColor = (region: string) => {
			if (queryType === QueryType.Score) {
				return 'grey';
			}
			return color(region);
		}

		console.log("data by region:", dataByRegion)
		console.log("modified data by region:", modifiedDataByRegion)

		// Add the valueline paths. TODO: delete if we want to ampute instead of impute
		dataByRegion.forEach((regionData, i) => {
			svg.append('path')
				.data([Array.from(regionData)])
				.attr('fill', 'none')
				.attr('stroke', 'grey')
				.attr('stroke-width', 1.5)
				.attr('d', valueline);
		});

		modifiedDataByRegion.forEach((regionData, i) => {
			svg.append('path')
				.data([Array.from(regionData)])
				.attr('fill', 'none')
				.attr('stroke', getColor(i))
				.attr('stroke-width', 3)
				.attr('d', valueline);
		});

		// Add the X Axis
		svg.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(x))
			.style('font-size', '14px')

		// Add the Y Axis
		svg.append('g')
			.call(d3.axisLeft(y))
			.style('font-size', '14px')
	}, [color, data, domainType, height, margin.bottom, margin.left, margin.right, margin.top, queryType, width]);

	return <div ref={chartRef}></div>;
};
