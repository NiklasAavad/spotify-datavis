import axios from "axios";
import { AttributeParams } from "../components/AttributeParameterChanger";
import { ScoreParams } from "../components/ScoreParameterChanger";

export enum QueryType {
	Attribute = 'attribute',
	Score = 'score',
}

export type QueryParams = ScoreParams | AttributeParams;

const getQuery = async (queryType: QueryType, params: QueryParams, date: Date) => {
	const response = await axios.get(`http://localhost:5000/api/${queryType}`, {
		params: {
			...params,
			date: date,
		}
	});
	return response.data;
}

const getScore = async (params: QueryParams, date: Date) => {
	return getQuery(QueryType.Score, params, date);
};

const getAttribute = async (params: QueryParams, date: Date) => {
	const isValidParams = 'attribute' in params;
	if (!isValidParams) {
		throw new Error('Attribute is required');
	}
	return getQuery(QueryType.Attribute, params, date);
};

export const useQueryFunction = (queryType: QueryType) => {
	switch (queryType) {
		case QueryType.Score: return getScore;
		case QueryType.Attribute: return getAttribute;
		default: throw new Error(`Invalid query type: ${queryType}`);
	}
}
