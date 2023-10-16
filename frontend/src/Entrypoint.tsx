import { WorldMap } from './components/WorldMap'

import axios from 'axios';

import { useQuery } from 'react-query';
import { ColorLegend } from './components/ColorLegend';
import * as d3 from 'd3';

const useScores = () => {
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

	return useQuery('scores', getScores);
}

const getData = () => {
	if (!SHOULD_USE_BACKEND) {
		return {
			"USA": 90,
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
	}

	const { data, isLoading, isError, error } = useScores();

	if (isError) {
		console.log("error:", error);
		throw new Error("damn error");
	}

	if (!isLoading) {
		return data;
	}

	console.log("Loading...");
}

const SHOULD_USE_BACKEND = false;

export const Entrypoint = () => {
	const data = getData();

	const startColor = 'purple'
	const endColor = 'yellow'

	const cubehelixScale = d3
		.scaleSequential(d3.interpolateCubehelix.gamma(1)(startColor, endColor))
		.domain([0, 100]);

	const countryScores = new Map<string, number>(Object.entries(data));
	console.log(countryScores)

	return (
		<>
			<ColorLegend colorScale={cubehelixScale} width={500} height={50} />
			<WorldMap countryScores={countryScores} />
		</>
	)
}
