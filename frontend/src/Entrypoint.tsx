import { WorldMap } from './components/WorldMap'

import axios from 'axios';

import { useQuery } from 'react-query';

const fetchDataFunction = async () => {
	try {
		console.log("axios start baby")
		const response = await axios.get('http://localhost:5000/test');
		console.log("axios done baby")
		console.log(response.data)
		return response.data;
	} catch (error) {
		throw new Error('Error fetching data from the API');
	}
};

export const Entrypoint = () => {
	const { data, isLoading, isError, error } = useQuery('scores', fetchDataFunction);

	if (isError) {
		console.log("error:", error)
		return <div>Error... </div>
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	const countryScores = new Map<string, number>(Object.entries(data));
	console.log(countryScores)

	return (
		<>
			<WorldMap countryScores={countryScores} />
		</>
	)
}
