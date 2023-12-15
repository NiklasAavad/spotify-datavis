/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import './WorldMap.css'
import { countries } from '../data/countries.ts'
import { Country } from './Country.tsx';
import { ColorScale } from '../Entrypoint.tsx';
import { secondaryColor } from '../config.ts';

type WorldMapProps = {
	data: any; // should be a dict of country name -> score (percentage), but we do not validate this yet.
	isLoading: boolean;
	colorScale: ColorScale;
	width: number;
	height: number;
	selectedCountries: string[];
	setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
}

export const WorldMap: React.FC<WorldMapProps> = (props) => {
	const [countryScores, setCountryScores] = useState<Map<string, number>>(new Map())

	useEffect(() => {
		if (!props.data) {
			return
		}

		const countryScores = new Map<string, number>(Object.entries(props.data));
		setCountryScores(countryScores)
	}, [props.data])

	const svgRef = useRef<SVGSVGElement | null>(null)

	const initTooltip = () => {
		d3.select('body')
			.append('div')
			.attr('id', 'tooltip')
			.attr('style', 'position: absolute; opacity: 0;')
	}

	const projection = d3
		.geoMercator()
		.scale(props.width / 2 / Math.PI - 40)
		.center([-40, 60])

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
	}, [props.data])

	const getScore = (countryName: string) => {
		return countryScores.get(countryName);
	}

	const countrySvgPaths = countries.features
		.map(countryFeature => <Country
			key={countryFeature.properties?.name}
			countryFeature={countryFeature}
			selectedCountries={props.selectedCountries}
			setSelectedCountries={props.setSelectedCountries}
			geoPathGenerator={geoPathGenerator}
			score={getScore(countryFeature.properties?.name)}
			colorScale={props.colorScale} />
		);

	return (
		<svg ref={svgRef} width={props.width} height={props.height}>
			<defs>
				<pattern id="striped-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
					<path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke={secondaryColor} strokeWidth="0.5" />
				</pattern>
			</defs>
			<g>{countrySvgPaths}</g>
		</svg>
	)
}
