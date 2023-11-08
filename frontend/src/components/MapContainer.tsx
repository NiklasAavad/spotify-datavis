/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction } from 'react';
import { Spinner } from './Spinner.tsx';
import { WorldMap } from './WorldMap.tsx';

type MapContainerProps = {
	data: any; // should be a dict of country name -> score (percentage), but we do not validate this yet.
	isLoading: boolean;
	colorScale: d3.ScaleSequential<string, string>;
	selectedCountries: Set<string>;
	setSelectedCountries: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const MapContainer: React.FC<MapContainerProps> = (props) => {
	const width = 1200;
	const height = 700;

	const svgOpacity = props.isLoading ? 0.1 : 1.0

	return (
		<>
			<div style={{ height: height, width: width, overflow: 'hidden', position: 'relative', border: 'solid' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<WorldMap
						data={props.data}
						isLoading={props.isLoading}
						colorScale={props.colorScale}
						width={width}
						height={height}
						selectedCountries={props.selectedCountries}
						setSelectedCountries={props.setSelectedCountries}
					/>
				</div>
				<Spinner isLoading={props.isLoading} />
			</div>
		</>
	)
}

