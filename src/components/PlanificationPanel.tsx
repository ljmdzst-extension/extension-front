import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { CargarDatosActividadAction } from '@/redux/actions/activityAction';
import { SET_HAY_CAMBIOS } from '@/redux/reducers/ActivityReducer';

import useAvailableHeight from '@/hooks/useAvailableHeight';
import useAlert from '@/hooks/useAlert';

import { Button, Form, Modal } from 'react-bootstrap';
import { ArrowBack, Info } from '@mui/icons-material';
import Swal from 'sweetalert2';

import {
	FormArSecUU,
	FormDescriptionUbication,
	FormDocuments,
	FormMetas,
	FormObjetiveEst,
	FormOrgInst,
	FormPeriodo,
	FormPIE,
} from './Forms/metas';

import ActivityDetail from './metas/ActivityDetail';
import LoadingSpinner from './Spinner/LoadingSpinner';

type Props = {
	name: string;
	currentFormSelected: string;
	closePlanification: () => void;
	cleanFormSelected: () => void;
};

const FORM_TYPES = {
	DESCR: 'descr',
	DOCUMENTACION: 'documentacion',
	PIE: 'pie',
	AREA: 'area',
	PERIODO: 'periodo',
	OBJETIVO: 'objetivo',
	ORGANI: 'organi',
	METAS: 'metas',
};

const PlanificationPanel = ({
	name,
	closePlanification,
	currentFormSelected,
	cleanFormSelected,
}: Readonly<Props>) => {
	const dispatch = useDispatch<AppDispatch>();
	const { activity, isLoading, hayCambios } = useSelector(
		(state: RootState) => state.actividadSlice,
	);
	const { token, puedeEditar } = useSelector((state: RootState) => state.authSlice);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [indexForm, setIndexForm] = useState('');
	const [showModal, setShowModal] = useState(false);

	const availableHeight = useAvailableHeight();
	const { errorAlert, successAlert } = useAlert();

	const handleModalClose = () => setShowModal(false);
	const handleModalShow = () => setShowModal(true);

	const handleFormChange = (formType: string) => {
		setIndexForm(formType);
		setIsFormOpen(true);
	};

	const handleApiCall = async (
		url: string,
		method: string,
		body: object,
		successMessage: string,
	) => {
		try {
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});
			const data = await response.json();
			data.ok ? successAlert(successMessage) : errorAlert(data.error);
			dispatch(CargarDatosActividadAction(activity.idActividad));
		} catch (error) {
			errorAlert(JSON.stringify(error));
		}
	};

	const handleSuspenderActividad = () => {
		Swal.fire({
			title: '¿Desea suspender la actividad?',
			showDenyButton: true,
			denyButtonText: 'Cancelar',
			confirmButtonText: 'Suspender',
			input: 'textarea',
			inputPlaceholder: 'Ingrese el motivo de la suspensión',
			inputValidator: (value) => !value && 'Debe ingresar un motivo',
		}).then((result) => {
			if (result.isConfirmed) {
				handleApiCall(
					`${import.meta.env.VITE_API_BASE_URL_METAS}/actividad/cancel`,
					'PUT',
					{ idActividad: activity.idActividad, motivoCancel: result.value },
					'Actividad Anulada',
				);
			}
		});
	};

	const handleDeleteActividad = () => {
		Swal.fire({
			title: '¿Desea eliminar la actividad?',
			showCancelButton: true,
			confirmButtonText: 'Eliminar',
		}).then((result) => {
			if (result.isConfirmed) {
				handleApiCall(
					`${import.meta.env.VITE_API_BASE_URL_METAS}/actividad`,
					'DELETE',
					{ idActividad: activity.idActividad },
					'Actividad Eliminada !',
				);
				setTimeout(() => window.location.replace(''), 1000);
			}
		});
	};

	const handleSuspensionModal = () => {
		Swal.fire({
			title: 'Actividad Suspendida',
			text: `Motivo: ${activity.motivoCancel}`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Anular Suspensión',
			cancelButtonText: 'Ocultar',
		}).then((result) => {
			if (result.isConfirmed) {
				handleApiCall(
					`${import.meta.env.VITE_API_BASE_URL_METAS}/actividad/restore`,
					'PUT',
					{ idActividad: activity.idActividad },
					'Actividad restaurada',
				);
			}
		});
	};

	useEffect(() => {
		if (currentFormSelected) {
			handleFormChange(currentFormSelected);
		}
	}, [currentFormSelected]);

	return (
		<div className='h-100'>
			<Modal show={showModal} onHide={handleModalClose}>
				<Modal.Header>
					<Modal.Title>¿Quiere salir de la sección?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className='mb-3'>
							<Form.Label>Los cambios no guardados se perderán.</Form.Label>
						</Form.Group>
						<Form.Group className='d-flex justify-content-between'>
							<Button variant='danger' onClick={handleModalClose}>
								Cancelar
							</Button>
							<Button
								variant='success'
								onClick={() => {
									if (isFormOpen) {
										handleModalClose();
										setIsFormOpen(false);
										setIndexForm('');
										cleanFormSelected();
										dispatch(SET_HAY_CAMBIOS({ valor: false }));
									} else {
										closePlanification();
										handleModalClose();
									}
								}}
							>
								Salir
							</Button>
						</Form.Group>
					</Form>
				</Modal.Body>
			</Modal>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					<div className='d-flex justify-content-between align-items-center mb-2 border-bottom'>
						<h4
							className='text-break m-2 border-3'
							style={{
								borderBottom: '2px solid #0a5d52',
								textOverflow: 'ellipsis',
								overflow: 'hidden',
								whiteSpace: 'nowrap',
							}}
						>
							{name}
						</h4>
						<ArrowBack
							fontSize='large'
							className='m-1 rounded'
							style={{ background: '#0a5d52', color: 'white' }}
							color='primary'
							onClick={() => {
								if (hayCambios) {
									handleModalShow();
								} else if (isFormOpen) {
									setIsFormOpen(false);
									setIndexForm('');
									cleanFormSelected();
								} else {
									closePlanification();
								}
							}}
						/>
					</div>
					{indexForm === '' && activity.motivoCancel !== null && (
						<Button
							variant='outline-warning'
							className='d-flex align-items-center justify-content-center mx-auto text-black'
							onClick={handleSuspensionModal}
							size='sm'
							style={{ width: 'fit-content' }}
						>
							Actividad Suspendida
							<Info fontSize='medium' style={{ color: 'orange', marginLeft: '8px' }} />
						</Button>
					)}
					{!isFormOpen ? (
						<div className='d-flex flex-column h-100'>
							<div
								className='overflow-y-scroll custom-scrollbar'
								style={{ height: availableHeight - 170 }}
							>
								<ActivityDetail />
							</div>
							{activity.motivoCancel === null && puedeEditar && (
								<div className='d-flex justify-content-around mb-2'>
									<Button variant='warning' onClick={handleSuspenderActividad}>
										Suspender Actividad
									</Button>
									<Button variant='danger' onClick={handleDeleteActividad}>
										Eliminar Actividad
									</Button>
								</div>
							)}
						</div>
					) : (
						<div style={{ height: availableHeight - 110 }}>
							{(() => {
								switch (indexForm) {
									case FORM_TYPES.DESCR:
										return <FormDescriptionUbication />;
									case FORM_TYPES.DOCUMENTACION:
										return <FormDocuments />;
									case FORM_TYPES.PIE:
										return <FormPIE />;
									case FORM_TYPES.AREA:
										return <FormArSecUU />;
									case FORM_TYPES.PERIODO:
										return <FormPeriodo />;
									case FORM_TYPES.OBJETIVO:
										return <FormObjetiveEst />;
									case FORM_TYPES.ORGANI:
										return <FormOrgInst />;
									case FORM_TYPES.METAS:
										return <FormMetas />;
									default:
										return null;
								}
							})()}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PlanificationPanel;
