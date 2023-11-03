import { DataProvider, QueryType } from "./useData";
import { useEffect, useState } from "react";

export type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

const DATA_UPPER_BOUND = 100;
const INITIAL_SCORE_PARAMS: ScoreParams = {
	lower_bound: 0.0,
	upper_bound: 1.0,
}

export const ScoreData: DataProvider = (queryType: QueryType) => {
	const [params, setParams] = useState<ScoreParams>(INITIAL_SCORE_PARAMS);

	useEffect(() => {
		if (!params) {
			setParams(INITIAL_SCORE_PARAMS)
		}
	}, [queryType, params])

	const onChangeParams = () => {
		const newParams = {
			lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer...
			upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0,
		}
		setParams(newParams);
	}

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

	return { paramComponent, dataUpperBound: DATA_UPPER_BOUND, params }
}
