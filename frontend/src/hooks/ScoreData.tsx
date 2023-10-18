import { useQuery, useQueryClient } from "react-query";
import { DataProvider } from "./useData";
import axios from "axios";
import { useState } from "react";

type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

const useScore = (params: ScoreParams) => {
	const getScore = async (params: ScoreParams) => {
		try {
			const response = await axios.get('http://localhost:5000/api/score', {
				params: params,
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery(['score', params], () => getScore(params)); // TODO remember to change 'score' to QueryType.Score
}

export const ScoreData: DataProvider = () => {
	const queryClient = useQueryClient();
	const [params, setParams] = useState<ScoreParams>({
		lower_bound: 0.0,
		upper_bound: 1.0,
	})
	const queryResult = useScore(params);

	const refetchData = () => {
		const newParams = {
			lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer...
			upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0,
		}

		setParams(newParams);
		queryClient.invalidateQueries(['score', newParams]);
	}

	const paramComponent = (
		<>
			<div>
				<label htmlFor="danceability-lowerbound">Danceability Lower Bound </label>
				<input type="number" placeholder="0.0" min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" placeholder="1.0" min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<button onClick={refetchData}>Update chart</button>
		</>
	)

	const dataUpperBound = 100;

	return { queryResult, paramComponent, dataUpperBound }
}
