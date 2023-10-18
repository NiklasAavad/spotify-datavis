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

export const useFakeAttributeData = () => {
	const data = {
		"United States": 0.90,
		"Canada": 0.80,
		"Mexico": 0.85,
		"Spain": 0.80,
		"Portugal": 0.90,
		"France": 0.70,
		"Italy": 0.75,
		"Germany": 0.20,
		"England": 0.75,
		"Denmark": 0.90,
		"Sweden": 0.15,
		"Norway": 0.80,
		"Finland": 0.90,
		"Russia": 0.70,
		"China": 0.10,
		"Japan": 0.50,
		"South Korea": 0.60,
		"India": 0.30,
		"Australia": 0.80,
		"New Zealand": 0.90,
	};

	const isLoading = false;
	const isError = false;

	return { data, isLoading, isError };
}
