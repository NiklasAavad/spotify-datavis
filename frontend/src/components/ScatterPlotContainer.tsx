/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataPoint, ScatterPlot } from './ScatterPlot.tsx';
import { Spinner } from './Spinner.tsx';

type ScatterPlotContainerProps = {
	metrics: DataPoint[];
	isLoading: boolean;
	selectedCountries: string[];
}

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };
const WIDTH = 400 - MARGIN.left - MARGIN.right;
const HEIGHT = 300 - MARGIN.top - MARGIN.bottom;

export const ScatterPlotContainer: React.FC<ScatterPlotContainerProps> = (props) => {
	const svgOpacity = props.isLoading ? 0.1 : 1.0

	return (
		<>
			<div style={{ height: HEIGHT + 80, width: WIDTH + 100, overflow: 'hidden', position: 'relative', border: 'solid' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<ScatterPlot
						data={props.metrics}
						selectedCountries={props.selectedCountries}
						margin={MARGIN}
						width={WIDTH}
						height={HEIGHT}
					/>
				</div>
				<Spinner isLoading={props.isLoading} />
			</div>
		</>
	)
}

