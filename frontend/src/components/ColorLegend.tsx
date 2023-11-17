import * as d3 from 'd3';
import { ColorScale } from '../Entrypoint';

type ColorLegendProps = {
	colorScale: ColorScale;
	width: number;
	height: number;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ colorScale, width, height }) => {
	const gradientId = 'colorGradient';

	const colorStep = 100;
	const colorStops = Array.from({ length: 101 }, (_, i) => colorScale(i / colorStep));

	const linearGradient = (
		<linearGradient id={gradientId}>
			{colorStops.map((color, i) => (
				<stop key={i} offset={`${i}%`} stopColor={color} />
			))}
		</linearGradient>
	);

	return (
		<svg width={width} height={height}>
			{linearGradient}
			<rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
		</svg>
	);
};
