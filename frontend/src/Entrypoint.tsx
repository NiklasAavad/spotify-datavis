import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
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
import { TimeSeriesContainer } from './components/TimeSeriesContainer';

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

const getTimeSeries = async (selectedCountries: string[], attribute: Attribute) => {
	const preparedCountries: string = selectedCountries.join(',');
	const response = await axios.get("http://localhost:5000/api/timeseries", {
		params: {
			countries: preparedCountries,
			attribute,
		}
	});
	const data = response.data
	return data;
}

export type ColorScale = d3.ScaleSequential<string, string>;

export const Entrypoint = () => {
	const [queryType, setQueryType] = useState<QueryType>(QueryType.Attribute);

	const [selectedCountries, setSelectedCountries] = useState<string[]>([])

	const [dates, setDates] = useState<Dates>({
		fromDate: new Date('2017-01-07'),
		toDate: new Date('2017-01-07'),
	})

	const [domainType, setDomainType] = useState<'full' | 'cropped'>('full');

	const [brushedInterval, setBrushedInterval] = useState<Interval[]>(undefined)

	const [currentAttributeParams, setCurrentAttributeParams] = useState<AttributeParams>({ attribute: Attribute.Danceability });
	const [currentScoreParams, setCurrentScoreParams] = useState<ScoreParams>(baseScore);
	const currentParams = queryType === QueryType.Attribute ? currentAttributeParams : currentScoreParams;

	const queryFunction = useQueryFunction(queryType);
	const { data, isLoading } = useQuery<Record<string, number>>([queryType, currentParams, dates], () => queryFunction(currentParams, dates));

	const { data: metrics, isLoading: loadingMetrics } = useQuery(["metric", selectedCountries, dates], () => getMetrics(dates, selectedCountries));

	const { data: timeSeries, isLoading: loadingTimeSeries } = useQuery(["timeSeries", selectedCountries], () => getTimeSeries(selectedCountries, currentAttributeParams.attribute));

	const [lowerBound, upperBound] = useMemo(() => {
		if (!data || domainType === 'full') {
			return [0, 1]
		}
		return d3.extent(Object.values(data));
	}, [data, domainType])

	const toggleDomainType = () => {
		if (domainType === 'full') {
			setDomainType('cropped');
		} else {
			setDomainType('full');
		}
	}

	/* const intervals = 10; */
	/* const colorScale: ColorScale = d3 */
	/* 	.scaleQuantize<string>() */
	/* 	.domain([lowerBound, upperBound]) */
	/* 	.range(d3.quantize(t => d3.interpolateGreens(t), intervals)) */
	/* 	.unknown('grey'); */

	const leftSideColorScale: ColorScale = d3
		.scaleSequential(t => d3.interpolateBlues(t))
		.domain([lowerBound, upperBound])
		.unknown('grey');

	const rightSideColorScale = useMemo(() => {
		return d3.scaleOrdinal()
			.domain(selectedCountries)
			.range(d3.schemeCategory10)
	}, [selectedCountries]);

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

	const upperHeight = 700;

	const upperRightWidth = 750;

	return (
		<>
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<div>
					<div style={{ display: 'flex' }}>
						<ColorLegend colorScale={leftSideColorScale} width={40} height={upperHeight + 4} lowerBound={lowerBound} upperBound={upperBound} />
						<MapContainer
							data={data}
							isLoading={isLoading}
							colorScale={leftSideColorScale}
							selectedCountries={selectedCountries}
							setSelectedCountries={setSelectedCountries}
							height={upperHeight}
						/>
					</div>
					<BarChart
						data={data}
						selectedCountries={selectedCountries}
						setSelectedCountries={setSelectedCountries}
						leftSideColorScale={leftSideColorScale}
						rightSideColorScale={rightSideColorScale}
					/>
				</div>
				<div style={{ marginLeft: "32px" }}>
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
													totalHeight={upperHeight / 3}
													totalWidth={upperRightWidth / 3}
													colorScale={rightSideColorScale}
												/>
												:
												<ScatterPlotContainer
													data={metrics}
													isLoading={loadingMetrics}
													selectedMetric={metric1}
													selectedMetric2={metric2}
													setBrushedInterval={setBrushedInterval}
													totalHeight={upperHeight / 3}
													totalWidth={upperRightWidth / 3}
													colorScale={rightSideColorScale}
												/>
										))
									}
								</div>
							))
						}
					</BrushProvider>
					<TimeSeriesContainer
						data={timeSeries}
						color={rightSideColorScale}
						isLoading={loadingTimeSeries}
						height={300}
						width={800}
						margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
						domainType={domainType}
					/>
				</div>
			</div>
			<button onClick={toggleDomainType}>Toggle domain (full, cropped)</button>
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
