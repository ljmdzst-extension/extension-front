import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Button from 'react-bootstrap/Button';
import { ErrorOutline } from '@mui/icons-material';
import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';

type FormContainerProps = {
	children: React.ReactNode;
	handleSave: () => void;
	handleDeleteActividad: () => void;
};

const FormContainer: React.FC<FormContainerProps> = ({ children, handleSave,handleDeleteActividad }) => {
	const { hayCambios } = useSelector((state: RootState) => state.actividad);

	return (
		<div className='d-flex flex-column h-100'>
			<div className='my-2 mx-4'>{children}</div>

			{/* Contenedor Flex para alinear los botones uno al lado del otro */}
			<div className='d-flex gap-2 mt-auto mb-3 align-self-center'>
				<Button
					variant='success'
					className='btn-primary'
					onClick={handleSave}
				>
					<div className='d-flex justify-content-between align-items-center'>
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

				<Button 
					variant='danger' 
					onClick={handleDeleteActividad}
				>
					Eliminar Actividad
				</Button>
			</div>
		</div>
	);
};

export default FormContainer;
