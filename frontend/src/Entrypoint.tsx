import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { useQuery } from 'react-query';
import { QueryType, useQueryFunction } from './hooks/useQueryFunction';
import { DateChanger, Dates } from './components/DateChanger';
import { Attribute, AttributeParameterChanger, AttributeParams } from './components/AttributeParameterChanger';
import { ScoreParameterChanger, ScoreParams } from './components/ScoreParameterChanger';
import axios from 'axios';
import { ScatterPlotContainer } from './components/ScatterPlotContainer';
import { BrushProvider } from './context/BrushContext';
import { BarChart } from './components/BarChart';
import { HistogramContainer } from './components/HistogramContainer';
import { Interval } from './components/ScatterPlot';

// TODO consider moving the shuffling to the backend, so we cache the results, and the removal of one region will not change the order of the results
const shuffleArray = (array: unknown[]) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// Swap array[i] and array[j]
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const baseScore: ScoreParams = {
	dance_lower_bound: 0,
	dance_upper_bound: 1,
	energy_lower_bound: 0,
	energy_upper_bound: 1,
	valence_lower_bound: 0,
	valence_upper_bound: 1,
	acousticness_lower_bound: 0,
	acousticness_upper_bound: 1,
	instrumentalness_lower_bound: 0,
	instrumentalness_upper_bound: 1,
	liveness_lower_bound: 0,
	liveness_upper_bound: 1,
	speechiness_lower_bound: 0,
	speechiness_upper_bound: 1,
}

const getScoreParam = (key: Attribute, value: [number, number]) => {
	switch (key) {
		case Attribute.Danceability:
			return {
				dance_lower_bound: value[0],
				dance_upper_bound: value[1],
			}
		case Attribute.Energy:
			return {
				energy_lower_bound: value[0],
				energy_upper_bound: value[1],
			}
		case Attribute.Valence:
			return {
				valence_lower_bound: value[0],
				valence_upper_bound: value[1],
			}
		case Attribute.Acousticness:
			return {
				acousticness_lower_bound: value[0],
				acousticness_upper_bound: value[1],
			}
		case Attribute.Instrumentalness:
			return {
				instrumentalness_lower_bound: value[0],
				instrumentalness_upper_bound: value[1],
			}
		case Attribute.Liveness:
			return {
				liveness_lower_bound: value[0],
				liveness_upper_bound: value[1],
			}
		case Attribute.Speechiness:
			return {
				speechiness_lower_bound: value[0],
				speechiness_upper_bound: value[1],
			}
	}
}

const getNewScoreParams = (brushedInterval: Interval[]) => {
	let newParams = {}
	for (const interval of brushedInterval) {
		newParams = {
			...newParams,
			...getScoreParam(interval.key, interval.value),
		}
	}
	return newParams;
}

const getMetrics = async (dates: Dates, selectedCountries: string[]) => {
	const preparedCountries: string = selectedCountries.join(',');
	const response = await axios.get("http://localhost:5000/api/metrics", {
		params: {
			countries: preparedCountries,
			...dates,
		}
	});
	const data = response.data
	shuffleArray(data)
	return data;
}

export type ColorScale = d3.ScaleQuantize<string, string>;

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);

	const [selectedCountries, setSelectedCountries] = useState<string[]>([])

	const [dates, setDates] = useState<Dates>({
		fromDate: new Date('2017-01-07'),
		toDate: new Date('2017-01-07'),
	})

	const [brushedInterval, setBrushedInterval] = useState<Interval[]>(undefined)

	const [currentAttributeParams, setCurrentAttributeParams] = useState<AttributeParams>({ attribute: Attribute.Danceability });
	const [currentScoreParams, setCurrentScoreParams] = useState<ScoreParams>(baseScore);
	const currentParams = queryType === QueryType.Attribute ? currentAttributeParams : currentScoreParams;

	const queryFunction = useQueryFunction(queryType);
	const { data, isLoading } = useQuery([queryType, currentParams, dates], () => queryFunction(currentParams, dates));

	const { data: metrics, isLoading: loadingMetrics } = useQuery(["metric", selectedCountries, dates], () => getMetrics(dates, selectedCountries));

	const startColor = '#1f78b4'; // Blue
	const endColor = '#ff7f00';   // Orange
	const intervals = 10; // Adjust the number of intervals as needed

	const colorScale: ColorScale = d3
		.scaleQuantize<string>()
		.domain([0, 1])
		.range(d3.quantize(t => d3.interpolateBlues(t), intervals))
		.unknown('grey');

	/* const startColor = 'purple' */
	/* const endColor = 'yellow' */
	/* const cubehelixScale = d3 */
	/* 	.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor)) */
	/* 	.domain([0, 1]) */
	/* 	.unknown('grey') */

	const onChangeQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newQueryType = event.target.value as QueryType;
		setQueryType(newQueryType);
	}

	useEffect(() => {
		if (!brushedInterval) {
			setQueryType(QueryType.Attribute);
		} else {
			const newParams = getNewScoreParams(brushedInterval);
			setQueryType(QueryType.Score);
			setCurrentScoreParams({
				...baseScore,
				...newParams,
			})
		}

	}, [brushedInterval])

	const selectedMetrics = [Attribute.Danceability, Attribute.Liveness, Attribute.Speechiness]

	return (
		<>
			<ColorLegend colorScale={colorScale} width={500} height={50} />
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<div>
					<MapContainer
						data={data}
						isLoading={isLoading}
						colorScale={colorScale}
						selectedCountries={selectedCountries}
						setSelectedCountries={setSelectedCountries}
					/>
					<BarChart
						data={data}
						selectedCountries={selectedCountries}
						setSelectedCountries={setSelectedCountries}
						colorScale={colorScale}
					/>
				</div>
				<div>
					<BrushProvider>
						{
							selectedMetrics.map((metric1) => (
								<div style={{ display: 'flex', flexDirection: 'row' }}>
									{
										selectedMetrics.map((metric2) => (
											metric1 === metric2 ?
												<HistogramContainer
													data={metrics}
													isLoading={loadingMetrics}
													selectedCountries={selectedCountries}
													selectedMetric={metric1}
													brushedInterval={brushedInterval}
												/>
												:
												<ScatterPlotContainer
													data={metrics}
													isLoading={loadingMetrics}
													selectedCountries={selectedCountries}
													selectedMetric={metric1}
													selectedMetric2={metric2}
													setBrushedInterval={setBrushedInterval}
												/>
										))
									}
								</div>
							))
						}
					</BrushProvider>
				</div>
			</div>
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
