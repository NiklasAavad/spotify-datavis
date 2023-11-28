import { QueryType } from '../hooks/useQueryFunction';
import { ScoreParams } from './ScoreParameterChanger';
import { Attribute, AttributeParams } from './AttributeParameterChanger';

import React from 'react';

interface NavbarProps {
	queryType: QueryType;
	setQueryType: React.Dispatch<React.SetStateAction<QueryType>>;
	domainType: 'full' | 'cropped';
	toggleDomainType: () => void;
	date: Date;
	setDate: (date: Date) => void;
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
			// If not selected and less than 3 metrics are selected, add it
			// TODO, add some error	message if more than 3 metrics are selected
			if (selectedMetrics.length < 3) {
				setSelectedMetrics((prevSelectedMetrics) => [...prevSelectedMetrics, metric]);
			}
		}
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'grey', marginBottom: '16px' }}>
			<div>
				<strong>Overview</strong> 
				<p style={{marginTop: '-8px', marginBottom: '0px', fontSize: '12px', fontStyle: 'italic'}}>{queryType === QueryType.Attribute ? 'average per country' : '% of songs within selected range'}</p>
				<div style={{ marginTop: '0px' }}>
					{queryType === QueryType.Attribute &&
						Object.values(Attribute).map((attribute) => (
							<span
								key={attribute}
								style={{
									textDecoration: currentAttributeParams.attribute === attribute ? 'underline' : 'none',
									cursor: 'pointer',
									marginRight: '10px',
								}}
								onClick={() => setCurrentAttributeParams({ attribute })}
							>
								{attribute}
							</span>
						))
					}
					{queryType === QueryType.Score &&
						<div>score chosen</div>
					}
				</div>
			</div>
			<div>
				<strong>Domain Type:</strong>
				<div>
					<button onClick={toggleDomainType}>Toggle domain (full, cropped)</button>
				</div>
			</div>
			<div>
				<strong>Date:</strong>
				<div>
					<input
						type="date"
						value={date.toISOString().split('T')[0]}
						onChange={(e) => setDate(new Date(e.target.value))}
					/>
				</div>
			</div>
			<div>
				<strong>Detail</strong>
				<div style={{ marginTop: '0px' }}>
					{Object.values(Attribute).map((metric) => (
						<label key={metric}>
							<input
								type="checkbox"
								value={metric}
								checked={selectedMetrics.includes(metric)}
								onChange={() => handleMetricChange(metric)}
							/>
							{metric}
						</label>
					))}
				</div>
			</div>
		</div>
	);
};
