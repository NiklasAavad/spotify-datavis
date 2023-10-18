import axios from 'axios';
import { useQuery, useQueryClient } from 'react-query';
import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useState } from 'react';
import { useFakeAttributeData, useFakeData } from './utility/FakedThings';
import { MapContainer } from './components/MapContainer';

const SCORE = 'score';
const ATTRIBUTE = 'attribute';

const useScore = (params: ScoreParams) => {
	const getScore = async (params: ScoreParams) => {
		console.log("params:", params);
		try {
			const response = await axios.get('http://localhost:5000/api/score', {
				params: params,
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery([SCORE, params], () => getScore(params));
}

// TODO if we use this, we should probably make a Params type which includes the time period or something
const useAttribute = (attribute: Attribute) => {
	const getAttribute = async (attribute: Attribute) => {
		try {
			const response = await axios.get('http://localhost:5000/api/attribute', {
				params: {
					attribute: attribute,
				}
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery([ATTRIBUTE, attribute], () => getAttribute(attribute));
}

enum QueryType {
	Score, Attribute
}

type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

enum Attribute {
	Danceability = 'danceability',
	Energy = 'energy',
	Valence = 'valence',
}


export const Entrypoint = () => {
	const queryClient = useQueryClient();

	/* const [params, setParams] = useState<ScoreParams>({ */
	/* 	lower_bound: 0.0, */
	/* 	upper_bound: 1.0, */
	/* }) */

	const [attribute, setAttribute] = useState<Attribute>(Attribute.Danceability);
	const queryType = QueryType.Attribute;

	const { data, isLoading, isError } = useAttribute(attribute);
	/* const { data, isLoading, isError } = useScore(params); */
	/* const { data, isLoading, isError } = useFakeData(); */
	/* const { data, isLoading, isError } = useFakeAttributeData(); */

	/* const refetchData = () => { */
	/* 	const newParams = { */
	/* 		lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer... */
	/* 		upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0, */
	/* 	} */
	/**/
	/* 	setParams(newParams); */
	/* 	queryClient.invalidateQueries([SCORE, newParams]); */
	/* } */

	const refetchData = () => {
		const newAttribute = (document.getElementById('attribute') as HTMLInputElement).value as Attribute;
		setAttribute(newAttribute);
		queryClient.invalidateQueries([newAttribute]);
	}

	const startColor = 'purple'
	const endColor = 'yellow'

	const getUpperBoundOfDomain = (queryType: QueryType) => {
		switch (queryType) {
			case QueryType.Score:
				return 100;
			case QueryType.Attribute:
				return 1;
		}
	}

	const upperBound = getUpperBoundOfDomain(queryType);

	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, upperBound])
		.unknown('grey')

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} upperBound={upperBound} />
			<MapContainer data={data} isLoading={isLoading} isError={isError} colorScale={cubehelixScale} />
			<div>
				<label htmlFor="danceability-lowerbound">Danceability Lower Bound </label>
				<input type="number" min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<div>
				<label htmlFor="attribute">Attribute </label>
				<select id="attribute">
					<option value={Attribute.Danceability}>Danceability</option>
					<option value={Attribute.Energy}>Energy</option>
					<option value={Attribute.Valence}>Valence</option>
				</select>
			</div>
			<button onClick={refetchData}>Update chart</button>
		</>
	)
}
