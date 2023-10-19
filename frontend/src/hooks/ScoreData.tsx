import { useQuery, useQueryClient } from "react-query";
import { DataProvider, Dates } from "./useData";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

const useScore = (params: ScoreParams, dates: Dates) => {
	const getScore = async () => {
		try {
			const response = await axios.get('http://localhost:5000/api/score', {
				params: {
					...params,
					from_date: dates.fromDate,
					to_date: dates.toDate,
				}
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery(['score', params, dates.fromDate, dates.toDate], getScore); // TODO remember to change 'score' to QueryType.Score
}

export const ScoreData: DataProvider = (dates: Dates) => {
	const queryClient = useQueryClient();
	const [params, setParams] = useState<ScoreParams>({
		lower_bound: 0.0,
		upper_bound: 1.0,
	})
	const queryResult = useScore(params, dates);

	const onChangeParams = () => {
		const newParams = {
			lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer...
			upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0,
		}
		setParams(newParams);
	}

	const refetchData = useCallback((dates: Dates) => {
		queryClient.invalidateQueries(['score', params, dates.fromDate, dates.toDate]);
	}, [params, queryClient])

	useEffect(() => {
		refetchData(dates);
	}, [dates, refetchData])

	const paramComponent = (
		<>
			<div>Metrics:</div>
			<div>
				<label htmlFor="danceability-lowerbound">Danceability Lower Bound </label>
				<input type="number" placeholder="0.0" min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" placeholder="1.0" min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<button onClick={onChangeParams}>Change metrics</button>
		</>
	)

	const dataUpperBound = 100;

	return { queryResult, paramComponent, dataUpperBound }
}
