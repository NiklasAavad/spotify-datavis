import { WorldMap } from './components/WorldMap'

import axios from 'axios';

import { useQuery, useQueryClient } from 'react-query';
import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';
import { useState } from 'react';

const SCORE = 'score';

const useScore = (params: QueryParams) => {
	const getScore = async (params: QueryParams) => {
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

type QueryParams = {
	lower_bound: number,
	upper_bound: number,
}

export const Entrypoint = () => {
	const queryClient = useQueryClient();

	const [params, setParams] = useState<QueryParams>({
		lower_bound: 0.0,
		upper_bound: 1.0,
	})

	const { data, isLoading, isError } = useScore(params);
	/* const { data, isLoading, isError } = useFakeData(); */

	const refetchData = () => {
		const newParams = {
			lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer...
			upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0,
		}

		setParams(newParams);
		queryClient.invalidateQueries([SCORE, newParams]);
	}

	const startColor = 'purple'
	const endColor = 'yellow'

	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, 100])
		.unknown('grey')

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} />
			<WorldMap data={data} isLoading={isLoading} isError={isError} colorScale={cubehelixScale} />
			<div>
				<label htmlFor="danceability-lowerbound">Danceability Lower Bound </label>
				<input type="number" min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<button onClick={refetchData}>Update chart</button>
		</>
	)
}
