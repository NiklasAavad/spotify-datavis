/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import './map.css'
import { countries } from './countries.ts'

export const Map = () => {
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
			.scaleExtent([1, 8])
			.on('zoom', zoomed)

		svg.call(zoom as any)
	}, [geoPathGenerator, projection])

	const handleClick = (country: string) => {
		const newSet = new Set(selectedCountries)
		if (selectedCountries.has(country)) {
			newSet.delete(country)
		} else {
			newSet.add(country)
		}
		setSelectedCountries(newSet)
	}

	const handleMouseOver = (country: string) => {
		d3.select('#tooltip')
			.style('opacity', 0.9)
			.classed('unselectable', true)
			.text(country)
	}

	const handleMouseLeave = () => {
		d3.select('#tooltip')
			.style('opacity', 0)
	}

	const mouseMove = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
		d3.select('#tooltip')
			.style('left', (event.pageX + 10) + 'px')
			.style('top', (event.pageY - 10) + 'px')
	}

	const getFill = (country: string) => {
		if (selectedCountries.has(country)) {
			return 'red'
		} else {
			return 'grey'
		}
	}

	const allSvgPaths = countries.features
		.map(shape => {
			return <path
				d={geoPathGenerator(shape)}
				stroke="lightgrey"
				strokeWidth={0.5}
				fill={getFill(shape.properties?.name)}
				fillOpacity={0.7}
				onClick={() => handleClick(shape.properties?.name)}
				onMouseOver={() => handleMouseOver(shape.properties?.name)}
				onMouseLeave={handleMouseLeave}
				onMouseMove={mouseMove}
			/>
		})

	return (
		<>
			<div style={{ height: height, width: width, overflow: 'hidden', border: 'solid' }}>
				<svg ref={svgRef} width={width} height={height}>
					<g>{allSvgPaths}</g>
				</svg>
			</div>
		</>
	)
}
