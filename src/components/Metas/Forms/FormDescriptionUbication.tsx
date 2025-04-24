import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from 'sweetalert2';
import { FormControl, ListGroup } from 'react-bootstrap';
import { ContentCopy, Edit, Delete, Save } from '@mui/icons-material';
import { textLimitError } from '@/utils/validacionesForms';
import { Actividad, Ubicacione } from '@/types/ActivityProps';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

// Función auxiliar para validar URLs
const isUrlValid = (url: string): boolean => /^(ftp|http|https):\/\/[^ "]+$/.test(url);

// Copiar texto al portapapeles
const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

// Componente UbicacionesList para lista de ubicaciones
const UbicacionesList = ({
	ubicaciones,
	eliminarUbicacion,
}: {
	ubicaciones: Ubicacione[];
	eliminarUbicacion: (index: number) => void;
}) => (
	<ListGroup
		className='custom-scrollbar mt-2'
		style={{ height: '150px', maxHeight: '150px', overflowY: 'auto' }}
	>
		{ubicaciones.map((ubicacion, index) => (
			<ListGroup.Item key={index} className='w-75 align-self-center' variant='secondary'>
				<div className='d-flex justify-content-between'>
					<a
						href={ubicacion.enlace ?? ''}
						target='_blank'
						rel='noopener noreferrer'
						style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
					>
						{ubicacion.desc ?? ''}
					</a>
					<div className='d-flex'>
						<ContentCopy
							className='cursor-pointer mx-1'
							onClick={() => copyToClipboard(ubicacion.enlace ?? '')}
						/>
						<Delete
							onClick={() => eliminarUbicacion(index)}
							style={{
								borderRadius: '20%',
								backgroundColor: 'red',
								color: 'white',
								cursor: 'pointer',
							}}
						/>
					</div>
				</div>
			</ListGroup.Item>
		))}
	</ListGroup>
);

const FormDescriptionUbication: React.FC<Props> = ({ activity, saveData }) => {
	const [editandoDescripcion, setEditandoDescripcion] = useState(false);
	const [descripcion, setDescripcion] = useState<string>(activity.desc ?? '');
	const [ubicaciones, setUbicaciones] = useState<Ubicacione[]>(activity.listaUbicaciones ?? []);
	const [ubicacion, setUbicacion] = useState<string>('');
	const [ubicacionDescripcion, setUbicacionDescripcion] = useState<string>('');

	useEffect(() => {
		if (!editandoDescripcion) {
			saveData({ desc: descripcion, listaUbicaciones: ubicaciones });
		}
	}, [editandoDescripcion, descripcion, ubicaciones]);

	const handleEditDescripcionToggle = () => {
		if (editandoDescripcion && textLimitError(descripcion, 2000)) return;
		setEditandoDescripcion(!editandoDescripcion);
	};

	const agregarUbicacion = useCallback(() => {
		if (ubicacion.trim() && ubicacionDescripcion.trim() && isUrlValid(ubicacion)) {
			setUbicaciones((prev) => [
				...prev,
				{ idUbicacion: 0, desc: ubicacionDescripcion, enlace: ubicacion },
			]);
			setUbicacion('');
			setUbicacionDescripcion('');
		}
	}, [ubicacion, ubicacionDescripcion]);

	const eliminarUbicacion = useCallback((index: number) => {
		setUbicaciones((prev) => prev.filter((_, i) => i !== index));
	}, []);

	// Mostrar la alerta con información sobre cómo obtener el enlace de ubicación
	const mostrarAlertaUbicaciones = useCallback(() => {
		Swal.fire({
			title: 'Ubicaciones',
			html: `<p>Utilice Google Maps para insertar el enlace de la ubicación de la actividad. Consulte este video si necesita ayuda.</p>
					<iframe width="600" height="355" src="https://www.youtube.com/embed/KoN9aRs6a4E" title="YouTube video player" allow="fullscreen;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`,
			confirmButtonText: 'Cerrar',
			width: '80%',
		});
	}, []);

	return (
		<>
			<div>
				<h5> Descripción: </h5>
				<InputGroup className='mb-4 gap-1'>
					<Form.Control
						as='textarea'
						rows={3}
						style={{ resize: 'none' }}
						className='custom-scrollbar'
						aria-label='Inserte descripción'
						disabled={!editandoDescripcion}
						value={descripcion}
						onChange={(e) => setDescripcion(e.target.value)}
						isInvalid={textLimitError(descripcion, 2000)}
					/>
					<Form.Control.Feedback type='invalid' tooltip>
						Máximo 2000 caracteres
					</Form.Control.Feedback>
					<Button variant='secondary' onClick={handleEditDescripcionToggle}>
						{editandoDescripcion ? <Save /> : <Edit />}
					</Button>
				</InputGroup>
			</div>
			<div className='d-flex justify-content-between mb-2'>
				<h5>Ubicación:</h5>
				<Button variant='info' size='sm' onClick={mostrarAlertaUbicaciones}>
					¿Cómo buscar link de ubicación?
				</Button>
			</div>
			<InputGroup className='gap-1'>
				<FormControl
					placeholder='Descripción de la ubicación'
					value={ubicacionDescripcion}
					onChange={(e) => setUbicacionDescripcion(e.target.value)}
				/>
				<FormControl
					placeholder='Inserte link de ubicación'
					value={ubicacion}
					onChange={(e) => setUbicacion(e.target.value)}
					isInvalid={!!ubicacion && !isUrlValid(ubicacion)}
				/>
				<Button
					variant='success'
					onClick={agregarUbicacion}
					disabled={!ubicacion || !ubicacionDescripcion || !isUrlValid(ubicacion)}
				>
					Agregar Ubicación
				</Button>
			</InputGroup>
			<UbicacionesList ubicaciones={ubicaciones} eliminarUbicacion={eliminarUbicacion} />
		</>
	);
};

export default FormDescriptionUbication;
