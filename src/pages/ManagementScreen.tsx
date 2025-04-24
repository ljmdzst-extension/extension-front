import { useNavigate } from 'react-router-dom';
import { Row, Col, Container, Button, Card } from 'react-bootstrap';
import CommonTitle from '@/components/Common/Text/CommonTitle';

const ManagementScreen = () => {
	const navigation = useNavigate();
	const handlerClick = (path: string) => navigation(path);

	const { userName } = JSON.parse(localStorage.getItem('user') ?? '{}') || { userName: 'Usuario' };

	const renderUserImage = () => {
		return (
			<div
				style={{
					width: '100%',
					height: '150px',
					backgroundColor: 'var(--bs-secondary)',
					color: 'white',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					fontSize: '2rem',
					fontWeight: 'bold',
				}}
			>
				{userName.charAt(0).toUpperCase()}
			</div>
		);
	};

	return (
		<Container
			className='my-2 border rounded h-100'
			style={{ backgroundColor: 'rgba(245, 245, 245, 0.959)' }}
		>
			<Row className='my-4'>
				{/* Columna de usuario */}
				<Col xs={12} md={3} className='d-flex justify-content-center'>
					<Card style={{ width: '18rem', textAlign: 'center' }}>
						{renderUserImage()}
						<Card.Body>
							<Card.Title>{userName}</Card.Title>
							<Card.Text>Bienvenido a tu panel de control</Card.Text>
							<Button
								className=' btn-secondary'
								size='sm'
								onClick={() => handlerClick('/gestion/user')}
							>
								Modificar información de usuario
							</Button>
						</Card.Body>
					</Card>
				</Col>

				<Col xs={12} md={9} className='d-flex justify-content-center'>
					<Card className="w-100" style={{  textAlign: 'center' }}>
						<Card.Body>
							<CommonTitle textAlign='center' underline bold size='small' padding='5px'>
								Seleccionar la plataforma a la que desee acceder
							</CommonTitle>
							<Button
								className='btn-secondary w-75 my-2'
								style={{ height: '50px' }}
								onClick={() => handlerClick('/gestion/metas')}
							>
								Planificaciones y resultados
							</Button>
							<Button
								className='btn-secondary w-75 my-2'
								style={{ height: '50px' }}
								onClick={() => handlerClick('/gestion/proyectos')}
								disabled
							>
								Gestor de Proyectos de Extensión
							</Button>
							<Button
								className='btn-secondary w-75 my-2'
								style={{ height: '50px' }}
								onClick={() => handlerClick('/gestion/programas')}
								disabled
							>
								Gestor de P.E.E.E
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default ManagementScreen;
