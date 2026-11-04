import { useEffect, useRef, useState } from 'react';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Actividad, Meta, MetaCantidad, MetaCantidadTipo } from '@/types/ActivityProps';

interface Valoracion {
	idValoracion: number;
	nom: string;
}

const defaultNuevaMeta: Meta = {
	idMeta: 0,
	descripcion: '',
	resultado: '',
	observaciones: '',
	valoracion: 5,
	cantidades: [],
};

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

const FormMetas = ({ activity, saveData }: Props) => {
	const { bases, error } = useSelector((state: RootState) => state.metas);
	const [listadoMetas, setListadoMetas] = useState<Meta[]>(activity.listaMetas ?? []);
	const [nuevaMeta, setNuevaMeta] = useState<Meta>(defaultNuevaMeta);
	const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
	const [showModal, setShowModal] = useState(false);
	const indexCurrentMeta = useRef(-1);
	const [tipoCantidad, setTipoCantidad] = useState<MetaCantidadTipo>('Inscriptos');
	const [cantidad, setCantidad] = useState('');

	useEffect(() => {
		saveData({ listaMetas: listadoMetas });
	}, [listadoMetas]);

	useEffect(() => {
		if (!error && bases) {
			setValoraciones(bases.listaValoraciones);
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
		setNuevaMeta({ ...defaultNuevaMeta, cantidades: [] });
		setTipoCantidad('Inscriptos');
		setCantidad('');
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
		closeModal();
	};

	const editarMeta = (index: number) => {
		indexCurrentMeta.current = index;
		setNuevaMeta({
			...listadoMetas[index],
			cantidades: listadoMetas[index].cantidades ?? [],
		});
		setTipoCantidad('Inscriptos');
		setCantidad('');
		openModal();
	};

	const agregarCantidad = () => {
		if (!cantidad.trim()) return;
		const valor = Number(cantidad);
		if (!Number.isInteger(valor) || valor < 0) return;

		const cantidades = nuevaMeta.cantidades ?? [];
		const existente = cantidades.findIndex((item) => item.tipo === tipoCantidad);
		const nuevasCantidades = [...cantidades];
		const nuevaCantidad: MetaCantidad = { tipo: tipoCantidad, cantidad: valor };

		if (existente >= 0) {
			nuevasCantidades[existente] = nuevaCantidad;
		} else {
			nuevasCantidades.push(nuevaCantidad);
		}

		setNuevaMeta({ ...nuevaMeta, cantidades: nuevasCantidades });
		setCantidad('');
	};

	const eliminarCantidad = (index: number) => {
		setNuevaMeta({
			...nuevaMeta,
			cantidades: (nuevaMeta.cantidades ?? []).filter((_, itemIndex) => itemIndex !== index),
		});
	};

	const eliminarMeta = (index: number) => {
		const newListadoMetas = [...listadoMetas];
		newListadoMetas.splice(index, 1);
		setListadoMetas(newListadoMetas);
	};

	const alertVistaDetalle = (thisMeta: Meta) => {
		Swal.fire({
			html: `
			<div style='text-align: start;'>
				<h3>Detalles de la Meta: ${thisMeta.descripcion}</h3>
				<br />
				<p>Resultado: ${thisMeta.resultado}</p>
				<p>Observaciones: ${thisMeta.observaciones}</p>
				<p>Valoracion: ${valoracionesText(thisMeta.valoracion ?? 0)}</p>
				${thisMeta.cantidades && thisMeta.cantidades.length > 0 ? `<p>Cantidades:</p>` : ''}
				${(thisMeta.cantidades ?? [])
					.map((item) => `<ul>${item.tipo}: ${item.cantidad}</ul>`)
					.join('')}
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

	return (
		<>
			<Button
				onClick={() => {
					botonAgregarMeta();
				}}
				className='d-flex align-items-center my-2 ms-auto '
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

			<Modal show={showModal} onHide={closeModal} size='xl' centered>
				<Modal.Header closeButton></Modal.Header>
				<Modal.Body className=' d-flex flex-column gap-4 '>
					<Form.Group className=' d-flex flex-column align-items-center w-100'>
						<Form.Control
							as='textarea'
							name='descripcion'
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
						className={`${
							nuevaMeta.valoracion === 5 ? 'placeholder-option' : ''
						}}`}
						value={nuevaMeta.valoracion ?? 5}
						onChange={(e) => {
							setNuevaMeta({ ...nuevaMeta, valoracion: parseInt(e.target.value) });
						}}
					>
						{valoraciones?.map((valoracion) => (
							<option
								key={`${valoracion.nom}-${valoracion.idValoracion}`}
								value={valoracion.idValoracion}
							>
								{valoracion.nom}
							</option>
						))}
					</Form.Select>
					<Form.Group>
						<Form.Label>Cantidades por tipo</Form.Label>
						<div className='d-flex gap-2'>
							<Form.Select
								value={tipoCantidad}
								onChange={(e) => setTipoCantidad(e.target.value as MetaCantidadTipo)}
							>
								<option value='Cursos'>Cursos</option>
								<option value='Talleres'>Talleres</option>
								<option value='Estudiantes'>Estudiantes</option>
								<option value='Inscriptos'>Inscriptos</option>
								<option value='Aprobados'>Aprobados</option>
							</Form.Select>
							<Form.Control
								type='number'
								min={0}
								step={1}
								placeholder='Cantidad'
								value={cantidad}
								onChange={(e) => setCantidad(e.target.value)}
							/>
							<Button type='button' onClick={agregarCantidad}>
								Agregar
							</Button>
						</div>
						{(nuevaMeta.cantidades ?? []).length > 0 && (
							<Table size='sm' className='mt-3'>
								<tbody>
									{nuevaMeta.cantidades?.map((item, index) => (
										<tr key={item.tipo}>
											<td>{item.tipo}</td>
											<td>{item.cantidad}</td>
											<td className='text-end'>
												<Button
													type='button'
													variant='outline-danger'
													size='sm'
													onClick={() => eliminarCantidad(index)}
												>
													Eliminar
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)}
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<button className='btn btn-primary-custom' onClick={guardarBotonModal}>
						Guardar
					</button>
					<button className='btn btn-danger' onClick={closeModal}>
						Cancelar
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default FormMetas;
