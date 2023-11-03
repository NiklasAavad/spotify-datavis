import { ScoreData, ScoreParams } from "./ScoreData"
import { AttributeData, AttributeParams } from "./AttributeData"
import { useState } from "react"

export enum QueryType {
	Score = 'score',
	Attribute = 'attribute',
}

export type DataHook = (queryType: QueryType) => Data

type Data = {
	paramComponent: JSX.Element
	dataUpperBound: number
	dateComponent: JSX.Element
	params: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

type PartialData = Omit<Data, 'dateComponent' | 'dates'> & {
	params: ScoreParams | AttributeParams
}

export type Dates = {
	fromDate: Date,
	toDate: Date,
}

export type DataProvider = (queryType: QueryType) => PartialData

export const useData: DataHook = (queryType: QueryType) => {
	const [dates, setDates] = useState<Dates>({
		fromDate: new Date('2017-01-01'),
		toDate: new Date('2021-12-31'),
	})

	const getPartialData = () => {
		switch (queryType) {
			case QueryType.Score:
				return ScoreData(queryType);
			case QueryType.Attribute:
				return AttributeData(queryType);
		}
	}

	const partialData = getPartialData();

	const updateDates = () => {
		const newDates = {
			fromDate: new Date((document.getElementById('date-lowerbound') as HTMLInputElement).value),
			toDate: new Date((document.getElementById('date-upperbound') as HTMLInputElement).value),
		}
		setDates(newDates);
	}

	const dateComponent = (
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

	const params = { ...partialData.params, ...dates }

	return { ...partialData, dateComponent, params }
}
