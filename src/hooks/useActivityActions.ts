import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { cargarDatosActividad } from '@/redux/actions/activityAction';
import { deleteActivity, restoreActivity, suspendActivity } from '@/services/api/private/metas';
import useAlert from '@/hooks/useAlert';
import { useNavigate } from 'react-router-dom'

const useActivityActions = (activityId: number) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { errorAlert, successAlert } = useAlert();
    const { activity } = useSelector((state: RootState) => state.actividad);

    const handleSuspenderActividad = useCallback(() => {
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
                suspendActivity({ idActividad: activityId, motivoCancel: result.value }).then((response) => {
                    if (response.ok) {
                        successAlert('Actividad Anulada');
                        dispatch(cargarDatosActividad(activityId));
                    } else {
                        errorAlert(response.error);
                    }
                });
            }
        });
    }, [activityId, dispatch, errorAlert, successAlert]);

    const handleDeleteActividad = useCallback(() => {
        Swal.fire({
            title: '¿Desea eliminar la actividad?',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteActivity(activityId).then((response) => {
                    if (response.ok) {
                        successAlert('Actividad Eliminada !');
                        setTimeout(() => navigate(0), 1000);
                    } else {
                        errorAlert(response.error);
                    }
                });
            }
        });
    }, [activityId, errorAlert, navigate, successAlert]);

    const handleExitConfirmation = useCallback(() => {
        return Swal.fire({
            title: '¿Quiere salir de la sección?',
            text: 'Los cambios no guardados se perderán.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Salir',
            cancelButtonText: 'Cancelar',
        }).then((result) => result.isConfirmed);  // Devolvemos el valor directamente
    }, []);
    

    const showSuspensionModal = useCallback(() => {
        Swal.fire({
            title: 'Actividad Suspendida',
            text: `Motivo: ${activity.motivoCancel}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Anular Suspensión',
            cancelButtonText: 'Ocultar',
        }).then((result) => {
            if (result.isConfirmed) {
                restoreActivity(activityId).then((response) => {
                    if (response.ok) {
                        successAlert('Actividad restaurada');
                        dispatch(cargarDatosActividad(activityId));
                    } else {
                        errorAlert(response.error);
                    }
                });
            }
        });
    }, [activity.motivoCancel, activityId, dispatch, errorAlert, successAlert]);

    return { handleSuspenderActividad, handleDeleteActividad, handleExitConfirmation, showSuspensionModal };
};

export default useActivityActions;
