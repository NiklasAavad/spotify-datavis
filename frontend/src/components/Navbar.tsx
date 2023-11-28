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
				<strong>Query Type:</strong>
				<label>
					<input
						type="radio"
						value={QueryType.Attribute}
						checked={queryType === QueryType.Attribute}
						onChange={() => setQueryType(QueryType.Attribute)}
					/>
					Attribute
				</label>
				<label>
					<input
						type="radio"
						value={QueryType.Score}
						checked={queryType === QueryType.Score}
						onChange={() => setQueryType(QueryType.Score)}
					/>
					Score
				</label>
			</div>
			<div>
				<strong>Domain Type:</strong>
				<button onClick={toggleDomainType}>Toggle domain (full, cropped)</button>
			</div>
			<div>
				<strong>Date:</strong>
				<input
					type="date"
					value={date.toISOString().split('T')[0]}
					onChange={(e) => setDate(new Date(e.target.value))}
				/>
			</div>
			{queryType === QueryType.Attribute && (
				<div>
					<strong>Attribute Parameters:</strong>
					{Object.values(Attribute).map((attribute) => (
						<label key={attribute}>
							<input
								type="radio"
								value={attribute}
								checked={currentAttributeParams.attribute === attribute}
								onChange={() => setCurrentAttributeParams({ attribute })}
							/>
							{attribute}
						</label>
					))}
				</div>
			)}
			{queryType === QueryType.Score && (
				<div>
					<strong>Score Parameters:</strong>
					{/* Render your Score Parameter Changer component here */}
				</div>
			)}
			<div>
				<strong>Selected Metrics:</strong>
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
	);
};
