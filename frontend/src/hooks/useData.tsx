import { UseBaseQueryResult } from "react-query"
import { ScoreData } from "./ScoreData"
import { AttributeData } from "./AttributeData"

export enum QueryType {
	Score = 'score', 
	Attribute = 'attribute',
}

export type DataHook = (queryType: QueryType) => Data

type Data = {
	queryResult: UseBaseQueryResult
	paramComponent: JSX.Element
	dataUpperBound: number
}

export type DataProvider = () => Data

// TODO maybe include the timeline here? as it should be general
export const useData: DataHook = (queryType: QueryType) => {
	switch (queryType) {
		case QueryType.Score:
			return ScoreData();
		case QueryType.Attribute:
			return AttributeData();
	}
}
