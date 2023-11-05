export type Dates = {
	fromDate: Date,
	toDate: Date,
}

type DateChangerProps = {
	setDates: React.Dispatch<React.SetStateAction<Dates>>
}

export const DateChanger: React.FC<DateChangerProps> = (props) => {
	const updateDates = () => {
		const newDates = {
			fromDate: new Date((document.getElementById('date-lowerbound') as HTMLInputElement).value),
			toDate: new Date((document.getElementById('date-upperbound') as HTMLInputElement).value),
		}
		props.setDates(newDates);
	}

	return (
		<>
			<div>Timeline:</div>
			<div>
				<label htmlFor="date-lowerbound">Date Lower Bound </label>
				<input type="date" id="date-lowerbound" />
			</div>
			<div>
				<label htmlFor="date-upperbound">Date Upper Bound </label>
				<input type="date" id="date-upperbound" />
			</div>
			<button onClick={updateDates}>Update chart</button>
		</>
	)
}
