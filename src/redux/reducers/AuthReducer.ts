import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authAsync, loginAsync, registerAsync } from '../actions/authAction';
import { Area } from '@/types/AuthProps';

interface UserData {
	userId: string;
	userName: string;
}

interface AuthState {
	userData: UserData;
	token: string;
	loading: boolean;
	permisos: string[];
	error: string | null | undefined;
	isLogged: boolean;
	puedeEditar: boolean;
	areas: Area[];
	categorias: string[];
	isAdmin: boolean;
}

const getUserDataFromLocalStorage = () => {
	const user = localStorage.getItem('user');
	const token = localStorage.getItem('token');
	const permisos = localStorage.getItem('permisos');
	const categorias = localStorage.getItem('categorias');
	const areas = localStorage.getItem('areas');
	const currentArea = localStorage.getItem('currentArea');

	return {
		user: user ? JSON.parse(user) : {},
		token: token ?? '',
		permisos: permisos ? JSON.parse(permisos) : [],
		categorias: categorias ? JSON.parse(categorias) : [],
		areas: areas ? JSON.parse(areas) : [],
		currentArea,
	};
};

function canEdit(permisos: string[], areas: Area[], currentArea: string | null): boolean {
	if (!permisos || !areas || !currentArea) {
		return false;
	}

	let idArea: number;

	try {
		idArea = JSON.parse(currentArea).idArea;
	} catch (e) {
		console.error('Error parsing JSON:', e);
		return false;
	}

	return (
		permisos.includes('METAS_EDICION') &&
		areas.some((area) =>
			area.listaProgramas.some((programa) =>
				programa.listaAreas.some((area) => area.idArea === idArea),
			),
		)
	);
}

const { user, token, permisos, categorias, areas, currentArea } = getUserDataFromLocalStorage();

const initialState: AuthState = {
	userData: user,
	token,
	permisos,
	loading: false,
	error: null,
	isLogged: !!token && !!user,
	areas,
	categorias,
	puedeEditar: canEdit(permisos, areas, currentArea),
	isAdmin: categorias.includes('ADMIN'),
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout(state) {
			state.userData = { userId: '', userName: '' };
			state.token = '';
			state.loading = false;
			state.error = null;
			state.isLogged = false;
			state.permisos = [];
			state.categorias = [];
			state.areas = [];
			console.log('usuario deslogueado');
		},
		loginFailed(state, action: PayloadAction<string>) {
			state.userData = { userId: '', userName: '' };
			state.token = '';
			state.loading = false;
			state.error = action.payload;
			state.isLogged = false;
			state.permisos = [];
			state.categorias = [];
			state.areas = [];
		},
		checkPermisoCurrentArea(state) {
			const currentArea = localStorage.getItem('currentArea');
			state.puedeEditar = canEdit(state.permisos, state.areas, currentArea ?? null);
		},
	},
	extraReducers: (builder) => {
		// LOGIN
		builder.addCase(loginAsync.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(loginAsync.fulfilled, (state, action) => {
			state.loading = false;
			state.isLogged = true;
			state.userData = {
				userId: action.payload.idUsuario,
				userName: action.payload.nom + ' ' + action.payload.ape,
			};
			state.token = action.payload.token;
			state.permisos = action.payload.permisos;
			state.categorias = action.payload.categorias;
			state.areas = action.payload.areas;
			state.puedeEditar = canEdit(state.permisos, state.areas, localStorage.getItem('currentArea'));
			state.isAdmin = action.payload.categorias.includes('ADMIN');
		});
		builder.addCase(loginAsync.rejected, (state, action) => {
			state.loading = false;
			state.error = (action.payload as { error: string }).error;
		});

		// AUTH
		builder.addCase(authAsync.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(authAsync.fulfilled, (state, action) => {
			state.loading = false;
			state.token = action.payload.token;
		});
		builder.addCase(authAsync.rejected, (state, action) => {
			state.loading = false;
			state.error = (action.payload as { error: string }).error;
		});

		// REGISTER
		builder.addCase(registerAsync.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(registerAsync.fulfilled, (state, action) => {
			state.loading = false;
			state.token = action.payload.token;
		});
		builder.addCase(registerAsync.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message;
		});
	},
});

export const { logout, loginFailed, checkPermisoCurrentArea } = authSlice.actions;

export default authSlice.reducer;
