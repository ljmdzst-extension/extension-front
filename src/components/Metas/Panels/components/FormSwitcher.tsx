import { useDispatch, useSelector } from 'react-redux';
import {
	FormArSecUU,
	FormDescriptionUbication,
	FormDocuments,
	FormMetas,
	FormObjetiveEst,
	FormOrgInst,
	FormPeriodo,
	FormPIE,
} from '../../Forms';
import { AppDispatch, RootState } from '@/redux/store';
import { useGuardarActividad } from '@/hooks/useGuardarActividad';
import { useEffect, useState } from 'react';
import { setHayCambios } from '@/redux/actions/activityAction';
import FormContainer from '../../Forms/FormContainer';
import { Actividad } from '@/types/ActivityProps';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';

type FormSwitcherProps = {
	indexForm: string;
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

const FormSwitcher = ({ indexForm }: FormSwitcherProps) => {
	const dispatch = useDispatch<AppDispatch>();
	const { activity, isLoading } = useSelector((state: RootState) => state.actividad);
	const { guardarActividad } = useGuardarActividad();
	const [formData, setFormData] = useState<Actividad>(activity);

	useEffect(() => {
		setFormData(activity);
		dispatch(setHayCambios({ valor: false }));
	}, [activity, dispatch, indexForm]);

	const modifyFormData = (updatedFields: Partial<Actividad>) => {
		setFormData((prevData) => {
			const newData = { ...prevData, ...updatedFields };

			const cambios = JSON.stringify(activity) !== JSON.stringify(newData);
			dispatch(setHayCambios({ valor: cambios }));

			return newData;
		});
	};

	const handleSave = () => {
		guardarActividad(formData);
	};

	let form;

	switch (indexForm) {
		case FORM_TYPES.DESCR:
			form = <FormDescriptionUbication activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.DOCUMENTACION:
			form = <FormDocuments activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.PIE:
			form = <FormPIE activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.AREA:
			form = <FormArSecUU activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.PERIODO:
			form = <FormPeriodo activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.OBJETIVO:
			form = <FormObjetiveEst activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.ORGANI:
			form = <FormOrgInst activity={formData} saveData={modifyFormData} />;
			break;
		case FORM_TYPES.METAS:
			form = <FormMetas activity={formData} saveData={modifyFormData} />;
			break;
		default:
			form = null;
	}

	return (
		<>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<FormContainer handleSave={handleSave}>{form}</FormContainer>
			)}
		</>
	);
};

export default FormSwitcher;
