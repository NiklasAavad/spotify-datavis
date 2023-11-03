import { Dates, QueryType } from "./useData";
import axios from "axios";

type ScoreParams = {
	lower_bound: number,
	upper_bound: number,
}

const getScore = async (params: ScoreParams & Dates) => {
	const response = await axios.get('http://localhost:5000/api/score', { params });
	return response.data;
};

enum Attribute {
	Danceability = 'danceability',
	Energy = 'energy',
	Valence = 'valence',
	Acousticness = 'acousticness',
	Instrumentalness = 'instrumentalness',
	Liveness = 'liveness',
	Speechiness = 'speechiness',
}

const getAttribute = async (params: Attribute & Dates) => {
	const response = await axios.get('http://localhost:5000/api/attribute', { params });
	return response.data;
};

export const useQueryFunction = (queryType: QueryType) => {
	switch (queryType) {
		case QueryType.Score: return getScore;
		case QueryType.Attribute: return getAttribute;
		default: throw new Error(`Invalid query type: ${queryType}`);
	}
}
