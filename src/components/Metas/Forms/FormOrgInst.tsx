import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Row, Col,ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
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

interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
}

const handleSearch = async ({street,city,state,country}) => {

	const query = [street, city, state, country].filter(Boolean).join(', ');

    const params = new URLSearchParams({
        q: query, // Usamos 'q' en lugar de 'street', 'city', etc.
        format: 'json',
        addressdetails: '1',
        limit: '1',
    });

	try {

		console.log('Buscando dirección en OpenStreetMap:', params.toString());
	  const response = await fetch(
		`https://nominatim.openstreetmap.org/search?${params.toString()}`,
		{
		  headers: {
			'User-Agent': 'MiAplicacionInstituciones/1.0',
		  },
		}
	  );

	  const data = await response.json();

	  if (data && data.length > 0) {
		const result = data[0];
		const newLocation: LocationData = {
		  lat: parseFloat(result.lat),
		  lng: parseFloat(result.lon),
		  displayName: result.display_name,
		};

		return({ 
				lat: newLocation.lat, 
				lng: newLocation.lng, 
				address: newLocation.displayName 
			}
		
		);
		
	  } else {
		console.log('No se encontraron resultados para la dirección ingresada.');
	  }
	} catch (err) {
	  console.error('Error al buscar dirección:', err);
	  //setError('Ocurrió un error al consultar el servicio de ubicación.');
	} 

}




export default function FormOrgInst( { activity, saveData }: Props ) {
	const [arrayInstitucion, setArrayInstitucion] = useState<Institucione[]>(
		activity.listaInstituciones || [],
	);
	const [arraySearchInstitucion, setArraySearchInstitucion] = useState<Institucione[]>([]);

	const [name, setName] = useState('');
	const [ubicacion, setUbicacion] = useState('');
	const [coordenadas, setCoordenadas] = useState('');

	const [modoUbicacion, setModoUbicacion] = useState('direccion');

	const [direccion, setDireccion] = useState('');
	const [ciudad, setCiudad] = useState('Santa Fe');
	const [provincia, setProvincia] = useState('Santa Fe');

	const [pais, setPais] = useState('Argentina');

	useEffect(() => {
		saveData({ listaInstituciones: arrayInstitucion });
	}, [arrayInstitucion]);

	const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// 1. Construir las variables locales en base al modo seleccionado
		let finalUbicacion = ubicacion;
		let finalCoordenadas = coordenadas;
		let latitud = '';
		let longitud = '';
		

		if (modoUbicacion === 'direccion' && ubicacion.trim() === '') {
			// Generar string de dirección legible si no existía
			finalUbicacion = `${direccion}, ${ciudad}, ${provincia}, ${pais}`;

			// Buscar coordenadas en OpenStreetMap mediante la dirección
			const searchResult = await handleSearch({
				street: direccion,
				city: ciudad,
				state: provincia,
				country: pais
			});

			if (searchResult) {
				finalCoordenadas = `${searchResult.lat}, ${searchResult.lng}`;
				latitud = searchResult.lat.toString();
				longitud = searchResult.lng.toString();
			
			}
		} else if (modoUbicacion === 'coordenadas' && ubicacion.trim() === '') {
			// En modo coordenadas, podemos asignar una ubicación por defecto

			if (!finalUbicacion) {
				finalUbicacion = 'Ubicación por Coordenadas GPS';
				latitud = coordenadas.split(',')[0].trim();
				longitud = coordenadas.split(',')[1].trim();
			}
		}

		// 2. Validar duplicados usando las variables locales actualizadas


		if(isUrlValid(ubicacion)){
			finalUbicacion = ubicacion;

		}
		
		
		const isDuplicate = arrayInstitucion.some(
				(inst) => inst.nom.toLowerCase() === name.toLowerCase() && inst.ubicacion === finalUbicacion
		);
		

		if (isDuplicate) {
			Swal.fire({
				title: 'Error',
				text: 'La institución ya existe en la lista.',
				icon: 'error',
				confirmButtonText: 'Cerrar',
			});
			return;
		}

		// 3. Crear el nuevo objeto con la información procesada
		const nuevaInstitucion = {
			idInstitucion: 0,
			nom: name,
			ubicacion: finalUbicacion,
			pais: modoUbicacion === 'direccion' ? pais : '',
        	provincia: modoUbicacion === 'direccion' ? provincia : '',
        	ciudad: modoUbicacion === 'direccion' ? ciudad : '',
        	direccion: modoUbicacion === 'direccion' ? direccion : '',
			latitud: latitud,
			longitud: longitud
		};

		// 4. Actualizar el estado global del array
		setArrayInstitucion((prev) => [...prev, nuevaInstitucion]);

		// 5. Limpiar el formulario
		setName('');
		setDireccion('');
		setCiudad('Santa Fe');
		setProvincia('Santa Fe');
		setPais('Argentina');
		setCoordenadas('');
		setUbicacion('');
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
					Utilice la herramienta de Google Maps para copiar las coordenadas o escriba la direccion.
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
				<Form onSubmit={submitForm} className="w-100 p-3 border rounded bg-light">
						{/* Nombre de la institución */}
						<Row className="mb-3">
							<Col md={12}>
								<Form.Group controlId="name">
									<Form.Label><strong>Nombre de la Institución / Establecimiento</strong></Form.Label>
									<Form.Control
										type='text'
										name='name'
										value={name}
										placeholder='Ej: Escuela Rural N° 4 o Campo San José'
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
								</Form.Group>
							</Col>
						</Row>

						{/* Selector de Modo */}
						<Row className="mb-3">
							<Col md={12} className="text-center">
								<Form.Label className="d-block text-muted mb-2">¿Cómo deseas ingresar la ubicación?</Form.Label>
								<ToggleButtonGroup
									type="radio"
									name="modoUbicacion"
									value={modoUbicacion}
									onChange={(val) => setModoUbicacion(val)}
									className="w-100"
								>
									<ToggleButton id="tbtn-dir" value={'direccion'} variant="outline-primary">
										Dirección Postal
									</ToggleButton>
									<ToggleButton id="tbtn-geo" value={'coordenadas'} variant="outline-primary">
										Coordenadas (Lat / Lng)
									</ToggleButton>
								</ToggleButtonGroup>
							</Col>
						</Row>

						{/* MODO 1: DIRECCIÓN POSTAL */}
						{modoUbicacion === 'direccion' && (
							<>
								<Row className="g-3 mb-3">
									<Col md={6}>
										<Form.Group controlId="direccion">
											<Form.Label>Dirección (Calle y número)</Form.Label>
											<Form.Control
												type='text'
												placeholder='Ej: San Martín 1234'
												value={direccion}
												onChange={(e) => setDireccion(e.target.value)}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group controlId="ciudad">
											<Form.Label>Ciudad / Localidad</Form.Label>
											<Form.Control
												type='text'
												placeholder='Ej: Rosario'
												value={ciudad}
												onChange={(e) => setCiudad(e.target.value)}
											/>
										</Form.Group>
									</Col>
								</Row>
								<Row className="g-3 mb-3">
									<Col md={6}>
										<Form.Group controlId="provincia">
											<Form.Label>Provincia / Estado</Form.Label>
											<Form.Control
												type='text'
												placeholder='Ej: Santa Fe'
												value={provincia}
												onChange={(e) => setProvincia(e.target.value)}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group controlId="pais">
											<Form.Label>País</Form.Label>
											<Form.Control
												type='text'
												placeholder='Ej: Argentina'
												value={pais}
												onChange={(e) => setPais(e.target.value)}
											/>
										</Form.Group>
									</Col>
								</Row>
							</>
						)}

						{/* MODO 2: COORDENADAS GPS */}
						{modoUbicacion === 'coordenadas' && (
							<Row className="g-3 mb-3 align-items-end">
								<Col md={4}>
									<Form.Group controlId="coordenadas">
										<Form.Label>Latitud, Logitud</Form.Label>
										<Form.Control
											type='text'
											placeholder='Ej: -31.64636638193491, -60.706766441208096'
											value={coordenadas}
											onChange={(e) => setCoordenadas(e.target.value)}
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<div> Para obtener las coordenadas, dirijase a google maps, encuentre la ubicación y haga click derecho para copiar las coordenadas.</div>
								</Col>
							</Row>
						)}

						{/* Botón de envío */}
						<Row className="mt-4">
							<Col md={12}>
								<Button
									variant='success'
									type='submit'
									className='w-100 py-2 fw-bold'
									disabled={
										!name || 
										(modoUbicacion === 'direccion' && (!ciudad || !provincia || !pais)) ||
										(modoUbicacion === 'coordenadas' && (!coordenadas))
									}
								>
									Guardar Institución
								</Button>
							</Col>
						</Row>
					</Form>
				<>
					<div style={{ maxHeight: '250px', overflowY: 'auto' }}>
						<Table striped bordered hover>
							<thead>
								<tr>
									<th>#</th>
									<th>Nombre</th>
									<th>Ubicacion</th>
									<th>Coordenadas</th>
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
											{isUrlValid(item.ubicacion) && <a href={item.ubicacion}>{item.ubicacion}</a>}
											{item?.pais && <span>{item.direccion}, {item.ciudad}, {item.provincia}, {item.pais}</span>}
										</td>
										<td
											style={{
												maxWidth: '150px',
												overflow: 'hidden',

												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{item.latitud && item.longitud && <span>{item.latitud}, {item.longitud}</span>}
										</td>
										<td style={{ width: '15px' }}>
											<DeleteIcon color='error' onClick={() => eliminarInstitucion(index)} />
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				</>
			</>


	);
}
