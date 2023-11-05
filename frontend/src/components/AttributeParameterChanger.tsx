export enum Attribute {
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

type AttributeParameterChangerProps = {
	attribute: Attribute
	setParams: React.Dispatch<React.SetStateAction<AttributeParams>>
}

export const AttributeParameterChanger: React.FC<AttributeParameterChangerProps> = (props) => {
	const { attribute, setParams } = props;

	const onChangeAttribute = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newAttribute = event.target.value as Attribute;
		setParams({ attribute: newAttribute });
	}

	return (
		<>
			<div>Attribute:</div>
			<div onChange={onChangeAttribute}>
				<input type="radio" value={Attribute.Danceability} defaultChecked={attribute == Attribute.Danceability} /> Danceability
				<input type="radio" value={Attribute.Energy} defaultChecked={attribute == Attribute.Energy} /> Energy
				<input type="radio" value={Attribute.Valence} defaultChecked={attribute == Attribute.Valence} /> Valence
				<input type="radio" value={Attribute.Acousticness} defaultChecked={attribute == Attribute.Acousticness} /> Acousticness
				<input type="radio" value={Attribute.Instrumentalness} defaultChecked={attribute == Attribute.Instrumentalness} /> Instrumentalness
				<input type="radio" value={Attribute.Liveness} defaultChecked={attribute == Attribute.Liveness} /> Liveness
				<input type="radio" value={Attribute.Speechiness} defaultChecked={attribute == Attribute.Speechiness} /> Speechiness
			</div>
		</>
	)
}
