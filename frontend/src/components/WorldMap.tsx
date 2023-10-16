/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import './WorldMap.css'
import { countries } from '../data/countries.ts'
import { Country } from './Country.tsx';

type WorldMapProps = {
	countryScores: Map<string, number>
	colorScale: d3.ScaleSequential<string>;
}

export const WorldMap: React.FC<WorldMapProps> = (props) => {
	const width = 1200;
	const height = 700;

	const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())

	const svgRef = useRef<SVGSVGElement | null>(null)

	const initTooltip = () => {
		d3.select('body')
			.append('div')
			.attr('id', 'tooltip')
			.attr('style', 'position: absolute; opacity: 0;')
	}

	const projection = d3
		.geoMercator()
		.scale(width / 2 / Math.PI - 40)
		.center([-40, 65])

	const geoPathGenerator = d3.geoPath().projection(projection);

	useEffect(() => {
		initTooltip()

		const svg = d3.select(svgRef.current)

		const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
			const { transform } = event
			svg.selectAll('path').attr('transform', transform as any)
		}

		const zoom = d3
			.zoom()
			.scaleExtent([1, 20])
			.on('zoom', zoomed)

		svg.call(zoom as any)
	}, [])

	const getScore = (countryName: string) => {
		const score = props.countryScores.get(countryName)
		if (score === undefined) {
			return -1
		}
		return score
	}

	const countrySvgPaths = countries.features
		.map(countryFeature => <Country
			countryFeature={countryFeature}
			selectedCountries={selectedCountries}
			setSelectedCountries={setSelectedCountries}
			geoPathGenerator={geoPathGenerator}
			score={getScore(countryFeature.properties?.name)}
			colorScale={props.colorScale} />
		);

	return (
		<>
			<div style={{ height: height, width: width, overflow: 'hidden', border: 'solid' }}>
				<svg ref={svgRef} width={width} height={height}>
					<g>{countrySvgPaths}</g>
				</svg>
			</div>
		</>
	)
}
