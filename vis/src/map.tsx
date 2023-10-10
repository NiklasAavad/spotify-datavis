import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';

type MapProps = {
	countries: FeatureCollection
}

export const Map = ({ countries }: MapProps) => {
	const width = 800;
	const height = 800;

	const projection = d3
		.geoMercator()
		.scale(width / 2 / Math.PI - 40)
		.center([10, 35])

	const geoPathGenerator = d3.geoPath().projection(projection);

	const allSvgPaths = countries.features
		.filter(shape => shape.properties?.ADMIN !== 'Antarctica')
		.map(shape => {
			return <path
				d={geoPathGenerator(shape)}
				stroke="lightgrey"
				strokeWidth={0.5}
				fill="grey"
				fillOpacity={0.7}
			/>
		})

	return (
		<>
			<svg width={width} height={height}>
				{allSvgPaths}
			</svg>
		</>
	)
}
