import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ColorScale } from '../Entrypoint';
import { secondaryColor } from '../config';

type DataItem = {
	region: string;
	score: number;
}

type BarChartProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any; // TODO should really try to figure out correct type for this and WorldMap
	selectedCountries: string[];
	setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
	leftSideColorScale: ColorScale;
	rightSideColorScale: d3.ScaleOrdinal<string, unknown, never>;
	domainType: 'full' | 'cropped';
}

const sortScore = (a: DataItem, b: DataItem) => d3.descending(a?.score, b?.score);
const sortAlphabetically = (a: DataItem, b: DataItem) => d3.ascending(a?.region, b?.region);

const orderMap = {
	"score": sortScore,
	"alphabetically": sortAlphabetically
}

export const BarChart: React.FC<BarChartProps> = ({ data, selectedCountries, setSelectedCountries, leftSideColorScale, rightSideColorScale, domainType }) => {
	const [order, setOrder] = useState<"score" | "alphabetically">("alphabetically");

	const chartRef = useRef<SVGSVGElement>(null);

	const toggleOrder = () => {
		if (order === "alphabetically") {
			setOrder("score");
		} else {
			setOrder("alphabetically");
		}
	};

	useEffect(() => {
		if (!data) {
			return;
		}

		const dataArray = Object.entries(data).map(([region, score]) => ({
			region,
			score
		})) as DataItem[];

		const orderFunction = orderMap[order];
		dataArray.sort(orderFunction);

		// Specify the chart’s dimensions.
		const width = 640;
		const height = 250;
		const marginTop = 20;
		const marginRight = 0;
		const marginBottom = 100;
		const marginLeft = 35;

		// Declare the x (horizontal position) scale and the corresponding axis generator.
		const x = d3
			.scaleBand()
			.domain(dataArray.map(d => d.region))
			.range([marginLeft, width - marginRight])
			.padding(0.1);

		const xAxis = d3.axisBottom(x).tickSizeOuter(0);

		const getYDomain = () => {
			if (domainType === 'full') {
				return [0, 1];
			}
			const max = d3.max(dataArray, d => d.score);
			return [0, max]
		}

		// Declare the y (vertical position) scale.
		const y = d3
			.scaleLinear()
			.domain(getYDomain()) // Change domain here
			.range([height - marginBottom, marginTop]);

		// Create the SVG container.
		const svg = d3
			.select(chartRef.current)
			.attr('viewBox', [0, 0, width, height])

		svg.selectAll("*").remove();

		const getBarColor = (d: DataItem) => {
			const isNoCountriesSelected = selectedCountries.length === 0;
			if (isNoCountriesSelected) {
				return leftSideColorScale(d.score);
			}

			const isNotIncludedInSelectedCountries = selectedCountries.length > 0 && !selectedCountries.includes(d.region)
			if (isNotIncludedInSelectedCountries) {
				return secondaryColor;
			}

			return rightSideColorScale(d.region);
		}

		const getTextColor = (region: string) => {
			const isNotIncludedInSelectedCountries = selectedCountries.length > 0 && !selectedCountries.includes(region)
			if (isNotIncludedInSelectedCountries) {
				return secondaryColor;
			}

			return 'black';
		}

		const getFontWeight = (region: string) => {
			const isNotIncludedInSelectedCountries = selectedCountries.length > 0 && !selectedCountries.includes(region)
			if (isNotIncludedInSelectedCountries) {
				return 'normal';
			}

			return 'bolder';
		}

		const bar = svg
			.append('g')
			.selectAll('rect')
			.data(dataArray)
			.join('rect')
			.style('mix-blend-mode', 'multiply')
			.attr('x', d => x(d.region) || 0)
			.attr('y', d => y(d.score) || 0)
			.attr('height', d => y(0) - y(d.score) || 0)
			.attr('width', x.bandwidth() || 0)
			.attr('cursor', 'pointer')
			.attr('fill', d => getBarColor(d))

		bar.on('mouseover', function(_, d) {
			d3.select(this).attr('fill', 'black'); // Change color to orange

			// Find the corresponding label and change its color
			svg
				.selectAll('text')
				.filter(label => label === d.region)
				.attr('fill', 'black');
		});

		bar.on('mouseout', function(_, d) {
			d3.select(this).attr('fill', getBarColor(d));
			svg
				.selectAll('text')
				.filter(label => label === d.region)
				.attr('fill', getTextColor(d.region));
		});

		bar.on('click', function(_, d) {
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
			.attr('fill', (region: string) => getTextColor(region))
			.attr('style', (region: string) => getFontWeight(region))
			.style('text-anchor', 'end'); // Align the text to the end

		const gy = svg
			.append('g')
			.style('stroke', 'grey')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y))
			.call(g => g.select('.domain').remove());

	}, [data, leftSideColorScale, order, rightSideColorScale, selectedCountries, setSelectedCountries]);

	return <div style={{ position: 'relative' }}>
		<svg ref={chartRef}></svg>
		<button style={{
			position: 'absolute',
			top: -20,
			right: 30,
			zIndex: 1,
			color: '#fff5e1',
			backgroundColor: 'grey'
		}}
			onClick={toggleOrder}>
			Toggle order
		</button>
	</div>
};
