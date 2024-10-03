import React from 'react';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import InfoCard from '@/components/Common/Cards/InfoCards';
import useAlert from '@/hooks/useAlert';
import Grafico from '@/components/Common/Graficos/Grafico';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import { useGraphics } from '@/hooks/useGraphics';
import { getArchivoPresupuesto, postArchivoPresupuesto } from '@/services/api/private/metas';
import Swal from 'sweetalert2';

interface Props {
	anio: string;
	idArea: number;
	idPrograma: number;
	cantidadActividades: number;
}

type ChartType = 'line' | 'bar' | 'pie';

const allowedMimeTypes = [
	'application/vnd.ms-excel', // .xls
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
	'text/csv', // .csv
];

export const PanelActivityInfo: React.FC<Props> = ({
	cantidadActividades,
	anio,
	idArea,
	idPrograma,
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { graficoObjEst, graficoEjes, isLoading } = useGraphics({
		year: Number(anio),
		area: idArea,
	});
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

		if (!allowedMimeTypes.includes(file.type)) {
			errorAlert('Solo se permiten archivos de Excel o CSV');
			return;
		}

		const { isConfirmed } = await Swal.fire({
			title: 'Confirmación de subida',
			html: `Se va a subir el documento <strong>${file.name}</strong>. ¿Está seguro?<br/>Si ya hay un documento subido, será reemplazado con el actual.`,
			icon: 'warning',
			width: '50%',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Sí, subir',
			cancelButtonText: 'Cancelar',
		});

		if (isConfirmed) {
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
		} else {
			errorAlert('La subida del archivo fue cancelada');
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
			legend: false,
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
		<Container
			className='py-3 h-100 overflow-y-auto custom-scrollbar fluid'
			style={{ maxHeight: 'calc(100vh - 130px)', height: '100%' }}
		>
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
					link={{
						href: 'https://docs.google.com/spreadsheets/d/19_60T2qLdse4AcTeF-eCcdKb5hGp6F9N/edit?usp=sharing&ouid=105932027422425501503&rtpof=true&sd=true',
						text: 'Descargar Plantilla',
					}}
					variant='success'
					textColor='white'
					colProps={{ md: 8 }}
					customButton={
						<div className='d-flex flex-column gap-2'>
							<Form.Group controlId='formFile'>
								<Form.Control
									type='file'
									size='sm'
									placeholder='Presupuesto'
									onChange={handleFileChange}
								/>
							</Form.Group>
							<Button size='sm' variant='light' onClick={handleDownloadClick}>
								Descargar
							</Button>
						</div>
					}
				/>
			</Row>

			<Row>
				{chartConfigs.map((item, index) => (
					<InfoCard
						key={index} // Add unique key for each InfoCard
						variant='secondary'
						title={item.title}
						titleFontSize='1rem'
						renderChart
						centerText
						chartComponent={
							isLoading ? (
								<LoadingSpinner />
							) : (
								<div
									className='d-flex flex-column border rounded w-100 h-100 text-center '
									style={{ backgroundColor: '#f5f5f5', minHeight: '200px', maxWidth: '100%' }}
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
