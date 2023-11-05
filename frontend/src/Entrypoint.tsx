import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { useQuery, useQueryClient } from 'react-query';
import { QueryType, useQueryFunction } from './hooks/useQueryFunction';
import { DateChanger, Dates } from './components/DateChanger';
import { Attribute, AttributeParameterChanger, AttributeParams } from './components/AttributeParameterChanger';
import { ScoreParameterChanger, ScoreParams } from './components/ScoreParameterChanger';

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);

	const [dates, setDates] = useState<Dates>({
		fromDate: new Date('2017-01-01'),
		toDate: new Date('2021-12-31'),
	})

	const [currentAttributeParams, setCurrentAttributeParams] = useState<AttributeParams>({ attribute: Attribute.Danceability });
	const [currentScoreParams, setCurrentScoreParams] = useState<ScoreParams>({
		lower_bound: 0.0,
		upper_bound: 1.0,
	});
	const currentParams = queryType === QueryType.Attribute ? currentAttributeParams : currentScoreParams;

	const queryClient = useQueryClient();
	const queryFunction = useQueryFunction(queryType);
	// The following is the initial query function, which is used to get the initial data. This will contiously be invalidated when parameters change (see the useEffect)
	const { data, isLoading } = useQuery([queryType, currentParams, dates], () => queryFunction(currentParams, dates));

	const startColor = 'purple'
	const endColor = 'yellow'
	const dataUpperBound = queryType === QueryType.Attribute ? 1 : 100;
	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, dataUpperBound])
		.unknown('grey')

	const onChangeQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newQueryType = event.target.value as QueryType;
		setQueryType(newQueryType);
	}

	useEffect(() => {
		queryClient.invalidateQueries([queryType, currentParams, dates]);
	}, [queryClient, queryType, currentParams, dates])

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} upperBound={dataUpperBound} />
			<MapContainer data={data} isLoading={isLoading} colorScale={cubehelixScale} />
			<div style={{ margin: '8px' }}>
				{queryType === QueryType.Attribute ?
					<AttributeParameterChanger attribute={currentAttributeParams.attribute} setParams={setCurrentAttributeParams} /> :
					<ScoreParameterChanger score={currentScoreParams} setParams={setCurrentScoreParams} />
				}
			</div>
			<div>Query Type:</div>
			<div>
				<input type="radio" value={QueryType.Attribute} checked={queryType === QueryType.Attribute} onChange={onChangeQueryType} /> Attribute
				<input type="radio" value={QueryType.Score} checked={queryType === QueryType.Score} onChange={onChangeQueryType} /> Score
			</div>
			<div style={{ margin: '8px' }}>
				<DateChanger setDates={setDates} />
			</div>
		</>
	)
}
