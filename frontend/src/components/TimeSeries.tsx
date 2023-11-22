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

		const dataByDate = new Map();

		data.forEach(d => {
			const date = parseTime(d.date).getTime();
			if (!dataByDate.has(date)) {
				dataByDate.set(date, []);
			}
			dataByDate.get(date).push(d);
		});


		const dataByRegion = d3.group(data, d => d.region);
		const modifiedDataByRegion = new Map();

		dataByRegion.forEach((value, key) => {
			modifiedDataByRegion.set(key, allDates.map(date => {
				const dataPoints = dataByDate.get(date.getTime()) || [];
				const dataPoint = dataPoints.find(d => d.region === key);
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
				.attr('stroke-width', 1)
				.attr('d', valueline);
		});

		modifiedDataByRegion.forEach((regionData, i) => {
			svg.append('path')
				.data([Array.from(regionData)])
				.attr('fill', 'none')
				.attr('stroke', getColor(i))
				.attr('stroke-width', 2)
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

		// Draggable vertical line to select date
		const drag = d3.drag()
			.on('start', dragStarted)
			.on('drag', dragged)
			.on('end', dragEnded);

		let tooltip = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		function dragStarted(event, d) {
			const chartBoundingBox = chartRef.current.getBoundingClientRect();
			tooltip.transition()
				.duration(100)
				.style("opacity", 0.8);

			tooltip.html(formatTime(x.invert(event.x)))
				.style("left", (event.x + chartBoundingBox.left) + "px") // Adjust left position
				.style("top", (chartBoundingBox.top - 8) + "px") // Adjust top position
				.style('position', 'absolute')
			d3.select(this).raise();
		}

		const formatTime = d3.timeFormat("%B %d, %Y");

		function dragged(event, d) {
			const chartBoundingBox = chartRef.current.getBoundingClientRect();

			d3.select(this)
				.attr('x1', event.x)
				.attr('x2', event.x);

			// Update tooltip content and position
			tooltip.html(formatTime(x.invert(event.x)))
				.style("left", (event.x + chartBoundingBox.left) + "px") // Adjust left position
				.style("top", (chartBoundingBox.top - 8) + "px") // Adjust top position
				.style('position', 'absolute')

		}

		function dragEnded(event, d) {
			// Hide tooltip
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		}

		const actualStartDate = new Date('2020-08-30');

		const verticalLine = svg.append('line')
			.attr('x1', x(actualStartDate)) // Assuming startDate is the initial position of the line
			.attr('y1', 0)
			.attr('x2', x(actualStartDate))
			.attr('y2', height)
			.attr('stroke', 'white')
			.attr('cursor', 'pointer')
			.attr('stroke-width', 8)
			.attr('stroke-dasharray', '2, 2')
			.attr('opacity', 0.5)
			.call(drag); // Attach the drag behavior 
	}, [color, data, domainType, height, margin.bottom, margin.left, margin.right, margin.top, queryType, width]);

	return <div ref={chartRef} style={{ position: 'relative' }}></div>;
};
