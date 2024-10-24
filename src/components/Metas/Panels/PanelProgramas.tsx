import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import { Button, Card, Form, Image } from 'react-bootstrap';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import useAlert from '@/hooks/useAlert';
import { AreaProps, ProgramaProps } from '@/types/AppProps';
import { getProgramas } from '@/services/api/private/metas';

const currentYear = new Date().getFullYear();

export default function PanelProgramas() {
	const [year, setYear] = useState<number>(currentYear);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [programasTransformados, setProgramasTransformados] = useState<ProgramaProps[]>([]);
	const [indexActivity, setIndexActivity] = useState<AreaProps[]>([]);
	const [indexPrograma, setIndexPrograma] = useState<number>();
	const navigation = useNavigate();
	const { errorAlert } = useAlert();

	useEffect(() => {
		const obtenerProgramas = async () => {
			setIsLoading(true);
			const data = await getProgramas(year);

			if (!data.ok) {
				console.error('La respuesta no tiene la estructura esperada.');
				throw new Error(data.error || 'Error fetching data');
			}

			if (data.error) {
				errorAlert(data.error);
			} else {
				setProgramasTransformados(data.data);
				setIsLoading(false);
			}
		};
		obtenerProgramas();
	}, [year]); // Ejecutar cuando token o year cambian

	const openArea = (area: AreaProps) => {
		const areaSinLista = {
			idArea: area.idArea,
			nom: area.nom,
			idPrograma: indexPrograma,
			anio: year,
		};
		localStorage.setItem('currentArea', JSON.stringify(areaSinLista));
		navigation(`/gestion/metas/${areaSinLista.idPrograma}/${areaSinLista.idArea}`);
	};

	const yearsArray = Array.from({ length: currentYear - 2022 }, (_, index) => currentYear - index);

	const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedYear = parseInt(event.target.value);
		setIndexActivity([]);
		setYear(selectedYear);
	};

	return (
		<div className='ContainerCardMenu d-flex flex-column justify-content-start gap-1 '>
			{/* <h2>Titulo del Sistema</h2> */}

			<Image src='/assets/img/UNL_Logo.png' alt='logo-programas' style={{ width: '15rem' }} />
			{/* Antes validaba con is open */}
			<Form.Group className=' align-self-start d-flex align-items-center mb-2'>
				<label style={{ width: '140px' }}>Seleccione el año:</label>
				<Form.Select value={year} onChange={handleYearChange} size='sm' style={{ width: '100px' }}>
					{yearsArray.map((yearOption) => (
						<option key={yearOption} value={yearOption}>
							{yearOption}
						</option>
					))}
				</Form.Select>
			</Form.Group>
			<div className=' d-flex justify-content-start align-items-center gap-2 w-100  '>
				<Card style={{ width: '18rem' }}>
					<div className='imgCard'>
						<h1>
							<span className='fontYear'>{year}</span>
						</h1>
					</div>
					<Card.Body
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Card.Text style={{ textAlign: 'center' }}>
							Para obtener un análisis de datos generales, presione en "Ver resumen"
						</Card.Text>
						<Button className=' btn-primary' onClick={() => navigation('/gestion/metas/graficas')}>
							Ver Resumen
						</Button>
					</Card.Body>
				</Card>
				<div className=' d-flex align-items-center w-100 h-100 '>
					{isLoading ? (
						<LoadingSpinner />
					) : (
						<>
							{programasTransformados.length > 0 ? (
								<>
									<Tab.Container id='list-group-tabs-example' defaultActiveKey='#link1'>
										<Row>
											<Col sm={4}>
												<ListGroup
													style={{
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
														width: '400px',
														gap: '10px',
													}}
												>
													{programasTransformados.map((item, index) => (
														<ListGroup.Item
															action
															variant='secondary'
															onClick={() => {
																setIndexActivity(item.listaAreas);
																setIndexPrograma(item.idPrograma);
															}}
															key={index}
														>
															{item.nom}
														</ListGroup.Item>
													))}
												</ListGroup>
											</Col>
										</Row>
									</Tab.Container>
									<Tab.Container id='list-group-tabs-example' defaultActiveKey='#link1'>
										<Row>
											<Col sm={4}>
												<ListGroup
													style={{
														display: 'flex',
														flexDirection: 'column',
														width: '400px',
														maxHeight: '300px',
														gap: '10px',
														overflowY: 'auto',
													}}
													className='custom-scrollbar'
												>
													{indexActivity.map((elemento, index) => (
														<ListGroup.Item
															key={index}
															action
															variant='light'
															onClick={() => openArea(elemento)}
														>
															{elemento.nom}
														</ListGroup.Item>
													))}
												</ListGroup>
											</Col>
										</Row>
									</Tab.Container>{' '}
								</>
							) : (
								<div className=' text-center w-100'>
									<h2>El usuario no tiene programas cargados este año.</h2>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
