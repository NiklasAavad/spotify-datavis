/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScatterPlot, ScatterPlotProps } from './ScatterPlot.tsx';
import { Spinner } from './Spinner.tsx';

type ScatterPlotContainerProps = {
	isLoading: boolean;
} & Omit<ScatterPlotProps, 'height' | 'width' | 'margin'>;

const MARGIN = { top: 20, right: 30, bottom: 30, left: 30 };
const WIDTH = 250 - MARGIN.left - MARGIN.right;
const HEIGHT = WIDTH;

export const ScatterPlotContainer: React.FC<ScatterPlotContainerProps> = (props) => {
	const svgOpacity = props.isLoading ? 0.1 : 1.0

	return (
		<>
			<div style={{ height: HEIGHT + 60, width: WIDTH + 40, overflow: 'hidden', position: 'relative', border: 'solid' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<ScatterPlot
						data={props.data}
						selectedCountries={props.selectedCountries}
						selectedMetric={props.selectedMetric}
						selectedMetric2={props.selectedMetric2}
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

