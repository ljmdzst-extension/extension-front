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

const FormContainer: React.FC<FormContainerProps> = ({ children, handleSave, handleDeleteActividad }) => {
    const { hayCambios } = useSelector((state: RootState) => state.actividad);

    return (
        <div className='d-flex flex-column mh-100 h-100 style={{ minHeight: 0 }}'>
            {/* El formulario/children toma el espacio restante y hace scroll si es necesario */}
            <div className='my-2 mx-4 flex-grow-1 overflow-y-auto'>
                {children}
            </div>

            {/* Sticky/Footer contenedor de botones */}
            <div className='d-flex gap-2 py-3 justify-content-center align-items-center bg-white border-top mt-auto flex-shrink-0'>
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
