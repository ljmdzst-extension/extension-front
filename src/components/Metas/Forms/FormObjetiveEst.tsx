import { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { RootState } from '@/redux/store';
import { Actividad } from '@/types/ActivityProps';
import { useSelector } from 'react-redux';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormObjetiveEst({ activity, saveData }: Props) {
	const { bases } = useSelector((state: RootState) => state.metas);

	const [objetivosSeleccionados, setObjetivosSeleccionados] = useState<number[]>(
		activity.listaObjetivos ?? [],
	);

	useEffect(() => {
		saveData({ listaObjetivos: objetivosSeleccionados });
	}, [objetivosSeleccionados]);

	useEffect(() => {
		setObjetivosSeleccionados(activity.listaObjetivos ?? []);
	}, [activity.listaObjetivos]);

	const handleSeleccionarObjetivo = useCallback((idObjetivo: number) => {
		setObjetivosSeleccionados((prevSeleccionados) => {
			if (prevSeleccionados.includes(idObjetivo)) {
				// Si el objetivo ya está seleccionado, eliminarlo de la lista
				return prevSeleccionados.filter((id) => id !== idObjetivo);
			} else {
				// Si el objetivo no está seleccionado, agregarlo a la lista
				const index = prevSeleccionados.findIndex((id) => id > idObjetivo);
				if (index === -1) {
					// Si no se encontró ningún elemento mayor, agregar al final
					return [...prevSeleccionados, idObjetivo];
				} else {
					// Insertar en la posición correcta para mantener el orden
					return [
						...prevSeleccionados.slice(0, index),
						idObjetivo,
						...prevSeleccionados.slice(index),
					];
				}
			}
		});
	}, []);

	return (
		<>
			<Form>
				<p className='fw-bold fs-6 mb-1'>
					<span>Seleccione el/los objetivo/s estratégico/s vinculado/s a la actividad :</span>
				</p>
				<div>
					{bases?.listaObjetivos?.slice(0, 4).map((objetivo) => (
						<Form.Check
							id={objetivo.idObjetivo.toString()}
							label={objetivo.nom}
							key={objetivo.idObjetivo}
							checked={objetivosSeleccionados.includes(objetivo.idObjetivo)}
							onChange={() => handleSeleccionarObjetivo(objetivo.idObjetivo)}
						/>
					))}
				</div>
			</Form>
		</>
	);
}
