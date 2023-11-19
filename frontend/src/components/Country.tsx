/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from "d3"
import { Feature, Geometry } from "geojson"
import { useState } from "react"
import { ColorScale } from "../Entrypoint"

type CountryProps = {
	countryFeature: Feature<Geometry, {
		[name: string]: any
	}>,
	selectedCountries: string[],
	setSelectedCountries: (newSet: string[]) => void,
	geoPathGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>,
	score: number | undefined,
	colorScale: ColorScale,
}

export const Country: React.FC<CountryProps> = (props) => {
	const { countryFeature,
		selectedCountries,
		setSelectedCountries,
		geoPathGenerator,
		score,
		colorScale
	} = props

	const [isHovered, setIsHovered] = useState(false)

	const handleClick = (country: string) => {
		// Do not add countries with no score! TODO, what if a country suddenly has no data and therefore 'no score'? might need to define the available countries instead
		if (score === undefined) {
			return;
		}

		if (selectedCountries.includes(country)) {
			const filteredCountries = selectedCountries.filter(c => c !== country)
			setSelectedCountries(filteredCountries)
		} else {
			setSelectedCountries([...selectedCountries, country])
		}
	}

	const getText = (country: string) => {
		if (score === undefined) {
			return ''
		}
		return `${country}: ${score}`
	}

	const handleMouseOver = (country: string) => {
		setIsHovered(true)
		d3.select('#tooltip')
			.style('opacity', 0.9)
			.classed('unselectable', true)
			.text(getText(country))
	}

	const handleMouseLeave = () => {
		setIsHovered(false)
		d3.select('#tooltip')
			.style('opacity', 0)
	}

	const mouseMove = (event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
		d3.select('#tooltip')
			.style('left', (event.pageX + 10) + 'px')
			.style('top', (event.pageY - 10) + 'px')
	}

	const getFill = () => {
		if (score && isHovered) {
			return 'orange'
		}
		return colorScale(score)
	}

	const getStrokeWidth = () => {
		if (selectedCountries.includes(countryFeature.properties?.name)) {
			return 1.5
		}
		return 0.5
	}

	const getStyles = () => {
		if (score === undefined) {
			return {} // no additional styling for countries without data!
		}
		return { cursor: 'pointer' }
	}

	return <path
		d={geoPathGenerator(countryFeature)}
		stroke="lightgrey"
		strokeWidth={getStrokeWidth()}
		fill={getFill()}
		fillOpacity={0.7}
		onClick={() => handleClick(countryFeature.properties?.name)}
		onMouseOver={() => handleMouseOver(countryFeature.properties?.name)}
		onMouseLeave={handleMouseLeave}
		onMouseMove={mouseMove}
		style={getStyles()}
	/>
}
