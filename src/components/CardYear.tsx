import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Card } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import axios from 'axios';

type YearProps = {
	title: string;
};

interface Programa {
	idPrograma: number;
	nom: string;
	anio: number;
	listaAreas: Area[];
}

interface Area {
	idArea: number;
	nom: string;
	idPrograma: number;
	listaActividades: any[];
}

export default function CardYear({ title }: YearProps) {
	const [programasTransformados, setProgramasTransformados] = useState<Programa[]>([]);
	const [indexActivity, setIndexActivity] = useState<Area[]>([]);
	const [indexPrgrama, setIndexPrograma] = useState<number>();
	const navigation = useNavigate();

	useEffect(() => {
		// Realizar la solicitud GET en el efecto
		axios
			.get(`${import.meta.env.VITE_API_BASE_URL_METAS}/programas/2023`)
			.then((response) => {
				const data = response.data;

				// Verifica si la respuesta tiene la estructura esperada
				if (data && data.ok && data.data) {
					const programas: Programa[] = data.data;
					setProgramasTransformados(programas);
					console.log(programas);
				} else {
					console.error('La respuesta no tiene la estructura esperada.');
				}
			})
			.catch((error) => {
				console.error('Error al realizar la solicitud GET:', error);
			});
	}, []); // Ejecutar una sola vez al montar el componente

	const openArea = (area: Area) => {
		const areaSinLista = {
			idArea: area.idArea,
			nom: area.nom,
			idPrograma: indexPrgrama,
		};
		localStorage.setItem('currentArea', JSON.stringify(areaSinLista));
		navigation(`/gestion/metas/${areaSinLista.idPrograma}/${areaSinLista.idArea}`);
	};

	return (
		<div className='ConteinerCardMenu d-flex flex-column'>
			{/* <Card style={{ width: '18rem' }}>
				<div className='imgCard'>
					<h1>
						<span className='fontYear'>{title}</span>
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
					<Button variant='success'>Ver Resumen</Button>
				</Card.Body>
			</Card> */}
			<h2>Titulo del Sistema</h2>
			{/* Antes validaba con is open */}
			<div className='menu'>
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
									gap: '10px',
								}}
							>
								{indexActivity.map((elemento, index) => (
									<ListGroup.Item key={index} action variant='light'>
										<div onClick={() => openArea(elemento)}>{elemento.nom}</div>
									</ListGroup.Item>
								))}
							</ListGroup>
						</Col>
					</Row>
				</Tab.Container>
			</div>
		</div>
	);
}
