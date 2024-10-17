import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { RootState, useAppDispatch } from '@/redux/store';
import { useSelector } from 'react-redux';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import useAvailableHeight from '@/hooks/useAvailableHeight';
import { checkPermisoCurrentArea } from '@/redux/reducers/AuthReducer';
import { getBases } from '@/redux/actions/metasActions';
import useAuth from '@/hooks/useAuth';
import useAlert from '@/hooks/useAlert';

const PrivateLayout = ({ children }: any) => {
	const { isLogged } = useSelector((state: RootState) => state.auth);
	const { errorAlert } = useAlert();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const availableHeight = useAvailableHeight();
	const { isBasesLoaded } = useSelector((state: RootState) => state.metas); // Suponiendo que hay un estado para cargar las bases

	// Lógica de autenticación gestionada por el hook
	useAuth();

	// Fetch de bases de datos solo si no están cargadas
	useEffect(() => {
		if (!isBasesLoaded) {
			const fetchBases = async () => {
				const action = await dispatch(getBases());
				if (getBases.rejected.match(action) && action.payload?.error) {
					errorAlert(action.payload.error);
				}
			};
			fetchBases();
		}
	}, [dispatch, isBasesLoaded]);

	// Redireccionar si el usuario no está logueado
	useEffect(() => {
		if (!isLogged) {
			navigate('/login');
		}
	}, [isLogged, navigate]);

	// Chequeo de permisos en el área actual
	useEffect(() => {
		dispatch(checkPermisoCurrentArea());
	}, [dispatch, location.pathname]);

	return (
		<div className='d-flex flex-column'>
			<div className='vh-100 pb-4' style={{ backgroundColor: 'var(--bs-principal-background)' }}>
				<NavBar />
				<div
					className=' container-fluid'
					style={{ backgroundColor: 'var(--bs-principal-background)', height: availableHeight, paddingBottom: '1rem' }}
				>
					{children} {/* children se usa para componentes que envolvemos */}
					<Outlet /> {/* Outlet se usa para rutas anidadas */}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PrivateLayout;
