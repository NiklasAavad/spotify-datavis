import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { useQuery } from 'react-query';
import { QueryType, useQueryFunction } from './hooks/useQueryFunction';
import { DateChanger, Dates } from './components/DateChanger';
import { Attribute, AttributeParameterChanger, AttributeParams } from './components/AttributeParameterChanger';
import { ScoreParameterChanger, ScoreParams } from './components/ScoreParameterChanger';
import { ScatterPlot } from './components/ScatterPlot';
import axios from 'axios';

const getMetrics = async (dates: Dates, selectedCountries: string[]) => {
	const preparedCountries: string = selectedCountries.join(',');
	const response = await axios.get("http://localhost:5000/api/metrics", {
		params: {
			countries: preparedCountries,
			...dates,
		}
	});
	return response.data;
}

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);

	const [selectedCountries, setSelectedCountries] = useState<string[]>([])

	const [dates, setDates] = useState<Dates>({
		fromDate: new Date('2017-01-07'),
		toDate: new Date('2017-01-07'),
	})

	const [currentAttributeParams, setCurrentAttributeParams] = useState<AttributeParams>({ attribute: Attribute.Danceability });
	const [currentScoreParams, setCurrentScoreParams] = useState<ScoreParams>({
		lower_bound: 0.0,
		upper_bound: 1.0,
	});
	const currentParams = queryType === QueryType.Attribute ? currentAttributeParams : currentScoreParams;

	const queryFunction = useQueryFunction(queryType);
	const { data, isLoading } = useQuery([queryType, currentParams, dates], () => queryFunction(currentParams, dates));

	const { data: metrics, isLoading: loadingMetrics } = useQuery(["metric", selectedCountries, dates], () => getMetrics(dates, selectedCountries));

	const startColor = 'purple'
	const endColor = 'yellow'
	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, 1])
		.unknown('grey')

	const onChangeQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newQueryType = event.target.value as QueryType;
		setQueryType(newQueryType);
	}

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} />
			<MapContainer
				data={data}
				isLoading={isLoading}
				colorScale={cubehelixScale}
				selectedCountries={selectedCountries}
				setSelectedCountries={setSelectedCountries}
			/>
			<ScatterPlot data={metrics} isLoading={loadingMetrics} selectedCountries={selectedCountries} />
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
