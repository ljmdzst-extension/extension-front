import { useEffect, useRef, useState } from 'react';
import { RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';

import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { setHayCambios } from '@/redux/actions/activityAction';
import { ErrorOutline } from '@mui/icons-material';
import { Meta } from '@/types/ActivityProps';
import { useGuardarActividad } from '@/hooks/useGuardarActividad'

interface Valoracion {
	idValoracion: number;
	nom: string;
}

const defaultNuevaMeta: Meta = {
	idMeta: 0,
	descripcion: '',
	resultado: '',
	observaciones: '',
	valoracion: -1,
};

const FormMetas = () => {
	const dispatch = useDispatch();
	const { activity, hayCambios } = useSelector((state: RootState) => state.actividad);
	const { bases, error } = useSelector((state: RootState) => state.metas);
	const { guardarActividad } = useGuardarActividad();
	const [listadoMetas, setListadoMetas] = useState<Meta[]>(activity.listaMetas ?? []);
	const [nuevaMeta, setNuevaMeta] = useState<Meta>(defaultNuevaMeta);
	const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
	const [showModal, setShowModal] = useState(false);
	const indexCurrentMeta = useRef(-1);

	const isInitialMount = useRef(true);

	useEffect(() => {
		if (!error && bases) {
			setValoraciones(bases.listaValoraciones);
		} else {
		}
	}, [bases, error]);

	const openModal = () => {
		setShowModal(true);
	};
	const closeModal = () => {
		setShowModal(false);
	};

	const botonAgregarMeta = () => {
		indexCurrentMeta.current = -1;
		setNuevaMeta(defaultNuevaMeta);
		openModal();
	};

	const guardarBotonModal = () => {
		if (indexCurrentMeta.current === -1) {
			const newListadoMetas = [...listadoMetas];
			newListadoMetas.push(nuevaMeta);
			setListadoMetas(newListadoMetas);
		} else {
			const newListadoMetas = [...listadoMetas];
			newListadoMetas[indexCurrentMeta.current] = nuevaMeta;
			setListadoMetas(newListadoMetas);
		}
		checkForChanges();
		closeModal();
	};

	const editarMeta = (index: number) => {
		indexCurrentMeta.current = index;
		setNuevaMeta(listadoMetas[index]);
		openModal();
		checkForChanges();
	};

	const eliminarMeta = (index: number) => {
		const newListadoMetas = [...listadoMetas];
		newListadoMetas.splice(index, 1);
		setListadoMetas(newListadoMetas);
		checkForChanges();
	};

	const alertVistaDetalle = (thisMeta: Meta) => {
		Swal.fire({
			html: `
			<div style='text-align: start;'>
				<p>Descripcion: ${thisMeta.descripcion}</p>
				<p>Resultado: ${thisMeta.resultado}</p>
				<p>Observaciones: ${thisMeta.observaciones}</p>
				<p>Valoracion: ${valoracionesText(thisMeta.valoracion ?? 0)}</p>
			</div>`,
			confirmButtonText: 'Aceptar',
			width: '80%',
		});
	};

	const textLimitError = (text: string, limit: number) => {
		return text.length > limit;
	};

	const valoracionesText = (idValoracion: number) => {
		const valoracion = valoraciones?.find((valoracion) => valoracion.idValoracion === idValoracion);
		return valoracion?.nom;
	};

	// NOTE: CHECK UPDATE
	const checkForChanges = () => {
		const cambio = JSON.stringify(activity.listaMetas) !== JSON.stringify(listadoMetas);

		if (hayCambios === cambio) return;

		if (cambio) {
			dispatch(setHayCambios({ valor: true }));
		} else {
			dispatch(setHayCambios({ valor: false }));
		}
	};
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		checkForChanges();
	}, [listadoMetas]);

	return (
		<div className=' d-flex flex-column mx-4 h-100'>
			<Button
				onClick={() => {
					botonAgregarMeta();
				}}
				className='my-4 ms-auto me'
			>
				Agregar
				<AddBoxRoundedIcon className=' ms-2' />
			</Button>
			<div className='custom-scrollbar' style={{ maxHeight: '300px', overflowY: 'auto' }}>
				<Table>
					<thead style={{ position: 'sticky', top: '0' }}>
						<tr>
							<th>#</th>
							<th>Meta/resultado esperado</th>
							<th>Valoraciones</th>
							<th style={{ textAlign: 'right' }}>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{listadoMetas.map((meta, index) => (
							<tr key={`${meta.descripcion}-${meta.idMeta} `}>
								<td>{index + 1}</td>
								<td
									style={{
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										maxWidth: '600px',
									}}
								>
									{meta.descripcion}
								</td>
								<td>{valoracionesText(meta.valoracion ?? 0)}</td>
								<td style={{ textAlign: 'right' }}>
									<VisibilityIcon
										id={`metaLabel-${meta.idMeta}`}
										onClick={() => alertVistaDetalle(meta as Meta)}
										color='primary'
										className='cursor-pointer'
									/>
									<EditIcon
										color='action'
										className='cursor-pointer'
										onClick={() => editarMeta(index)}
									/>
									<DeleteIcon
										color='error'
										className='cursor-pointer'
										onClick={() => eliminarMeta(index)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
			<Button
				variant='success'
				className='mt-auto mb-3 align-self-center '
				onClick={() => {
					guardarActividad(
						{
							...activity,
							listaMetas: listadoMetas,
						},
						dispatch,
					);
				}}
			>
				Guardar Actividad{' '}
				{hayCambios && <ErrorOutline style={{ marginLeft: '10px', color: 'yellow' }} />}
			</Button>
			<Modal show={showModal} onHide={closeModal} size='xl' centered>
				<Modal.Header closeButton></Modal.Header>
				<Modal.Body className=' d-flex flex-column gap-4 '>
					<Form.Group className=' d-flex flex-column align-items-center w-100'>
						<Form.Control
							as='textarea'
							name='descripcion'
							className='ParrafoDescripcion'
							placeholder={'Meta/resultado esperado'}
							value={nuevaMeta.descripcion ?? ''}
							onChange={(e) => {
								setNuevaMeta({ ...nuevaMeta, descripcion: e.target.value });
							}}
							isInvalid={textLimitError(nuevaMeta.descripcion ?? '', 5000)}
						/>
						<Badge
							className=' mt-2 ms-auto'
							bg={textLimitError(nuevaMeta.descripcion ?? '', 5000) ? 'danger' : 'primary'}
						>
							{nuevaMeta.descripcion?.length}/{5000}
						</Badge>
					</Form.Group>
					<Form.Group className=' d-flex flex-column align-items-center w-100'>
						<Form.Control
							as='textarea'
							rows={4}
							name='editResultado'
							className='ParrafoResultado'
							placeholder={'Resultado alcanzado'}
							value={nuevaMeta.resultado ?? ''}
							onChange={(e) => {
								setNuevaMeta({ ...nuevaMeta, resultado: e.target.value });
							}}
							isInvalid={textLimitError(nuevaMeta.resultado ?? '', 5000)}
						/>
						<Badge
							className=' mt-2 ms-auto'
							bg={textLimitError(nuevaMeta.resultado ?? '', 5000) ? 'danger' : 'primary'}
						>
							{nuevaMeta.resultado?.length}/{5000}
						</Badge>
					</Form.Group>
					<Form.Group className=' d-flex flex-column align-items-center w-100'>
						<Form.Control
							as='textarea'
							rows={4}
							name='editObservaciones'
							className='ParrafoObservaciones'
							placeholder={
								'Observaciones (puede incorporarse cualquier detalle o información adicional que complemente los resultados alcanzados. También pueden ingresarse links a documentos o recursos anexo).'
							}
							value={nuevaMeta.observaciones ?? ''}
							onChange={(e) => {
								setNuevaMeta({ ...nuevaMeta, observaciones: e.target.value });
							}}
							isInvalid={textLimitError(nuevaMeta.observaciones ?? '', 5000)}
						/>
						<Badge
							className=' mt-2 ms-auto'
							bg={textLimitError(nuevaMeta.observaciones ?? '', 5000) ? 'danger' : 'primary'}
						>
							{nuevaMeta.observaciones?.length}/{5000}
						</Badge>
					</Form.Group>
					<Form.Select
						name='valoracion'
						className={`ParrafoObservaciones ${
							nuevaMeta.valoracion === -1 ? 'placeholder-option' : ''
						}}`}
						value={nuevaMeta.valoracion ?? -1}
						onChange={(e) => {
							setNuevaMeta({ ...nuevaMeta, valoracion: parseInt(e.target.value) });
						}}
					>
						<option key={'nn'} value={-1} disabled className=' placeholder-option '>
							Valoración general de la actividad y los resultados alcanzados
						</option>
						{valoraciones?.map((valoracion) => (
							<option
								key={`${valoracion.nom}-${valoracion.idValoracion}`}
								value={valoracion.idValoracion}
							>
								{valoracion.nom}
							</option>
						))}
					</Form.Select>
				</Modal.Body>
				<Modal.Footer>
					<button className='btn btn-primary' onClick={guardarBotonModal}>
						Guardar
					</button>
					<button className='btn btn-danger' onClick={closeModal}>
						Cancelar
					</button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default FormMetas;
