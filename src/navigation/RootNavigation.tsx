import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';

const Layout = lazy(() => import('@/components/Layout/Layout'));
const PrivateLayout = lazy(() => import('@/components/Layout/PrivateLayout'));
const HelpScreen = lazy(() => import('@/pages/HelpScreen'));
const LoginScreen = lazy(() => import('@/pages/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('@/pages/auth/RegisterScreen'));
const ConfirmScreen = lazy(() => import('@/pages/auth/ConfirmScreen'));
const AdminScreen = lazy(() => import('@/pages/app/AdminScreen'));
const UserScreen = lazy(() => import('@/pages/app/UserScreen'));

const ActivityScreen = lazy(() => import('@/pages/metas/ActivityScreen'));
const GraphicsScreen = lazy(() => import('@/pages/metas/GraphicsScreen'));
const MainScreen = lazy(() => import('@/pages/metas/MainScreen'));
const ManagementScreen = lazy(() => import('@/pages/ManagementScreen'));
const ResumenAreaScreen = lazy(() => import('@/pages/metas/ResumenAreaScreen'));

const ProyectosScreen = lazy(() => import('@/pages/gestor/ProyectosScreen'));
const ProjectFormScreen = lazy(() => import('@/pages/gestor/ProjectFormScreen'));
const ProjectSumScreen = lazy(() => import('@/pages/gestor/ProjectSumScreen'));

const RootNavigation = () => {
	return (
		<Suspense
			fallback={
				<div className='vh-100'>
					<LoadingSpinner />
				</div>
			}
		>
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<LoginScreen />} />
					<Route path='login' element={<LoginScreen />} />
					<Route path='register' element={<RegisterScreen />} />
					<Route path='register/validation/:validationString' element={<ConfirmScreen />} />
					<Route path='ayuda' element={<HelpScreen />} />
				</Route>
				<Route path='/gestion' element={<PrivateLayout />}>
					<Route index element={<ManagementScreen />} />
					<Route path='user' element={<UserScreen />} />
					<Route path='admin' element={<AdminScreen />} />
					<Route path='metas' element={<MainScreen />} />
					<Route path='metas/graficas' element={<GraphicsScreen />} />
					<Route path='metas/:idPrograma/:idArea' element={<ActivityScreen />} />
					<Route path='metas/:idPrograma/:idArea/resumen' element={<ResumenAreaScreen />} />
					<Route path='proyectos' element={<ProyectosScreen />} />
					<Route path='proyectos/summ/:id' element={<ProjectSumScreen />} />
					<Route path='proyectos/form/:id' element={<ProjectFormScreen />} />
				</Route>
				<Route path='*' element={<div>404 Not Found</div>} />
			</Routes>
		</Suspense>
	);
};

export default RootNavigation;
