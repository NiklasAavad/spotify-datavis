/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScatterPlot, ScatterPlotProps } from './ScatterPlot.tsx';
import { Spinner } from './Spinner.tsx';

type ScatterPlotContainerProps = {
	isLoading: boolean;
	totalWidth: number;
	totalHeight: number;
} & Omit<ScatterPlotProps, 'height' | 'width' | 'margin'>;

export const ScatterPlotContainer: React.FC<ScatterPlotContainerProps> = (props) => {
	const svgOpacity = props.isLoading ? 0.1 : 1.0

	const MARGIN = { top: 20, right: 30, bottom: 30, left: 40 };
	const WIDTH = 250 - MARGIN.left - MARGIN.right;
	const HEIGHT = WIDTH;

	return (
		<>
			<div style={{ height: props.totalHeight, width: props.totalWidth, overflow: 'hidden', position: 'relative' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<ScatterPlot
						data={props.data}
						selectedMetric={props.selectedMetric}
						selectedMetric2={props.selectedMetric2}
						setBrushedInterval={props.setBrushedInterval}
						margin={MARGIN}
						width={WIDTH}
						height={HEIGHT}
						colorScale={props.colorScale}
					/>
				</div>
				<Spinner isLoading={props.isLoading} />
			</div>
		</>
	)
}

