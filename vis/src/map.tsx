import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import { useEffect, useRef, useState } from 'react';

type MapProps = {
	countries: FeatureCollection
}

export const Map = ({ countries }: MapProps) => {
	const width = 1200;
	const height = 700;

	const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())

	const svgRef = useRef<SVGSVGElement | null>(null)

	useEffect(() => {
		const svg = d3.select(svgRef.current)

		const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
			const { transform } = event
			svg.attr('transform', transform)
		}

		const zoom = d3.zoom()
			.scaleExtent([1, 8])
			.on('zoom', zoomed)

		svg.call(zoom)
	}, [])

	const projection = d3
		.geoMercator()
		.scale(width / 2 / Math.PI - 40)
		.center([-40, 65])

	const geoPathGenerator = d3.geoPath().projection(projection);

	// tooltip creation
	d3.select('body')
		.append('div')
		.attr('id', 'tooltip')
		.attr('style', 'position: absolute; opacity: 0;')

	const handleClick = (country: string) => {
		const newSet = new Set(selectedCountries)
		if (selectedCountries.has(country)) {
			newSet.delete(country)
		} else {
			newSet.add(country)
		}
		setSelectedCountries(newSet)
		console.log(newSet)
	}

	const handleMouseOver = (country: string) => {
		d3.select('#tooltip')
			.style('opacity', 0.9)
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
					{allSvgPaths}
				</svg>
			</div>
		</>
	)
}
