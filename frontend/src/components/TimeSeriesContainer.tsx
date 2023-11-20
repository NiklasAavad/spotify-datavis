import { Spinner } from './Spinner.tsx';
import { TimeSeries, TimeSeriesProps } from './TimeSeries.tsx';

type TimeSeriesContainerProps = {
	isLoading: boolean;
} & TimeSeriesProps;

export const TimeSeriesContainer: React.FC<TimeSeriesContainerProps> = (props) => {

	return (
		<>
			<div style={{ height: props.height, width: props.width, position: 'relative' }}>
				<div style={{ height: "100%" }}>
					<TimeSeries
						data={props.data}
						color={props.color}
						margin={props.margin}
						width={props.width}
						height={props.height}
					/>
				</div>
				<Spinner isLoading={props.isLoading} />
			</div>
		</>
	)
}

