import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import useAvailableHeight from '@/hooks/useAvailableHeight';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import ActivityContent from './components/ActivityContent';
import ActivityHeader from './components/ActivityHeader';
import FormSwitcher from './components/FormSwitcher';
import useActivityActions from '@/hooks/useActivityActions';

type Props = {
	name: string;
	currentFormSelected: string;
	closePlanification: () => void;
	cleanFormSelected: () => void;
};

const PlanificationPanel = ({
	name,
	closePlanification,
	currentFormSelected,
	cleanFormSelected,
}: Readonly<Props>) => {
	const { activity, isLoading, hayCambios } = useSelector((state: RootState) => state.actividad);
	const { puedeEditar } = useSelector((state: RootState) => state.auth);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [indexForm, setIndexForm] = useState('');

	const availableHeight = useAvailableHeight();

	const {
		handleDeleteActividad,
		handleExitConfirmation,
		handleSuspenderActividad,
		showSuspensionModal,
	} = useActivityActions(activity.idActividad);

	const handleFormChange = (formType: string) => {
		setIndexForm(formType);
		setIsFormOpen(true);
	};

	useEffect(() => {
		if (currentFormSelected) {
			handleFormChange(currentFormSelected);
		}
	}, [currentFormSelected]);

	const closePanels = async () => {
		if (hayCambios && isFormOpen) {
			const isConfirmed = await handleExitConfirmation();
			if (isConfirmed) {
				setIsFormOpen(false);
				setIndexForm('');
				cleanFormSelected();
			}
		} else {
			closePlanification();
		}
	};

	return (
		<div className='h-100'>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					<ActivityHeader name={name} closePanelsFunction={closePanels} />
					{indexForm === '' ? (
						<ActivityContent
							activity={activity}
							availableHeight={availableHeight}
							puedeEditar={puedeEditar}
							handleSuspenderActividad={handleSuspenderActividad}
							handleDeleteActividad={() => {
								handleDeleteActividad();
							}}
							handleSuspensionModal={() => showSuspensionModal()}
						/>
					) : (
						<div style={{ height: availableHeight - 110 }}>
							<FormSwitcher indexForm={indexForm} />
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PlanificationPanel;
