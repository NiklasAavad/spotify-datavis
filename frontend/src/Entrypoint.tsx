import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { QueryType, useData } from './hooks/useData';
import { useQueryFunction } from './hooks/useOurQuery';
import { useQuery, useQueryClient } from 'react-query';

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);
	const queryClient = useQueryClient();

	const { paramComponent, dataUpperBound, dateComponent, params } = useData(queryType);
	const queryFunction = useQueryFunction(queryType);
	const { data, isLoading } = useQuery([queryType, params], () => queryFunction(params));

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

	useEffect(() => {
		console.log("invalidating queries")
		queryClient.invalidateQueries([queryType, params]);
	}, [params, queryClient, queryType])

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} upperBound={dataUpperBound} />
			<MapContainer data={data} isLoading={isLoading} colorScale={cubehelixScale} />
			<div style={{ margin: '8px' }}>
				{paramComponent}
			</div>
			<div>Query Type:</div>
			<div onChange={onChangeQueryType}>
				<input type="radio" value={QueryType.Attribute} checked={queryType === QueryType.Attribute} /> Attribute
				<input type="radio" value={QueryType.Score} checked={queryType === QueryType.Score} /> Score
			</div>
			<div style={{ margin: '8px' }}>
				{dateComponent}
			</div>
		</>
	)
}
