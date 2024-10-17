import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { Actividad, Institucione } from '@/types/ActivityProps';
import { getInstituciones } from '@/services/api/private/metas';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormOrgInst( { activity, saveData }: Props ) {
	const [arrayInstitucion, setArrayInstitucion] = useState<Institucione[]>(
		activity.listaInstituciones || [],
	);
	const [arraySearchInstitucion, setArraySearchInstitucion] = useState<Institucione[]>([]);

	const [name, setName] = useState('');
	const [ubicacion, setUbicacion] = useState('');

	useEffect(() => {
		saveData({ listaInstituciones: arrayInstitucion });
	}, [arrayInstitucion]);

	const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const isDuplicate = arrayInstitucion.some(
			(inst) => inst.nom === name && inst.ubicacion === ubicacion,
		);
		if (!isDuplicate) {
			setArrayInstitucion([...arrayInstitucion, { idInstitucion: 0, nom: name, ubicacion }]);
			setName('');
			setUbicacion('');
		} else {
			Swal.fire({
				title: 'Error',
				text: 'La institución ya existe en la lista.',
				icon: 'error',
				confirmButtonText: 'Cerrar',
			});
		}
	};

	const eliminarInstitucion = (index: number | null) => {
		if (index !== null) {
			setArrayInstitucion(arrayInstitucion.filter((item, i) => item && i !== index));
		}
	};

	const filterInstitucion = (data: Institucione[]) => {
		const newData = data.filter((inst) => inst.ubicacion !== 'NULL');
		return newData;
	};

	useEffect(() => {
		let debounce: ReturnType<typeof setTimeout>;

		const fetchData = (searchName?: string) => {
			getInstituciones(searchName)
				.then((data) => setArraySearchInstitucion(filterInstitucion(data.data)))
				.catch((error) => console.log(error));
		};

		if (name.length === 0) {
			debounce = setTimeout(() => fetchData(), 1000);
		} else {
			debounce = setTimeout(() => fetchData(name), 3000);
		}

		return () => clearTimeout(debounce);
	}, [name]);

	const handleInstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.currentTarget.value);

		const selectedInstitution = arraySearchInstitucion.find(
			(inst) => inst.nom === e.currentTarget.value,
		);

		if (selectedInstitution) {
			// Check for duplicate institutions
			const isDuplicate = arrayInstitucion.some(
				(inst) =>
					inst.nom === selectedInstitution.nom && inst.ubicacion === selectedInstitution.ubicacion,
			);

			if (!isDuplicate) {
				setArrayInstitucion((prev) => [...prev, selectedInstitution]);
				setName('');
			} else {
				Swal.fire({
					title: 'Error',
					text: 'La institución ya existe en la lista.',
					icon: 'error',
					confirmButtonText: 'Cerrar',
				});
				setName('');
			}
		}
	};

	const isUrlValid = (url: string) => {
		const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
		return urlPattern.test(url);
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



	return (
			<>
				<p>
					Ubicación se refiere al punto del mapa en donde se encuentre el lugar de la actividad.
					Utilice la herramienta de Google Maps para insertar el enlace de dicha ubicación.
				</p>
				<p>
					Si necesita ayuda para compartir el enlace, consulte el siguiente{' '}
					<span
						onClick={() => AlertBuscarUbicaciones()}
						className='fw-normal cursor-pointer'
						style={{ color: 'blue' }}
					>
						video
					</span>
					.
				</p>
				<Form
					className='d-flex align-items-center gap-2 justify-content-center w-100 pb-2'
					onSubmit={submitForm}
				>
					<Form.Control
						type='text'
						name='name'
						value={name}
						placeholder='Nombre de la institucion'
						onChange={handleInstChange}
						list='listSearchInstituciones'
					/>
					<datalist id='listSearchInstituciones'>
						{arraySearchInstitucion?.map((inst, i) => (
							<option key={i} value={inst.nom ?? '#'}>
								{inst.nom}
							</option>
						))}
					</datalist>

					<Form.Control
						type='text'
						name='ubicacion'
						placeholder='Ubicacion'
						value={ubicacion}
						onChange={(e) => setUbicacion(e.target.value)}
						isInvalid={ubicacion.length > 0 && !isUrlValid(ubicacion)}
					/>
					<Button
						variant='success'
						type='submit'
						disabled={name.length === 0 || ubicacion.length === 0 || !isUrlValid(ubicacion)}
					>
						Agregar
					</Button>
				</Form>
				<div className='ListaInstituciones'>
					<div style={{ maxHeight: '200px', overflowY: 'auto' }}>
						<Table striped bordered hover>
							<thead>
								<tr>
									<th>#</th>
									<th>Nombre</th>
									<th>Ubicacion</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{arrayInstitucion.map((item, index) => (
									<tr key={index}>
										<td>{index + 1}</td>
										<td
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{item.nom}
										</td>
										<td
											style={{
												maxWidth: '150px',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{item.ubicacion && <a href={item.ubicacion}>{item.ubicacion}</a>}
										</td>
										<td style={{ width: '15px' }}>
											<DeleteIcon color='error' onClick={() => eliminarInstitucion(index)} />
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				</div>
			</>


	);
}
