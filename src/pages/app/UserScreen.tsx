import { useEffect, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import useAlert from '@/hooks/useAlert';
import { getPersonaUserData, updatePersonaUserData } from '@/services';
import { Persona } from '@/types/UserProps';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import UserForm from '@/components/Forms/General/UserForm';

type UserData = Omit<Persona, 'createdAt' | 'updatedAt' | 'deletedAt'>;


const UserScreen = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [initialValues, setInitialValues] = useState<UserData | null>(null);
	const { successAlert, errorAlert } = useAlert();

	useEffect(() => {
		setIsLoading(true);
		const userData = localStorage.getItem('user');
		if (userData) {
			const { userId } = JSON.parse(userData);
			getPersonaUserData(userId)
				.then((res) => {
					if (res && res.ok) {
						setInitialValues(res.data);
						setIsLoading(false);
					} else {
						errorAlert('Error al cargar la información del usuario: ' + res.error);
						setIsLoading(false);
					}
				})
				.catch((error) => {
					errorAlert('Error al cargar la información del usuario: ' + error.message);
					setIsLoading(false);
				});
		} else {
			errorAlert('No se encontró el usuario en localStorage');
			setIsLoading(false);
		}
	}, []);

	const handleUpdate: SubmitHandler<UserData> = async (values) => {
		try {
			const userData = localStorage.getItem('user');
			if (!userData) throw new Error('No se encontró el usuario en localStorage');
			const { userId } = JSON.parse(userData);
			const response = await updatePersonaUserData(userId, values as Persona);
			if (response && response.ok) successAlert('Información actualizada correctamente');
		} catch (err) {
			errorAlert((err as Error).message);
		}
	};

	return (
		<div className='d-flex justify-content-center'>
			<div
				className='container-sm p-4 my-4 border rounded bg-white shadow-lg'
				style={{ maxWidth: '600px' }}
			>
				<CommonTitle textAlign='center' underline bold padding='1rem'>
					Información Personal
				</CommonTitle>
				{isLoading ? (
					<LoadingSpinner />
				) : initialValues ? (
					<UserForm onSubmit={handleUpdate} initialValues={initialValues} />
				) : (
					<p>Error al cargar datos del usuario.</p>
				)}
			</div>
		</div>
	);
};

export default UserScreen;
