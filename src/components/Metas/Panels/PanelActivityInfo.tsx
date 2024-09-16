import React from 'react';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import InfoCard from '@/components/Common/Cards/InfoCards';
import Grafico from '@/components/Common/Graficos/Grafico';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import useAlert from '@/hooks/useAlert';
import { useGraphics } from '@/hooks/useGraphics';
import { getArchivoPresupuesto, postArchivoPresupuesto } from '@/services/api/private/metas';

interface Props {
	anio: string;
	idArea: number;
	idPrograma: number;
	cantidadActividades: number;
}

type ChartType = 'line' | 'bar' | 'pie';

export const PanelActivityInfo: React.FC<Props> = ({
	cantidadActividades,
	anio,
	idArea,
	idPrograma,
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { graficoObjEst, graficoEjes, isLoading } = useGraphics({ year: Number(anio) });
	const { errorAlert, successAlert } = useAlert();

	// Handle navigation
	const handleViewAllClick = () => {
		navigate(location.pathname + '/resumen');
	};

	// Handle file change
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			errorAlert('No se ha seleccionado ningún archivo');
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await postArchivoPresupuesto(formData, Number(anio), idArea, idPrograma);
			if (res.ok) {
				successAlert('Archivo cargado con éxito');
			} else {
				errorAlert(`Error al cargar el archivo: ${res.error}`);
			}
		} catch (error) {
			console.error('Error inesperado al cargar el archivo:', error);
			errorAlert('Error inesperado al cargar el archivo');
		}
	};

	// Handle file download
	const handleDownloadClick = async () => {
		const result = await getArchivoPresupuesto(Number(anio), idArea, idPrograma);
		if (result.ok) {
			successAlert('Archivo descargado con éxito');
		} else {
			errorAlert(`Error al descargar el archivo: ${result.error}`);
		}
	};

	// Chart configurations
	const chartConfigs = [
		{
			title: 'Distribución de actividades según Eje Estratégico - PIE',
			type: 'bar' as ChartType,
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
	];

	return (
		<Container className='py-4 h-100 overflow-y-auto custom-scrollbar'>
			<Row>
				{/* InfoCard for "Actividades" */}
				<InfoCard
					title='Actividades'
					info={cantidadActividades}
					buttonLabel='Ver todas'
					onButtonClick={handleViewAllClick}
					variant='primary'
					textColor='white'
					centerText
					infoFontSize='4rem'
					buttonVariant='light'
					buttonSize='sm'
					buttonDisabled={cantidadActividades === 0}
					colProps={{ md: 4 }}
				/>

				{/* InfoCard for "Presupuesto" */}
				<InfoCard
					title='Presupuesto'
					info='Plantilla de presupuesto disponible'
					link={{ href: '/descargar/plantilla', text: 'Descargar Plantilla' }}
					variant='success'
					textColor='white'
					colProps={{ md: 4 }}
					customButton={
						<div className='d-flex flex-column gap-2'>
							<Form.Group controlId='formFile'>
								<Form.Control type='file' size='sm' onChange={handleFileChange} />
							</Form.Group>
							<Button size='sm' variant='light' onClick={handleDownloadClick}>
								Ver
							</Button>
						</div>
					}
				/>
			</Row>

			{/* Render chart InfoCards */}
			<Row>
				{chartConfigs.map((item, index) => (
					<InfoCard
						key={index} // Add unique key for each InfoCard
						title={item.title}
						titleFontSize='1rem'
						renderChart
						centerText
						chartComponent={
							isLoading ? (
								<LoadingSpinner />
							) : (
								<div
									className='d-flex flex-column border rounded w-100 h-100 p-2 text-center '
									style={{ backgroundColor: '#f5f5f5', minHeight: '300px', maxWidth: '100%' }}
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
							)
						}
						colProps={{ md: 6 }}
					/>
				))}
			</Row>
		</Container>
	);
};
