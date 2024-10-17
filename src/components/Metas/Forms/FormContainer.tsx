import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Button from 'react-bootstrap/Button';
import { ErrorOutline } from '@mui/icons-material';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

type FormContainerProps = {
	children: React.ReactNode;
	handleSave: () => void;
};

const FormContainer: React.FC<FormContainerProps> = ({ children, handleSave }) => {
	const { hayCambios } = useSelector((state: RootState) => state.actividad);

	// Función que renderiza el tooltip
	const renderTooltip = (props: any) => (
		<Tooltip id="button-tooltip" {...props}>
			Hay cambios sin guardar en el formulario
		</Tooltip>
	);

	return (
		<div className="d-flex flex-column h-100">
			<div className="my-2 mx-4">{children}</div>
			<Button
				variant="success"
				className="btn-primary mt-auto mb-3 align-self-center"
				onClick={handleSave}
			>
				Guardar Actividad
				{hayCambios && (
					<OverlayTrigger
						placement="top" // Puedes cambiar la posición del tooltip (e.g., "right", "bottom")
						overlay={renderTooltip}
					>
						<ErrorOutline style={{ marginLeft: '10px', color: 'yellow', cursor: 'pointer' }} />
					</OverlayTrigger>
				)}
			</Button>
		</div>
	);
};

export default FormContainer;
