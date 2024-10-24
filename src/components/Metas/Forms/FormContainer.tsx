import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Button from 'react-bootstrap/Button';
import { ErrorOutline } from '@mui/icons-material';
import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';

type FormContainerProps = {
	children: React.ReactNode;
	handleSave: () => void;
};

const FormContainer: React.FC<FormContainerProps> = ({ children, handleSave }) => {
	const { hayCambios } = useSelector((state: RootState) => state.actividad);

	console.log(hayCambios);

	return (
		<div className='d-flex flex-column h-100'>
			<div className='my-2 mx-4'>{children}</div>
			<Button
				variant='success'
				className='btn-primary mt-auto mb-3 align-self-center'
				onClick={handleSave}
			>
				<div className=' d-flex justify-content-between align-items-center'>
					Guardar Actividad
					{hayCambios && (
						<CommonIconWithTooltip
							tooltipText='Hay cambios sin guardar en el formulario'
							Icon={ErrorOutline}
							style={{
								marginLeft: '.5rem',
								color: 'yellow',
								cursor: 'pointer',
								fontSize: '1.3rem',
							}}
						/>
					)}
				</div>
			</Button>
		</div>
	);
};

export default FormContainer;
