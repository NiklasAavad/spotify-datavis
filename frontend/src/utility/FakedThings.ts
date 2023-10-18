import axios from 'axios';
import { useQuery } from 'react-query';

export const useTestScores = () => {
	const getScores = async () => {
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

	return useQuery('testScores', getScores);
}

export const useFakeData = () => {
	const SHOULD_USE_BACKEND = false;
	const { data, isLoading, isError } = useTestScores();

	if (!SHOULD_USE_BACKEND) {
		const data = {
			"United States": 90,
			"Canada": 80,
			"Mexico": 85,
			"Spain": 80,
			"Portugal": 90,
			"France": 70,
			"Italy": 75,
			"Germany": 20,
			"England": 75,
			"Denmark": 90,
			"Sweden": 15,
			"Norway": 80,
			"Finland": 90,
			"Russia": 70,
			"China": 10,
			"Japan": 50,
			"South Korea": 60,
			"India": 30,
			"Australia": 80,
			"New Zealand": 90,
		};

		const isLoading = false;
		const isError = false;

		return { data, isLoading, isError }
	}

	return { data, isLoading, isError };
}
