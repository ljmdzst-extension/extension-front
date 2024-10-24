import React, { useState, useEffect, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { Col, InputGroup } from 'react-bootstrap';

import formData from '@/mocks/activityFormData.json';
import Swal from 'sweetalert2';
import { ArrowBack, Search } from '@mui/icons-material';
import { Actividad } from '@/types/ActivityProps';
import useAlert from '@/hooks/useAlert';
import { cargarDatosActividad, setHayCambios } from '@/redux/actions/activityAction';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import { getListaActividadesPorArea, postActivity } from '@/services/api/private/metas';
import PlanificationPanel from '@/components/Metas/Panels/PlanificationPanel';
import { PanelActivityInfo } from '@/components/Metas/Panels/PanelActivityInfo';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';

interface Activity {
	idActividad: number;
	desc: string;
}

interface AreaData {
	idPrograma: number;
	idArea: number;
	nom: string;
	listaActividades: Actividad[]; // Reemplaza esto con el tipo correcto si es necesario
	anio: string;
}

export default function ActivityScreen() {
	const initialAreaValue: AreaData = localStorage.getItem('currentArea')
		? (JSON.parse(localStorage.getItem('currentArea')!) as AreaData) // Usamos ! para decirle a TypeScript que estamos seguros de que localStorage.getItem('currentArea') no será null
		: { idArea: 0, nom: '', listaActividades: [], anio: '', idPrograma: 0 }; // O proporciona un valor predeterminado adecuado para el tipo Area

	const [show, setShow] = useState(false);
	const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);
	const [term, setTerm] = useState('');
	const [nameActivity, setNameActivity] = useState('');
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const [arrayActivity, setArrayActivity] = useState<Activity[]>([]);
	const [isLoadingArrayActivity, setIsLoadingArrayActivity] = useState<boolean>(true);
	const [isPlanificationOpen, setIsPlanificationOpen] = useState(false);
	const [area, setArea] = useState<AreaData>(initialAreaValue);
	const [currentFormSelected, setCurrentFormSelected] = useState('');
	const [searchedActivities, setSearchedActivities] = useState<Activity[]>([]);

	const navigation = useNavigate();
	const { errorAlert } = useAlert();

	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, hayCambios } = useSelector((state: RootState) => state.actividad);
	const { puedeEditar } = useSelector((state: RootState) => state.auth);

	useEffect(() => {
		try {
			const areaString = localStorage.getItem('currentArea');
			if (areaString) {
				setArea(JSON.parse(areaString));
				// console.log('Actualizando area' + areaString);
			}
		} catch (error) {
			console.error('Error parsing area from localStorage:', error);
		}
	}, []);

	const mostrarActividades = useCallback(() => {
		getListaActividadesPorArea(area.idArea.toString(), area.anio)
			.then((response) => {
				setArrayActivity(response.data);
				setIsLoadingArrayActivity(false);
			})
			.catch((error) => {
				console.error('Error al realizar la petición: ', error);
				errorAlert('Error al realizar la petición: ' + error);
			});
	}, [area]);

	const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoadingModal(true);

		try {
			const res = await postActivity({
				idActividad: 0,
				idArea: area.idArea,
				nro: arrayActivity.length + 1,
				desc: term,
			} as Actividad);

			if (res.error) {
				errorAlert(res.error);
			} else {
				await mostrarActividades();
				setTerm('');
				setIsLoadingModal(false);
				handleClose();
				handleButtonClick(res.data.idActividad); // Abre la actividad creada
			}
		} catch (error) {
			console.error('Error al enviar la actividad:', error);
			setIsLoadingModal(false);
		}
	};

	useEffect(() => {
		mostrarActividades(); // Call mostrarActividades on component mount
		setSearchedActivities([]);
	}, [mostrarActividades]);

	const handleButtonClick = async (id: number) => {
		const result = await dispatch(cargarDatosActividad(id)).unwrap();
		setIsPlanificationOpen(!isPlanificationOpen);
		setNameActivity(result.desc);
	};

	const closePlanification = () => {
		setIsPlanificationOpen(!isPlanificationOpen);
		mostrarActividades();
		setSearchedActivities([]);
	};

	const selectCurrentForm = (formName: string) => {
		if (currentFormSelected === '') {
			setCurrentFormSelected(formName);
			return;
		}

		if (!hayCambios) {
			dispatch(setHayCambios({ valor: false }));
			setCurrentFormSelected(formName);
			return;
		}

		Swal.fire({
			title: '¿Estás seguro?',
			text: 'Se perderán los cambios no guardados',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Si, cambiar',
			cancelButtonText: 'No, cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				setCurrentFormSelected(formName);
				dispatch(setHayCambios({ valor: false }));
			}
		});
	};

	const cleanFormSelected = () => {
		setCurrentFormSelected('');
	};

	const onSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const filteredActivities = arrayActivity.filter((activity) =>
				activity.desc.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase()),
			);
			setSearchedActivities(filteredActivities);
		},
		[arrayActivity],
	);
	useEffect(() => {
		onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
	}, [isPlanificationOpen, onSearchChange]);

	return (
		<div className=' d-flex flex-column h-100'>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Crear Actividad</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={submitForm}>
						<Form.Group className='mb-3' controlId='exampleForm.ControlInput1'>
							<Form.Label>Ingrese la descripción de la actividad</Form.Label>
							<Form.Control
								type='nombre'
								placeholder='Descripción'
								autoFocus
								as='textarea'
								rows={2}
								style={{ resize: 'none' }}
								value={term}
								onChange={(e) => setTerm(e.target.value)}
							/>
						</Form.Group>
						<Button variant='success' type='submit' disabled={isLoadingModal}>
							Crear
						</Button>
					</Form>
				</Modal.Body>
			</Modal>
			<div
				className=' d-flex align-items-center justify-content-between border rounded-3 p-1 my-1'
				style={{ backgroundColor: '#fefefe' }}
			>
				<CommonTitle underline bold>
					{area?.nom}
				</CommonTitle>
				<div className={`rounded ${isPlanificationOpen ? 'd-none' : ''}`}>
					<CommonIconWithTooltip
						tooltipText='Atras'
						Icon={ArrowBack}
						onClick={() => {
							navigation('/gestion/metas');
						}}
						style={{
							background: '#0a5d52',
							color: 'white',
							borderRadius: '.3rem',
							fontSize: '34px',
						}}
					/>
				</div>
			</div>

			<div className={` h-100 d-flex justify-content-around gap-1 mx-3 `}>
				{/* NOTE: SIDEBAR - LISTADO ACTIVIDADES - NAVEGACIÓN FORMS */}
				<Col
					sm={3}
					className={` d-flex flex-column border-end border-2 rounded-3 ${
						isPlanificationOpen && !puedeEditar ? 'd-none' : ''
					} `}
					style={{ backgroundColor: '#fefefe' }}
				>
					{!isPlanificationOpen ? (
						<div style={{ maxHeight: 'calc(100vh - 130px)', height: '100%' }}>
							{isLoadingArrayActivity ? (
								<LoadingSpinner />
							) : (
								<div className=' d-flex flex-column h-100 p-2 '>
									<CommonTitle
										bold
										underline
										size='small'
										textAlign='center'
										color='var(--bs-secondary)'
									>
										Listado de Actividades
									</CommonTitle>

									<InputGroup className='my-2' size='sm'>
										<Form.Control
											onChange={onSearchChange}
											size='sm'
											placeholder='Buscar actividad'
											aria-label='Activities-search'
											aria-describedby='basic-addon1'
										/>
										<InputGroup.Text id='basic-addon1'>
											<Search />
										</InputGroup.Text>
									</InputGroup>
									<ListGroup className=' mb-2 overflow-y-auto custom-scrollbar pe-2 '>
										{(searchedActivities.length > 0 ? searchedActivities : arrayActivity).map(
											(item, index) => (
												<ListGroup.Item
													action
													title={item.desc}
													className={`text-break mx-auto my-1 rounded d-flex justify-content-center align-items-center list-item-hover`}
													key={index}
													onClick={() => {
														handleButtonClick(item.idActividad);
													}}
												>
													<span
														style={{
															textOverflow: 'ellipsis',
															overflow: 'hidden',
															fontWeight: 'normal',
															whiteSpace: 'nowrap',
														}}
													>
														{item.desc}
													</span>
												</ListGroup.Item>
											),
										)}
									</ListGroup>
									<Button
										className=' mt-2 align-self-end mt-auto btn-primary'
										onClick={handleShow}
										disabled={!puedeEditar}
									>
										Agregar Actividad
									</Button>
								</div>
							)}
						</div>
					) : (
						<>
							{/* NOTE: NAVEGACION FORMULARIOS */}
							{isLoading ? (
								<LoadingSpinner />
							) : (
								<div className=' p-2'>
									<CommonTitle
										bold
										underline
										size='small'
										textAlign='center'
										color='var(--bs-secondary)'
									>
										Formularios
									</CommonTitle>
									<ListGroup>
										{formData.map((item, index) => (
											<ListGroup.Item
												action
												className={`text-break mx-auto my-1 rounded d-flex justify-content-center align-items-center ${
													currentFormSelected === item.index
														? 'bg-primary text-light'
														: 'bg-secondary text-light'
												}`}
												title={item.Title}
												key={index}
												onClick={() => {
													selectCurrentForm(item.index);
												}}
											>
												<span
													style={{
														textOverflow: 'ellipsis',
														overflow: 'hidden',
														fontWeight: 'normal',
														whiteSpace: 'nowrap',
													}}
												>
													{item.Title}
												</span>
											</ListGroup.Item>
										))}
									</ListGroup>
								</div>
							)}
						</>
					)}
				</Col>
				{/* NOTE: VISTA AREA - BOTONES PRESUPUESTO */}
				<Col
					sm={isPlanificationOpen && !puedeEditar ? '12' : 9}
					className=' border-2 rounded-3 h-100'
					style={{ backgroundColor: '#fefefe' }}
				>
					{!isPlanificationOpen && (
						<PanelActivityInfo
							anio={initialAreaValue.anio}
							idArea={initialAreaValue.idArea}
							idPrograma={initialAreaValue.idPrograma}
							cantidadActividades={arrayActivity.length}
						/>
					)}

					{isPlanificationOpen && (
						<PlanificationPanel
							name={nameActivity}
							closePlanification={closePlanification}
							currentFormSelected={currentFormSelected}
							cleanFormSelected={cleanFormSelected}
						/>
					)}
				</Col>
			</div>
		</div>
	);
}
