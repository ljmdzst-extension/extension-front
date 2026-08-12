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

const handleSearch = async ({street,city,state,country},tries = 0) => {


   	const params = new URLSearchParams({
        street: street,
        city: city,
        state: state,
        country: country,
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
		return undefined;
	  }
	} catch (err) {
	  console.error('Error al buscar dirección:', err);
	  if(tries < 3){

		await new Promise((resolve) => setTimeout(resolve, 2000)); // frenamos la ejecucion por 2 segundos antes de reintentar

      	return await handleSearch({ street, city, state, country }, tries + 1);

	  }

	  return undefined;
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
	const [guardando, setGuardando] = useState(false);

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

		setGuardando(true);

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

				if(!isValidCoordinates(finalCoordenadas)){
					Swal.fire({
						title: 'Error',
						text: 'Las coordenadas obtenidas no son válidas. Verifique la dirección ingresada.',
						icon: 'error',
						confirmButtonText: 'Cerrar',
					});

					setGuardando(false);

					return;
				}
			} else {

				Swal.fire({
					title: 'Error',
					text: 'No se pudieron obtener las coordenadas para la dirección ingresada. Verifique que la dirección sea correcta o ingrese las coordenadas manualmente. En el caso que la direccion sea correcta ignore este mensaje.',
					icon: 'error',
					confirmButtonText: 'Cerrar',
				});

				setGuardando(false);

				return;

			}
		} else if (modoUbicacion === 'coordenadas' && ubicacion.trim() === '') {


			if (!isValidCoordinates(coordenadas)) {
				Swal.fire({
					title: 'Error',
					text: 'Las coordenadas ingresadas no son válidas. Asegúrese de que estén en el formato correcto: "latitud, longitud".',
					icon: 'error',
					confirmButtonText: 'Cerrar',
				});

				setGuardando(false);

				return;

			}

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
			setGuardando(false);

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
		setGuardando(false);
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

		/*const selectedInstitution = arraySearchInstitucion.find(
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
		}*/
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


	const isValidCoordinates = (coord: string) => {

		const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
	    if(!regex.test(coord)){
			return false;
		}

		const [lat, lng] = coord.split(',').map(Number);
		return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
	}


	return (
			<>
				{/* <p>
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
				*/}
				<Form onSubmit={submitForm} className="w-100 p-3 border rounded bg-light">
						{/* Nombre de la institución */}
						<Row className="mb-3">
							<Col md={12}>
								<Form.Group controlId="institucion">
									<Form.Label><strong>Nombre de la Institución / Establecimiento</strong></Form.Label>
									<Form.Control
										type='text'
										name='institucion'
										value={name}
										placeholder='Nombre de la institución'
										onChange={handleInstChange}
										//list='listSearchInstituciones'

									/>

									{/*<datalist id='listSearchInstituciones'>
										{arraySearchInstitucion?.map((inst, i) => (
											<option key={i} value={inst.nom ?? '#'}>
												{inst.nom}
											</option>
										))}
									</datalist>


									*/}
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
												placeholder='Ej: San Martín 3234'
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
												placeholder='Ej: Santa Fe'
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
								<Col md={8}>
									<div> Para obtener las coordenadas de un punto específico, dirígete a Google Maps y busca la ubicación exacta que necesitas. Una vez encontrada, haz clic derecho directamente sobre el punto deseado en el mapa para desplegar el menú de opciones. En la primera línea de este menú verás los números de latitud y longitud; simplemente haz clic sobre ellos para copiarlos automáticamente en tu portapapeles. Luego pega los valores en el campo.</div>
								</Col>
							</Row>
						)}

						{/* Botón de envío */}
						<Row className="mt-4">
							<Col md={12}>

							{!guardando && (

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

							)}
							{guardando && (
								<Button variant='success' type='button' className='w-100 py-2 fw-bold' disabled>
									Guardando...
								</Button>
							)}
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
									<th>Ubicación</th>
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
											
											{item.latitud && item.longitud ? (
												<a
												href={`https://www.google.com/maps?q=${item.latitud},${item.longitud}`}
												target="_blank"
												rel="noopener noreferrer"
												>
												{item.pais ? `${item.direccion}, ${item.ciudad},${item.provincia}` : 'Ver en Google Maps'}
											</a>
											) : (
												<a
												href={item.ubicacion}
												target="_blank"
												rel="noopener noreferrer"
												>
												{item.ubicacion}	
												</a>
											)}
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
