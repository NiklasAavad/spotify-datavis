import { useCallback, useEffect, useState } from "react";
import { DataProvider, Dates } from "./useData";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";

enum Attribute {
	Danceability = 'danceability',
	Energy = 'energy',
	Valence = 'valence',
	Acousticness = 'acousticness',
	Instrumentalness = 'instrumentalness',
	Liveness = 'liveness',
	Speechiness = 'speechiness',
}

const useAttribute = (attribute: Attribute, dates: Dates) => {
	const getAttribute = async () => {
		try {
			const response = await axios.get('http://localhost:5000/api/attribute', {
				params: {
					attribute: attribute,
					from_date: dates.fromDate,
					to_date: dates.toDate,
				}
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery(['attribute', attribute, dates.fromDate, dates.toDate], () => getAttribute()); // TODO remember to use QueryType.Attribute
}

export const AttributeData: DataProvider = (dates: Dates) => {
	const [attribute, setAttribute] = useState<Attribute>(Attribute.Danceability);
	const queryClient = useQueryClient();
	const queryResult = useAttribute(attribute, dates);

	const onChangeAttribute = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newAttribute = event.target.value as Attribute;
		setAttribute(newAttribute);
	}

	const refetchData = useCallback((dates: Dates) => {
		queryClient.invalidateQueries(['attribute', attribute, dates.fromDate, dates.toDate]);
	}, [attribute, queryClient])

	useEffect(() => {
		refetchData(dates);
	}, [dates, refetchData])

	const paramComponent = (
		<>
			<div>Attribute:</div>
			<div onChange={onChangeAttribute}>
				<input type="radio" value={Attribute.Danceability} checked={attribute == Attribute.Danceability} /> Danceability
				<input type="radio" value={Attribute.Energy} checked={attribute == Attribute.Energy} /> Energy
				<input type="radio" value={Attribute.Valence} checked={attribute == Attribute.Valence} /> Valence
				<input type="radio" value={Attribute.Acousticness} checked={attribute == Attribute.Acousticness} /> Acousticness
				<input type="radio" value={Attribute.Instrumentalness} checked={attribute == Attribute.Instrumentalness} /> Instrumentalness
				<input type="radio" value={Attribute.Liveness} checked={attribute == Attribute.Liveness} /> Liveness
				<input type="radio" value={Attribute.Speechiness} checked={attribute == Attribute.Speechiness} /> Speechiness
			</div>
		</>
	)

	const dataUpperBound = 1;

	return { queryResult, paramComponent, dataUpperBound }
}
