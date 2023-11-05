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
			<div>
				<input type="radio" value={Attribute.Danceability} checked={attribute == Attribute.Danceability} onChange={onChangeAttribute} /> Danceability
				<input type="radio" value={Attribute.Energy} checked={attribute == Attribute.Energy} onChange={onChangeAttribute} /> Energy
				<input type="radio" value={Attribute.Valence} checked={attribute == Attribute.Valence} onChange={onChangeAttribute} /> Valence
				<input type="radio" value={Attribute.Acousticness} checked={attribute == Attribute.Acousticness} onChange={onChangeAttribute} /> Acousticness
				<input type="radio" value={Attribute.Instrumentalness} checked={attribute == Attribute.Instrumentalness} onChange={onChangeAttribute} /> Instrumentalness
				<input type="radio" value={Attribute.Liveness} checked={attribute == Attribute.Liveness} onChange={onChangeAttribute} /> Liveness
				<input type="radio" value={Attribute.Speechiness} checked={attribute == Attribute.Speechiness} onChange={onChangeAttribute} /> Speechiness
			</div>
		</>
	)
}
