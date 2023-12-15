import { QueryType } from '../hooks/useQueryFunction';
import { ScoreParams } from './ScoreParameterChanger';
import { Attribute, AttributeParams } from './AttributeParameterChanger';
import "react-toggle/style.css"
import Toggle from 'react-toggle'

import React from 'react';
import { secondaryColor } from '../config';

interface NavbarProps {
	queryType: QueryType;
	setQueryType: React.Dispatch<React.SetStateAction<QueryType>>;
	domainType: 'full' | 'cropped';
	toggleDomainType: () => void;
	date: Date;
	setDate: (date: Date, offByOne: boolean) => void;
	currentScoreParams: ScoreParams;
	setCurrentScoreParams: React.Dispatch<React.SetStateAction<ScoreParams>>;
	currentAttributeParams: AttributeParams;
	setCurrentAttributeParams: React.Dispatch<React.SetStateAction<AttributeParams>>;
	selectedMetrics: Attribute[];
	setSelectedMetrics: React.Dispatch<React.SetStateAction<Attribute[]>>;
}

export const Navbar: React.FC<NavbarProps> = ({
	queryType,
	setQueryType,
	domainType,
	toggleDomainType,
	date,
	setDate,
	currentScoreParams,
	setCurrentScoreParams,
	currentAttributeParams,
	setCurrentAttributeParams,
	selectedMetrics,
	setSelectedMetrics,
}) => {
	const handleMetricChange = (metric: Attribute) => {
		// Check if the metric is already selected
		if (selectedMetrics.includes(metric)) {
			// If selected, remove it
			setSelectedMetrics((prevSelectedMetrics) =>
				prevSelectedMetrics.filter((selectedMetric) => selectedMetric !== metric)
			);
		} else {
			setSelectedMetrics((prevSelectedMetrics) => [...prevSelectedMetrics, metric]);
		}
	};

	const showScoreParamRange = (attribute: Attribute) => {
		switch (attribute) {
			case Attribute.Danceability:
				if (!(currentScoreParams.dance_lower_bound !== 0 || currentScoreParams.dance_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Danceability</strong> [{currentScoreParams.dance_lower_bound}, {currentScoreParams.dance_upper_bound}]
				</>
			case Attribute.Energy:
				if (!(currentScoreParams.energy_lower_bound !== 0 || currentScoreParams.energy_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Energy</strong> [{currentScoreParams.energy_lower_bound}, {currentScoreParams.energy_upper_bound}]
				</>
			case Attribute.Valence:
				if (!(currentScoreParams.valence_lower_bound !== 0 || currentScoreParams.valence_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Valence</strong> [{currentScoreParams.valence_lower_bound}, {currentScoreParams.valence_upper_bound}]
				</>
			case Attribute.Acousticness:
				if (!(currentScoreParams.acousticness_lower_bound !== 0 || currentScoreParams.acousticness_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Acousticness</strong> [{currentScoreParams.acousticness_lower_bound}, {currentScoreParams.acousticness_upper_bound}]
				</>
			case Attribute.Instrumentalness:
				if (!(currentScoreParams.instrumentalness_lower_bound !== 0 || currentScoreParams.instrumentalness_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Instrumentalness</strong> [{currentScoreParams.instrumentalness_lower_bound}, {currentScoreParams.instrumentalness_upper_bound}]
				</>
			case Attribute.Liveness:
				if (!(currentScoreParams.liveness_lower_bound !== 0 || currentScoreParams.liveness_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Liveness</strong> [{currentScoreParams.liveness_lower_bound}, {currentScoreParams.liveness_upper_bound}]
				</>
			case Attribute.Speechiness:
				if (!(currentScoreParams.speechiness_lower_bound !== 0 || currentScoreParams.speechiness_upper_bound !== 1)) {
					return null;
				}
				return <>
					<strong>Speechiness</strong> [{currentScoreParams.speechiness_lower_bound}, {currentScoreParams.speechiness_upper_bound}]
				</>
		}
	}

	const scoreParamComponents = [
		showScoreParamRange(Attribute.Danceability),
		showScoreParamRange(Attribute.Energy),
		showScoreParamRange(Attribute.Valence),
		showScoreParamRange(Attribute.Acousticness),
		showScoreParamRange(Attribute.Instrumentalness),
		showScoreParamRange(Attribute.Liveness),
		showScoreParamRange(Attribute.Speechiness),
	].filter((component) => component !== null);

	const textColor = "#fff5e1"

	const capitalizeFirstLetter = (string: string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	return (
		<div style={{ display: 'flex', color: textColor, justifyContent: 'space-between', padding: '16px', background: secondaryColor, marginBottom: '16px', fontSize: '20px', borderRadius: '24px', marginTop: '-16px' }}>
			<div style={{ width: '700px', textAlign: 'center' }}>
				<strong>Overview</strong>
				<p style={{ marginTop: '-8px', marginBottom: '0px', fontSize: '16px', fontStyle: 'italic' }}>{queryType === QueryType.Attribute ? 'average per country' : '% of songs within selected range'}</p>
				<div style={{ marginTop: '0px', fontSize: '18px' }}>
					{queryType === QueryType.Attribute &&
						Object.values(Attribute).map((attribute) => (
							<span
								key={attribute}
								style={{
									fontWeight: currentAttributeParams.attribute === attribute ? 'bold' : 'normal',
									cursor: 'pointer',
									marginRight: '10px',
								}}
								onClick={() => setCurrentAttributeParams({ attribute })}
							>
								{capitalizeFirstLetter(attribute)}
							</span>
						))
					}
					{queryType === QueryType.Score &&
						<>
							{scoreParamComponents[0]}, {scoreParamComponents[1]}
						</>
					}
				</div>
			</div>
			<div>
				<div style={{ marginBottom: '4px' }}>
					<strong>Value Range</strong>
					<p style={{ marginTop: '-8px', marginBottom: '0px', fontSize: '16px', fontStyle: 'italic' }}>full / focused</p>
				</div>
				<label>
					<Toggle
						defaultChecked={domainType === 'cropped'}
						icons={false}
						onChange={toggleDomainType} />
				</label>
			</div>
			<div>
				<strong>Date</strong>
				<p style={{ marginTop: '-8px', marginBottom: '0px', fontSize: '16px', fontStyle: 'italic' }}>from 2017 to 2021</p>
				<div>
					<input
						style={{ fontSize: '18px' }}
						type="date"
						value={date.toISOString().split('T')[0]}
						onChange={(e) => setDate(new Date(e.target.value), true)}
					/>
				</div>
			</div>
			<div style={{ width: '750px' }}>
				<strong>Detail</strong>
				<p style={{ marginTop: '-8px', marginBottom: '0px', fontSize: '16px', fontStyle: 'italic' }}>on demand</p>
				<div style={{ marginTop: '0px', fontSize: '18px' }}>
					{Object.values(Attribute).map((metric) => (
						<label key={metric}>
							<span
								key={metric}
								style={{
									fontWeight: selectedMetrics.includes(metric) ? 'bold' : 'normal',
									cursor: 'pointer',
									marginRight: '10px',
								}}
								onClick={() => handleMetricChange(metric)}
							>
								{capitalizeFirstLetter(metric)}
							</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);
};
