import { useState } from "react";
import { DataProvider } from "./useData";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";

enum Attribute {
	Danceability = 'danceability',
	Energy = 'energy',
	Valence = 'valence',
}

// TODO if we use this, we should probably make a Params type which includes the time period or something
const useAttribute = (attribute: Attribute) => {
	const getAttribute = async (attribute: Attribute) => {
		try {
			const response = await axios.get('http://localhost:5000/api/attribute', {
				params: {
					attribute: attribute,
				}
			});
			return response.data;
		} catch (error) {
			throw new Error('Error fetching data from the API');
		}
	};

	return useQuery(['attribute', attribute], () => getAttribute(attribute)); // TODO remember to use QueryType.Attribute
}

export const AttributeData: DataProvider = () => {
	const [attribute, setAttribute] = useState<Attribute>(Attribute.Danceability);
	const queryClient = useQueryClient();
	const queryResult = useAttribute(attribute);

	const refetchData = () => {
		const newAttribute = (document.getElementById('attribute') as HTMLInputElement).value as Attribute;
		setAttribute(newAttribute);
		queryClient.invalidateQueries([newAttribute]);
	}

	const paramComponent = (
		<>
			<div>
				<label htmlFor="attribute">Attribute </label>
				<select id="attribute">
					<option value={Attribute.Danceability}>Danceability</option>
					<option value={Attribute.Energy}>Energy</option>
					<option value={Attribute.Valence}>Valence</option>
				</select>
			</div>
			<button onClick={refetchData}>Update chart</button>
		</>
	)

	const dataUpperBound = 1;

	return { queryResult, paramComponent, dataUpperBound }
}
