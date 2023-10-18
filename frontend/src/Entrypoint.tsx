import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { QueryType, useData } from './hooks/useData';

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);

	const { queryResult, paramComponent, dataUpperBound } = useData(queryType);
	const { data, isLoading, isError } = queryResult;

	const startColor = 'purple'
	const endColor = 'yellow'

	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, dataUpperBound])
		.unknown('grey')

	const onChangeQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newQueryType = event.target.value as QueryType;
		setQueryType(newQueryType);
	}

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} upperBound={dataUpperBound} />
			<MapContainer data={data} isLoading={isLoading} isError={isError} colorScale={cubehelixScale} />
			<div style={{ margin: '8px' }}>
				{paramComponent}
			</div>
			<div>Query Type:</div>
			<div onChange={onChangeQueryType}>
				<input type="radio" value={QueryType.Attribute} checked={queryType === QueryType.Attribute} /> Attribute
				<input type="radio" value={QueryType.Score} checked={queryType === QueryType.Score} /> Score
			</div>
		</>
	)
}
