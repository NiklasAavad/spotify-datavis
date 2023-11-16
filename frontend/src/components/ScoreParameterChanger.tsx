export type ScoreParams = {
	dance_lower_bound: number,
	dance_upper_bound: number,
	energy_lower_bound: number,
	energy_upper_bound: number,
	valence_lower_bound: number,
	valence_upper_bound: number,
	acousticness_lower_bound: number,
	acousticness_upper_bound: number,
	instrumentalness_lower_bound: number,
	instrumentalness_upper_bound: number,
	liveness_lower_bound: number,
	liveness_upper_bound: number,
	speechiness_lower_bound: number,
	speechiness_upper_bound: number,
}

type ScoreParameterChangerProps = {
	score: ScoreParams
	setParams: React.Dispatch<React.SetStateAction<ScoreParams>>
}

export const ScoreParameterChanger: React.FC<ScoreParameterChangerProps> = (props) => {
	const onChangeParams = () => {
		const newParams = {
			...props.score,
			lower_bound: parseFloat((document.getElementById('danceability-lowerbound') as HTMLInputElement).value) || 0.0, // TODO make this nicer...
			upper_bound: parseFloat((document.getElementById('danceability-upperbound') as HTMLInputElement).value) || 1.0,
		}
		props.setParams(newParams);
	}

	return (
		<>
			<div>Metrics:</div>
			<div>
				<label htmlFor="danceability-lowerbound">Danceability Lower Bound </label>
				<input type="number" defaultValue={props.score.dance_lower_bound} min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" defaultValue={props.score.dance_upper_bound} min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<button onClick={onChangeParams}>Change metrics</button>
		</>
	)
}
