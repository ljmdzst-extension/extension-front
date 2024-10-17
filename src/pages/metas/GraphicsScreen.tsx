import { Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import Grafico from '@/components/Common/Graficos/Grafico';
import { useGraphics } from '@/hooks/useGraphics';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import CommonTitle from '@/components/Common/Text/CommonTitle';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i);

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
	const { graficoEjes, graficoObjEst, graficoLy, graficoUUAA, isLoading } = useGraphics({ year });

	const navigation = useNavigate();

	const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setYear(parseInt(e.target.value));
	};

	return (
		<div
			className='d-flex flex-column m-2 border rounded h-100'
			style={{ backgroundColor: '#fefefe' }}
		>
			<div className='d-flex justify-content-between align-items-center '>
				{/* <h2 className='m-0 flex-grow-1 text-center'>Gráficos y resúmenes</h2> */}
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
				<label htmlFor='year-select'>Selecciona el año: </label>
				<select id='year-select' value={year} onChange={handleYearChange}>
					{years.map((yearOption) => (
						<option key={yearOption} value={yearOption}>
							{yearOption}
						</option>
					))}
				</select>
			</div>
			<Container fluid className='h-100 overflow-y-scroll overflow-x-hidden custom-scrollbar'>
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
						<Col key={index} md={6} className=' mb-3'>
							<div
								className='d-flex flex-column border rounded w-100 h-100 p-2 text-center '
								style={{
									backgroundColor: 'var(--bs-secondary)',
									minHeight: '400px',
									maxWidth: '100%',
								}}
							>
								<CommonTitle padding=".2rem" size='small' textAlign='center' underline color='white'>
									{item.title}
								</CommonTitle>
								{isLoading ? (
									<LoadingSpinner />
								) : (
									<Grafico
										dataKey={item.dataKey}
										data={item.data}
										type={item.type}
										valueKeys={['cantActividades']}
										legend={item.legend}
										customColors={item.colors}
									/>
								)}
							</div>
						</Col>
					))}
				</Row>
			</Container>
		</div>
	);
};

export default GraphicsScreen;
