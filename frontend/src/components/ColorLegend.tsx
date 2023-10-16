import * as d3 from 'd3';

type ColorLegendProps = {
	colorScale: d3.ScaleLinear<string, string>;
	width: number;
	height: number;
}

export const ColorLegend: React.FC<ColorLegendProps> = ({ colorScale, width, height }) => {
	const gradientId = 'colorGradient';

	const linearGradient = (
		<linearGradient id={gradientId}>
			<stop offset="0%" stopColor={colorScale(0)} />
			<stop offset="100%" stopColor={colorScale(100)} />
		</linearGradient>
	);

	return (
		<svg width={width} height={height}>
			{linearGradient}
			<rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
		</svg>
	);
};
