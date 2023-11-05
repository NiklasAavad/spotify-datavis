import axios from "axios";
import { Dates } from "./useData";
import { AttributeParams } from "./AttributeData";
import { ScoreParams } from "./ScoreData";

export enum QueryType {
	Attribute = 'attribute',
	Score = 'score',
}

export type QueryParams = ScoreParams | AttributeParams;

const getQuery = async (queryType: QueryType, params: QueryParams, dates: Dates) => {
	const response = await axios.get(`http://localhost:5000/api/${queryType}`, {
		params: {
			...params,
			...dates,
		}
	});
	return response.data;
}

const getScore = async (params: QueryParams, dates: Dates) => {
	return getQuery(QueryType.Score, params, dates);
};

const getAttribute = async (params: QueryParams, dates: Dates) => {
	const isValidParams = 'attribute' in params;
	if (!isValidParams) {
		throw new Error('Attribute is required');
	}
	return getQuery(QueryType.Attribute, params, dates);
};

export const useQueryFunction = (queryType: QueryType) => {
	switch (queryType) {
		case QueryType.Score: return getScore;
		case QueryType.Attribute: return getAttribute;
		default: throw new Error(`Invalid query type: ${queryType}`);
	}
}
