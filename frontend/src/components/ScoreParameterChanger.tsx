export type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

type ScoreParameterChangerProps = {
	score: ScoreParams
	setParams: React.Dispatch<React.SetStateAction<ScoreParams>>
}

export const ScoreParameterChanger: React.FC<ScoreParameterChangerProps> = (props) => {
	const onChangeParams = () => {
		const newParams = {
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
				<input type="number" placeholder="0.0" min="0" max="1" step="0.01" id="danceability-lowerbound" />
			</div>
			<div>
				<label htmlFor="danceability-upperbound">Danceability Upper Bound </label>
				<input type="number" placeholder="1.0" min="0" max="1" step="0.01" id="danceability-upperbound" />
			</div>
			<button onClick={onChangeParams}>Change metrics</button>
		</>
	)
}
