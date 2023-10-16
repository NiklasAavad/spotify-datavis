/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from "d3"
import { Feature, Geometry } from "geojson"

type CountryProps = {
	countryFeature: Feature<Geometry, {
		[name: string]: any
	}>,
	selectedCountries: Set<string>,
	setSelectedCountries: (newSet: Set<string>) => void,
	geoPathGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>,
	score: number
	colorScale: d3.ScaleSequential<string>
}

export const Country: React.FC<CountryProps> = (props) => {
	const { countryFeature,
		selectedCountries,
		setSelectedCountries,
		geoPathGenerator,
		score,
		colorScale
	} = props

	const handleClick = (country: string) => {
		const newSet = new Set(selectedCountries)
		if (selectedCountries.has(country)) {
			newSet.delete(country)
		} else {
			newSet.add(country)
		}
		setSelectedCountries(newSet)
	}

	const getText = (country: string) => {
		if (score !== -1) {
			return `${country}: ${score}%`
		}
		return ''
	}

	const handleMouseOver = (country: string) => {
		d3.select('#tooltip')
			.style('opacity', 0.9)
			.classed('unselectable', true)
			.text(getText(country))
	}

	const handleMouseLeave = () => {
		d3.select('#tooltip')
			.style('opacity', 0)
	}

	const mouseMove = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
		d3.select('#tooltip')
			.style('left', (event.pageX + 10) + 'px')
			.style('top', (event.pageY - 10) + 'px')
	}

	const getFill = () => {
		if (score === -1) {
			return 'grey'
		}
		return colorScale(score)
	}

	return <path
		d={geoPathGenerator(countryFeature)}
		stroke="lightgrey"
		strokeWidth={0.5}
		fill={getFill()}
		fillOpacity={0.7}
		onClick={() => handleClick(countryFeature.properties?.name)}
		onMouseOver={() => handleMouseOver(countryFeature.properties?.name)}
		onMouseLeave={handleMouseLeave}
		onMouseMove={mouseMove} />
}
