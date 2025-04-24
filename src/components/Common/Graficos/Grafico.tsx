import React, { useMemo } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	PieChart,
	Pie,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import LoadingSpinner from '../Spinner/LoadingSpinner';

type ChartType = 'line' | 'bar' | 'pie';

interface GraficoProps {
	type: ChartType;
	data: Record<string, any>[];
	dataKey?: string;
	valueKeys: string[];
	legend?: boolean;
	customColors?: { item: string; color: string | null }[];
}

const RADIAN = Math.PI / 180;

const DEFAULT_COLORS = [
	'#8884d8',
	'#82ca9d',
	'#ffc658',
	'#ff8042',
	'#8dd1e1',
	'#a4de6c',
	'#d0ed57',
	'#ffbb28',
	'#ff7f50',
	'#0088fe',
	'#00c49f',
	'#ff6f61',
	'#6a5acd',
	'#20b2aa',
	'#ffb6c1',
];

interface CustomizedLabelProps {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
}

const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
}: CustomizedLabelProps) => {
	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	);
};

const CustomTooltip: React.FC<{ active: boolean; payload: any[]; label: string }> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		return (
			<div
				className='custom-tooltip'
				style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}
			>
				<p className='label'>{`${label} :`}</p>
				{payload.map((entry, index) => (
					<p key={`tooltip-item-${index}`}>Cantidad de Actividades: {entry.value}</p>
				))}
			</div>
		);
	}
	return null;
};

const Grafico: React.FC<GraficoProps> = ({
	dataKey = 'name',
	type,
	data,
	valueKeys,
	legend = true,
	customColors,
}) => {
	const shouldHideTicks = data.length > 10;

	const getColor = useMemo(() => {
		return (name: string, index: number) => {
			const customColor = customColors?.find((color) => color.item === name)?.color;
			return customColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
		};
	}, [customColors]);

	if (data.length === 0) {
		return <LoadingSpinner />;
	}

	//NOTE:  Componente LineChart
	const renderLineChart = () => (
		<LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
			<CartesianGrid strokeDasharray='3 3' />
			<XAxis dataKey={dataKey} tick={shouldHideTicks ? false : undefined} />
			<YAxis />
			<Tooltip content={<CustomTooltip active={false} payload={[]} label='' />} />
			{legend && <Legend />}
			{valueKeys.map((key, index) => (
				<Line key={index} type='monotone' dataKey={key} stroke={getColor(key, index)} />
			))}
		</LineChart>
	);

	//NOTE:  Componente BarChart
	const renderBarChart = () => (
		<BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
			<CartesianGrid strokeDasharray='3 3' />
			<XAxis dataKey={dataKey} tick={shouldHideTicks ? false : undefined} />
			<YAxis />
			<Tooltip content={<CustomTooltip active={false} payload={[]} label='' />} />
			{legend && <Legend />}
			{valueKeys.map((key, index) => (
				<Bar key={index} dataKey={key} fill={getColor(key, index)}>
					{data.map((entry, idx) => (
						<Cell key={`cell-${idx}`} fill={getColor(entry[dataKey], idx)} />
					))}
				</Bar>
			))}
		</BarChart>
	);

	//NOTE:  Componente PieChart
	const renderPieChart = () => (
		<PieChart margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
			<Pie
				dataKey='cantActividades'
				data={data}
				cx='50%'
				cy='50%'
				labelLine={false}
				outerRadius={100}
				fill='#8884d8'
				label={renderCustomizedLabel}
				nameKey={dataKey}
			>
				{data.map((entry, index) => (
					<Cell key={`cell-${index}`} fill={getColor(entry[dataKey], index)} />
				))}
			</Pie>
			<Tooltip />
			{legend && <Legend />}
		</PieChart>
	);

	const renderChart = () => {
		switch (type) {
			case 'line':
				return renderLineChart();
			case 'bar':
				return renderBarChart();
			case 'pie':
				return renderPieChart();
			default:
				return <div>Invalid chart type</div>;
		}
	};

	return <ResponsiveContainer>{renderChart()}</ResponsiveContainer>;
};

export default Grafico;
