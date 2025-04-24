import { Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import Grafico from '@/components/Common/Graficos/Grafico';
import { useGraphics } from '@/hooks/useGraphics';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import YearSelector from '@/components/Common/YearSelector';
import InfoCard from '@/components/Common/Cards/InfoCards';

const currentYear = new Date().getFullYear();
const UACOLORS = [
	{ item: 'FICH', color: '#0061ae' },
	{ item: 'FHUC', color: '#ee7900' },
	{ item: 'ISM', color: '#bb5f00' },
	{ item: 'FCM', color: '#d60055' },
	{ item: 'FBCB', color: '#009f2f' },
	{ item: 'ESS', color: '#006c1f' },
	{ item: 'FCE', color: '#272b8b' },
	{ item: 'FCJS', color: '#9f052b' },
	{ item: 'FCV', color: '#72097c' },
	{ item: 'FCA', color: '#7db713' },
	{ item: 'FADU', color: '#f9b700' },
	{ item: 'FIQ', color: '#e61e00' },
	{ item: 'EIS', color: '#c7082a' },
	{ item: 'Escuela de Nivel Inicial y Primario', color: '#d80124' },
	{ item: 'Centro Universitario Reconquista-Avellaneda', color: null },
	{ item: 'Centro Universitario Gálvez', color: null },
	{ item: 'Sede UNL Rafaela-Sunchales', color: null },
	{ item: 'Jardín Maternal La Ronda', color: null },
	{ item: 'Escuela Secundaria UNL', color: null },
	{ item: 'EAGG', color: null },
];

type ChartType = 'line' | 'bar' | 'pie';
const GraphicsScreen = () => {
	const [year, setYear] = useState(currentYear);
	const { graficoEjes, graficoObjEst, graficoLy, graficoUUAA } = useGraphics({ year });
	const navigation = useNavigate();

	const handleYearChange = (newYear: number) => {
		setYear(newYear);
	};

	return (
		<div
			className=' container d-flex flex-column h-100'
		>
			<div className='d-flex justify-content-between align-items-center'>
				<CommonTitle bold underline textAlign='center'>
					Gráficos y resúmenes
				</CommonTitle>
				<ArrowBack
					fontSize='large'
					className='m-1 rounded cursor-pointer'
					style={{ background: '#0a5d52', color: 'white' }}
					onClick={() => {
						navigation('/gestion/metas');
					}}
				/>
			</div>

			<div className='d-flex justify-content-center align-items-center m-2'>
				<YearSelector year={year} onYearChange={handleYearChange} />
			</div>

			<Container fluid className='h-100 overflow-y-scroll overflow-x-hidden custom-scrollbar px-5'>
				<Row style={{ height: '90%', maxHeight: '600px' }} gap={2}>
					{[
						{
							title: 'Distribución de actividades según Eje Estratégico - PIE',
							type: 'pie' as ChartType,
							data: graficoEjes || [],
							dataKey: 'eje',
							legend: true,
							colors: undefined,
						},
						{
							title: 'Actividades según LIE y objetivo del PIE',
							type: 'bar' as ChartType,
							data: graficoObjEst || [],
							dataKey: 'objEst',
							legend: false,
							colors: undefined,
						},
						{
							title: 'Actividades según Objetivo Estratégico de la SEC',
							type: 'bar' as ChartType,
							data: graficoLy || [],
							dataKey: 'lie',
							legend: false,
							colors: undefined,
						},
						{
							title: 'Actividades por UA',
							type: 'bar' as ChartType,
							data: graficoUUAA || [],
							dataKey: 'ua',
							legend: false,
							colors: UACOLORS,
						},
					].map((item, index) => (
						<InfoCard
							key={index}
							variant='secondary'
							title={item.title}
							titleFontSize='1rem'
							renderChart
							centerText
							chartComponent={
								<div
									className='d-flex flex-column border rounded w-100 h-100 text-center '
									style={{ backgroundColor: '#f5f5f5', minHeight: '260px', maxWidth: '100%' }}
								>
									{' '}
									<Grafico
										dataKey={item.dataKey}
										data={item.data}
										type={item.type}
										valueKeys={['cantActividades']}
										legend={item.legend}
										customColors={item.colors}
									/>
								</div>
							}
							colProps={{ md: 6 }}
						/>
					))}
				</Row>
			</Container>
		</div>
	);
};

export default GraphicsScreen;
