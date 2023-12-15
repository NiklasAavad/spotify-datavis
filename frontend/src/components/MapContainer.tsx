/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColorScale } from '../Entrypoint.tsx';
import { Spinner } from './Spinner.tsx';
import { WorldMap } from './WorldMap.tsx';

type MapContainerProps = {
	data: any; // should be a dict of country name -> score (percentage), but we do not validate this yet.
	isLoading: boolean;
	colorScale: ColorScale;
	selectedCountries: string[];
	setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
	height: number;
}

export const MapContainer: React.FC<MapContainerProps> = (props) => {
	const width = 1100;

	const svgOpacity = props.isLoading ? 0.1 : 1.0

	return (
		<>
			<div style={{ height: props.height, width: width, overflow: 'hidden', position: 'relative' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<WorldMap
						data={props.data}
						isLoading={props.isLoading}
						colorScale={props.colorScale}
						width={width}
						height={props.height}
						selectedCountries={props.selectedCountries}
						setSelectedCountries={props.setSelectedCountries}
					/>
				</div>
				<Spinner isLoading={props.isLoading} />
			</div>
		</>
	)
}

