import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

type MapProps = {
	countries: FeatureCollection
}

export const Map = ({ countries }: MapProps) => {
	const width = 1200;
	const height = 700;

	const projection = d3
		.geoMercator()
		.scale(width / 2 / Math.PI - 40)
		.center([-40, 65])

	const geoPathGenerator = d3.geoPath().projection(projection);

	const mouseOver = (data: string) => {
		d3.select('#tooltip')
			.transition()
			.duration(200)
			.style('opacity', 0.9)
			.text(data)
	}

	const mouseLeave = () => {
		d3.select('#tooltip')
			.transition()
			.duration(200)
			.style('opacity', 0)
	}

	const mouseMove = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
		d3.select('#tooltip')
			.style('left', (event.pageX + 10) + 'px')
			.style('top', (event.pageY - 10) + 'px')
	}

	// tooltip creation
	d3.select('body')
		.append('div')
		.attr('id', 'tooltip')
		.attr('style', 'position: absolute; opacity: 0;')


	const allSvgPaths = countries.features
		.filter(shape => shape.properties?.ADMIN !== 'Antarctica')
		.map(shape => {
			return <path
				d={geoPathGenerator(shape)}
				stroke="lightgrey"
				strokeWidth={0.5}
				fill="grey"
				fillOpacity={0.7}
				onMouseOver={() => mouseOver(shape.properties?.ADMIN)}
				onMouseLeave={mouseLeave}
				onMouseMove={mouseMove}
			/>
		})

	return (
		<>
			<svg style={{ border: 'solid' }} width={width} height={height}>
				{allSvgPaths}
			</svg>
		</>
	)
}
