import React from 'react';
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import Button from 'react-bootstrap/Button';
import { ErrorOutline } from '@mui/icons-material';

type FormContainerProps = {
	children: React.ReactNode;
	handleSave: () => void;
};

const FormContainer: React.FC<FormContainerProps> = ({ children, handleSave }) => {
	const { hayCambios } = useSelector((state: RootState) => state.actividad);
	return (
		<div className='d-flex flex-column h-100'>
			<div className='my-2 mx-4'>{children}</div>
			<Button variant='success' className='mt-auto mb-3 align-self-center' onClick={handleSave}>
				Guardar Actividad
				{hayCambios && <ErrorOutline style={{ marginLeft: '10px', color: 'yellow' }} />}
			</Button>
		</div>
	);
};

export default FormContainer;
