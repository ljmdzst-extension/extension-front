import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PlaceIcon from '@mui/icons-material/Place';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import { Container, Row, Col, Card } from 'react-bootstrap';

const SelectGraphicsScreen = () => {
    const navigation = useNavigate();

    const currentYear = new Date().getFullYear();

    const options = [
        {
            title: 'Gráficos y Resúmenes',
            description: 'Visualiza métricas generales y resúmenes estadísticos',
            icon: <BarChartIcon style={{ fontSize: '2.5rem', color: '#0a5d52' }} />,
            path: '/gestion/metas/graficas',
        },
        {
            title: 'Gráfico de Gantt',
            description: 'Consulta la cronología y planificación de actividades por área',
            icon: <ViewTimelineIcon style={{ fontSize: '2.5rem', color: '#0a5d52' }} />,
            path: '/gestion/gantt',
        },
        {
            title: 'Instituciones',
            description: 'Visualizar la ubicación de las instituciones registradas',
            icon: <AccountBalanceIcon style={{ fontSize: '2.5rem', color: '#0a5d52' }} />,
            path: '/gestion/instituciones/' + currentYear,
        },
        {
            title: 'Ubicaciones por Año',
            description: 'Mapa de actividades anuales',
            icon: <PlaceIcon style={{ fontSize: '2.5rem', color: '#0a5d52' }} />,
            path: '/gestion/ubicaciones/' + currentYear,
        },
    ];

    return (
        <Container className="py-4 h-100 d-flex flex-column">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <CommonTitle bold underline textAlign="left">
                    Seleccionar gráficas
                </CommonTitle>
                <div 
                    className="p-2 d-flex align-items-center justify-content-center shadow-sm"
                    style={{ 
                        background: '#0a5d52', 
                        color: 'white', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, background-color 0.2s ease'
                    }}
                    onClick={() => navigation('/gestion/metas')}
                    title="Volver"
                >
                    <ArrowBack fontSize="medium" />
                </div>
            </div>

            {/* Grid de opciones */}
            <Row className="g-4 my-auto">
                {options.map((item, index) => (
                    <Col key={index} xs={15} md={6}>
                        <Card 
                            className="h-100 border-0 shadow-sm custom-card"
                            style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.25s ease-in-out',
                                borderRadius: '12px',
                                background: '#f8f9fa'
                            }}
                            onClick={() => navigation(item.path)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 93, 82, 0.15)';
                                e.currentTarget.style.background = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                e.currentTarget.style.background = '#f8f9fa';
                            }}
                        >
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className="p-3 me-3 rounded-3 bg-light d-flex align-items-center justify-content-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold text-dark">{item.title}</h5>
                                    <p className="mb-0 text-muted small">{item.description}</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default SelectGraphicsScreen;