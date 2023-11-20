/* eslint-disable @typescript-eslint/no-explicit-any */
import { Histogram, HistogramProps } from './Histogram.tsx';
import { Spinner } from './Spinner.tsx';

type HistogramContainerProps = {
	isLoading: boolean;
	totalWidth: number;
	totalHeight: number;
} & Omit<HistogramProps, 'height' | 'width' | 'margin'>;

export const HistogramContainer: React.FC<HistogramContainerProps> = (props) => {
	const svgOpacity = props.isLoading ? 0.1 : 1.0
	const MARGIN = { top: 20, right: 30, bottom: 30, left: 30 };
	const WIDTH = 250 - MARGIN.left - MARGIN.right;
	const HEIGHT = WIDTH;

	return (
		<>
			<div style={{ height: props.totalHeight, width: props.totalWidth, overflow: 'hidden', position: 'relative' }}>
				<div style={{ opacity: svgOpacity, height: "100%" }}>
					<Histogram
						data={props.data}
						selectedCountries={props.selectedCountries}
						selectedMetric={props.selectedMetric}
						brushedInterval={props.brushedInterval}
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

