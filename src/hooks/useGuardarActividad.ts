import { useDispatch } from 'react-redux';
import { cargarDatosActividad, setHayCambios } from '@/redux/actions/activityAction';
import { putActivity } from '@/services/api/private/metas';
import { Actividad } from '@/types/ActivityProps';
import useAlert from './useAlert';
import { AppDispatch } from '@/redux/store';

export const useGuardarActividad = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { successAlert, errorAlert } = useAlert();

	const guardarActividad = (dato: Actividad) => {
		putActivity(dato)
			.then((data) => {
				if (data.ok) {
					successAlert('Actividad guardada');
					dispatch(setHayCambios({ valor: false }));
				} else errorAlert(`Error al guardar: ${data.error}`);
				dispatch(cargarDatosActividad(dato.idActividad));
				return null;
			})
			.catch((error) => errorAlert(JSON.stringify(error)));
	};

	return { guardarActividad };
};
