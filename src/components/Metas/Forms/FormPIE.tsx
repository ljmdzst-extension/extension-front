import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { RootState } from '@/redux/store';
import { ListaObjetivo } from '@/types/BasesProps';
import { Actividad } from '@/types/ActivityProps';
import { useSelector } from 'react-redux';
import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';
import { Info } from '@mui/icons-material';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormPIE({ activity, saveData }: Props) {
	const objetivos = useSelector((state: RootState) => state.metas.bases?.listaObjetivos ?? []);
	const [objetivosSeleccionados, setObjetivosSeleccionados] = useState<number[]>(
		activity?.listaObjetivos ?? [],
	);

	const handleSeleccionarObjetivo = (idObjetivo: number) => {
		const newSeleccionados = objetivosSeleccionados.includes(idObjetivo)
			? objetivosSeleccionados.filter((id) => id !== idObjetivo)
			: [...objetivosSeleccionados, idObjetivo].sort((a, b) => a - b);

		setObjetivosSeleccionados(newSeleccionados);
		saveData({ listaObjetivos: newSeleccionados });
	};

	const ejesTransversales = objetivos.slice(19, 22);
	const planInstitucional = [
		objetivos.slice(4, 9),
		objetivos.slice(9, 14),
		objetivos.slice(14, 19),
	];

	const renderCheckboxes = (items: ListaObjetivo[]) => {
		const [mainTitle] = items[0].nom.split(' - ');

		return (
			<>
				<p className=' fw-semibold mb-0'>{mainTitle}</p>
				{items.map(({ idObjetivo, nom, detalle }) => {
					const [, subTitle] = nom.split(' - ');

					return (
						<div className='d-flex gap-1' key={idObjetivo}>
							<Form.Check
								id={idObjetivo.toString()}
								label={subTitle}
								onChange={() => handleSeleccionarObjetivo(idObjetivo)}
								checked={objetivosSeleccionados.includes(idObjetivo)}
							/>
							{detalle && (
								<CommonIconWithTooltip
									Icon={() => <Info style={{ color: '#28a745', fontSize: '1.2rem' }} />}
									tooltipText={detalle}
								/>
							)}
						</div>
					);
				})}
			</>
		);
	};

	return (
		<>
			<p className='px-2 text-end w-100 fst-italic'>
				Referencia:{' '}
				<a
					href='https://www.unl.edu.ar/pie/wp-content/uploads/sites/55/2021/02/Plan-Institucional-Estrat%C3%A9gico.pdf'
					target='_blank'
					rel='noopener noreferrer'
					className='text-decoration-underline'
				>
					Plan Institucional Estratégico
				</a>
			</p>

			{/* Ejes Transversales Section */}
			<div className='d-flex flex-column justify-content-start align-items-center w-100'>
				<h4>Ejes Transversales</h4>
				<Row className='w-75'>
					{ejesTransversales.map((objetivo) => (
						<Col key={objetivo.idObjetivo} xs={12} md={4} className='mb-2'>
							<Form.Check
								id={objetivo.idObjetivo.toString()}
								label={objetivo.nom}
								title={objetivo.detalle ?? undefined}
								onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
								checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
							/>
						</Col>
					))}
				</Row>
			</div>

			{/* Plan Institucional Section */}
			<div className='d-flex flex-column justify-content-start align-items-center w-100 mt-4'>
				<h4>Plan Institucional</h4>
				<Form className='w-75'>
					<Row>
						{planInstitucional.map((items, index) => (
							<Col key={index} xs={12} md={4}>
								{renderCheckboxes(items)}
							</Col>
						))}
					</Row>
				</Form>
				<p className='mt-2 text-end w-100 fst-italic' style={{ fontSize: '.8rem' }}>
					*Al pasar el puntero sobre los iconos "¡", podrá ver el detalle.
				</p>
			</div>
		</>
	);
}
