import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from 'sweetalert2';
import { FormControl, ListGroup } from 'react-bootstrap';
import { ContentCopy, Edit, Delete } from '@mui/icons-material';
import { textLimitError } from '@/utils/validacionesForms';
import { Actividad, Ubicacione } from '@/types/ActivityProps';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

const FormDescriptionUbication = ({ activity, saveData }: Props) => {
	const [editandoDescripcion, setEditandoDescripcion] = useState(false);
	const [descripcion, setDescripcion] = useState<string>(activity.desc ?? '');
	const [ubicaciones, setUbicaciones] = useState<Ubicacione[]>(activity.listaUbicaciones ?? []);

	const [ubicacion, setUbicacion] = useState<string>('');
	const [ubicacionDescripcion, setUbicacionDescripcion] = useState<string>('');

	useEffect(() => {
		saveData({
			desc: descripcion,
			listaUbicaciones: ubicaciones,
		});
	}, [descripcion, ubicaciones]);

	const handleDescripcionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescripcion(event.target.value);
	};

	const handleUbicacionInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUbicacion(event.target.value);
	};

	const handleUbicacionDescripcionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUbicacionDescripcion(event.target.value);
	};

	const agregarUbicacion = () => {
		if (ubicacion.trim() !== '' && ubicacionDescripcion.trim() !== '') {
			const nuevaUbicacion = {
				idUbicacion: 0,
				desc: ubicacionDescripcion,
				enlace: ubicacion,
			};

			setUbicaciones([...ubicaciones, nuevaUbicacion]);
			setUbicacion('');
			setUbicacionDescripcion('');
		}
	};

	const handleClickEditarDescripcion = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		description: string,
	) => {
		event.preventDefault();
		if (editandoDescripcion === true && !textLimitError(description, 5000))
			setEditandoDescripcion(!editandoDescripcion);
		if (editandoDescripcion === false) setEditandoDescripcion(!editandoDescripcion);
	};

	const eliminarUbicacion = (index: number) => {
		const newUbicaciones = [...ubicaciones];
		newUbicaciones.splice(index, 1);
		setUbicaciones(newUbicaciones);
	};

	const AlertBuscarUbicaciones = () => {
		Swal.fire({
			title: 'Ubicaciones',
			html: ` 
				<p>
					Utilice la herramienta de Google Maps para insertar el enlace de la ubicación de la
					actividad. Si necesita ayuda, consulte en este video.
				</p>
				<p>Si necesita ayuda para compartir el enlace, consulte el siguiente video.</p>
			<iframe width="600" height="355" 
				src="https://www.youtube.com/embed/KoN9aRs6a4E" 
				title="YouTube video player" 
				allow="fullscreen;" 
				frameborder="0" 
				allow="accelerometer; 
				autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`,
			confirmButtonText: 'Cerrar',
			width: '80%',
		});
	};

	const isUrlValid = (url: string) => {
		const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
		return urlPattern.test(url);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<>
			<div className='Descripcion'>
				<h5> Descripción: </h5>
				<InputGroup className='mb-4 gap-1'>
					<Form.Control
						as='textarea'
						rows={3}
						style={{ resize: 'none' }}
						className='custom-scrollbar'
						aria-label='Inserte descripción'
						aria-describedby='basic-addon2'
						onChange={handleDescripcionChange}
						disabled={!editandoDescripcion}
						value={descripcion}
						isInvalid={textLimitError(descripcion ?? '', 2000)}
					/>
					<Form.Control.Feedback type='invalid' tooltip>
						Máximo 2000 caracteres
					</Form.Control.Feedback>
					<Button
						variant='secondary'
						id='button-addon2'
						style={{ width: '50px', height: '100px' }}
						onClick={(event) => handleClickEditarDescripcion(event, descripcion)}
					>
						<Edit />
					</Button>
				</InputGroup>
			</div>
			<div className='d-flex justify-content-between mb-2'>
				<h5>Ubicación:</h5>
				<Button variant='info' size='sm' onClick={AlertBuscarUbicaciones}>
					¿Cómo buscar link de ubicación?
				</Button>
			</div>
			<InputGroup className='gap-1'>
				<FormControl
					placeholder='Descripción de la ubicación'
					aria-label='Descripción de la ubicación'
					aria-describedby='basic-addon2'
					onChange={handleUbicacionDescripcionChange}
					value={ubicacionDescripcion}
				/>
				<FormControl
					placeholder='Inserte link de ubicación'
					aria-label='Inserte link de ubicación'
					aria-describedby='basic-addon2'
					onChange={handleUbicacionInputChange}
					value={ubicacion}
					isInvalid={ubicacion !== '' && !isUrlValid(ubicacion)}
				/>
				<Button
					variant='success'
					id='button-addon2'
					onClick={agregarUbicacion}
					disabled={ubicacion === '' || ubicacionDescripcion === '' || !isUrlValid(ubicacion)}
				>
					Agregar Ubicación
				</Button>
			</InputGroup>
			<ListGroup
				style={{ height: '150px', maxHeight: '150px', overflowY: 'auto' }}
				className='custom-scrollbar mt-2'
			>
				{ubicaciones.map((ubicacion, index) => (
					<ListGroup.Item key={index} className='w-75 align-self-center' variant='secondary'>
						<div className='d-flex justify-content-between'>
							<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								<a href={ubicacion.enlace ?? ''} target='_blank' rel='noopener noreferrer'>
									{ubicacion.desc ?? ''}
								</a>
							</div>
							<div className='d-flex'>
								<ContentCopy
									className='cursor-pointer mx-1'
									onClick={(event) => {
										event.stopPropagation();
										copyToClipboard(ubicacion.enlace ?? '');
									}}
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
		</>
	);
};

export default FormDescriptionUbication;
