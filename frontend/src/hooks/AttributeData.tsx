import { useEffect, useState } from "react";
import { DataProvider, QueryType } from "./useData";

enum Attribute {
	Danceability = 'danceability',
	Energy = 'energy',
	Valence = 'valence',
	Acousticness = 'acousticness',
	Instrumentalness = 'instrumentalness',
	Liveness = 'liveness',
	Speechiness = 'speechiness',
}

export type AttributeParams = {
	attribute: Attribute
}

const DATA_UPPER_BOUND = 1;
const INITIAL_ATTRIBUTE: Attribute = Attribute.Danceability;

export const AttributeData: DataProvider = (queryType: QueryType) => {
	const [attribute, setAttribute] = useState<Attribute>(INITIAL_ATTRIBUTE);

	useEffect(() => {
		setAttribute(INITIAL_ATTRIBUTE)
	}, [queryType])

	const onChangeAttribute = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newAttribute = event.target.value as Attribute;
		setAttribute(newAttribute);
	}

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

	return { paramComponent, dataUpperBound: DATA_UPPER_BOUND, params: { attribute } }
}
