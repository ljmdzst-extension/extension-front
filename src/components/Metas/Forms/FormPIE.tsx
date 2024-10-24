import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { RootState } from '@/redux/store';
import { ListaObjetivo } from '@/types/BasesProps';
import { Actividad } from '@/types/ActivityProps';
import { useSelector } from 'react-redux';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormPIE({ activity, saveData }: Props) {
	const { bases } = useSelector((state: RootState) => state.metas);
	const [objetivos] = useState<ListaObjetivo[]>(bases?.listaObjetivos ?? []);
	const [objetivosSeleccionados, setObjetivosSeleccionados] = useState<number[]>(
		activity?.listaObjetivos ?? [],
	);

	console.log(objetivosSeleccionados);

	useEffect(() => {
		saveData({ listaObjetivos: objetivosSeleccionados });
	}, [objetivosSeleccionados]);

	const handleSeleccionarObjetivo = (idObjetivo: number) => {
		const objetivoIndex = objetivosSeleccionados.indexOf(idObjetivo);
		let newSeleccionados: number[];
		if (objetivoIndex === -1) {
			newSeleccionados = [...objetivosSeleccionados, idObjetivo];
		} else {
			newSeleccionados = objetivosSeleccionados.filter((id) => id !== idObjetivo);
		}

		newSeleccionados.sort((a, b) => a - b);

		setObjetivosSeleccionados(newSeleccionados);
	};

	const objetivosDesde21a24 = objetivos?.slice(19, 22);
	const objetivosDesde5a9 = objetivos?.slice(4, 9);
	const objetivosDesde10a15 = objetivos?.slice(9, 14);
	const objetivosDesde16a20 = objetivos?.slice(14, 19);

	return (
		<>
			<p className=' px-2 text-end w-100 fst-italic'>
				Referencia:{' '}
				<a
					href='https://www.unl.edu.ar/pie/wp-content/uploads/sites/55/2021/02/Plan-Institucional-Estrat%C3%A9gico.pdf'
					target='_blank'
					rel='noopener noreferrer'
					className=' text-decoration-underline'
				>
					Plan Institucional Estratégico
				</a>
			</p>
			<div className='ContainerEje'>
				<h4 className='TitlePie'>Ejes Transversales</h4>
				<Form className='FormEje'>
					{/* <p className='SubtitlePie'>
							<span>Seleccione los ejes:</span>
						</p> */}
					<div className='Eje mt-2'>
						{objetivosDesde21a24.map((objetivo) => (
							<Form.Check
								id={objetivo.idObjetivo.toString()}
								label={objetivo.nom}
								key={objetivo.idObjetivo}
								onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
								checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
							/>
						))}
					</div>
				</Form>
			</div>
			<div className='ContainerPlan'>
				<h4 className='TitlePie'>Plan Institucional</h4>
				<Form className='FormPlan'>
					{/* <p className='SubtitlePie'>
							<span>Seleccione los planes:</span>
						</p> */}
					<div className='ConteinerChecksPlan mt-2'>
						<div className='Lie'>
							{objetivosDesde5a9.map((objetivo) => (
								<Form.Check
									id={objetivo.idObjetivo.toString()}
									title={objetivo.detalle ?? undefined}
									label={objetivo.nom}
									key={objetivo.idObjetivo}
									onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
									checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
								/>
							))}
						</div>
						<div className='Lie'>
							{objetivosDesde10a15.map((objetivo) => (
								<Form.Check
									id={objetivo.idObjetivo.toString()}
									label={objetivo.nom}
									title={objetivo.detalle ?? undefined}
									key={objetivo.idObjetivo}
									onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
									checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
								/>
							))}
						</div>
						<div className='Lie'>
							{objetivosDesde16a20.map((objetivo) => (
								<Form.Check
									id={objetivo.idObjetivo.toString()}
									label={objetivo.nom}
									title={objetivo.detalle ?? undefined}
									key={objetivo.idObjetivo}
									onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
									checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
								/>
							))}
						</div>
					</div>
					<p className=' mt-2 text-end w-100 fst-italic text-guide'>
						*Deje el puntero sobre cada objetivo para ver el detalle
					</p>
				</Form>
			</div>
		</>
	);
}
