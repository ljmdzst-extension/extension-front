import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	cargarDatosActividad,
	setHayCambios,
	cargarDescripcion,
	cargarMotivoCancel,
	cargarPeriodo,
	cargarPIE,
	cargarInstituciones,
	cargarMeta,
	cargarRelacion,
} from '../actions/activityAction';
import { Actividad, FechasPuntuale, Institucione, Meta, Ubicacione } from '@/types/ActivityProps';

interface initialStateProps {
	isLoading: boolean;
	activity: Actividad;
	error: string | null;
	hayCambios: boolean;
}

const initialState: initialStateProps = {
	isLoading: true,
	error: null,
	hayCambios: false,
	activity: {
		idActividad: 0,
		idArea: 0,
		idUsuario: null,
		anio : 0,
		nro: 0,
		desc: '',
		motivoCancel: '',
		fechaDesde: new Date().toISOString(),
		fechaHasta: new Date().toISOString(),
		listaMetas: [],
		listaProgramasSIPPE: [],
		listaRelaciones: [],
		listaObjetivos: [],
		listaUbicaciones: [],
		listaEnlaces: [],
		listaFechasPuntuales: [],
		listaInstituciones: [],
	},
};

const actividadSlice = createSlice({
	name: 'actividad',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(setHayCambios, (state, action: PayloadAction<{ valor: boolean }>) => {
			state.hayCambios = action.payload.valor;
		});
		builder.addCase(cargarMotivoCancel, (state, action: PayloadAction<{ motivo: string }>) => {
			state.activity.motivoCancel = action.payload.motivo;
			console.log(state.activity.motivoCancel);
			console.log('cargo el motivo');
		});
		builder.addCase(
			cargarDescripcion,
			(state, action: PayloadAction<{ descripcion: string; ubicaciones: Ubicacione[] }>) => {
				state.activity.desc = action.payload.descripcion;
				state.activity.listaUbicaciones = action.payload.ubicaciones;
				console.log('cargo la descripcion');
			},
		);
		builder.addCase(
			cargarPeriodo,
			(
				state,
				action: PayloadAction<{
					fechaDesde: string;
					fechaHasta: string;
					listaFechasPuntuales: FechasPuntuale[];
				}>,
			) => {
				state.activity.fechaDesde = action.payload.fechaDesde;
				state.activity.fechaHasta = action.payload.fechaHasta;
				state.activity.listaFechasPuntuales = action.payload.listaFechasPuntuales;
				console.log('cargo el periodo');
			},
		);
		builder.addCase(
			cargarPIE,
			(state, action: PayloadAction<{ objetivosSeleccionados: number[] }>) => {
				state.activity.listaObjetivos = action.payload.objetivosSeleccionados;
			},
		);
		builder.addCase(
			cargarRelacion,
			(
				state,
				action: PayloadAction<{ relacionesSeleccionadas: number[]; sippeSeleccionadas: number[] }>,
			) => {
				state.activity.listaRelaciones = action.payload.relacionesSeleccionadas;
				state.activity.listaProgramasSIPPE = action.payload.sippeSeleccionadas;
			},
		);
		builder.addCase(cargarMeta, (state, action: PayloadAction<{ metas: Meta[] }>) => {
			state.activity.listaMetas = action.payload.metas;
		});
		builder.addCase(
			cargarInstituciones,
			(state, action: PayloadAction<{ instituciones: Institucione[] }>) => {
				state.activity.listaInstituciones = action.payload.instituciones;
			},
		);
		builder.addCase(cargarDatosActividad.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(cargarDatosActividad.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
		builder.addCase(cargarDatosActividad.fulfilled, (state, action: PayloadAction<Actividad>) => {
			return {
				...state,
				activity: {
					...state.activity,
					idActividad: action.payload.idActividad,
					idArea: action.payload.idArea,
					nro: action.payload.nro,
					anio : action.payload.anio,
					desc: action.payload.desc,
					motivoCancel: action.payload.motivoCancel,
					fechaDesde: action.payload.fechaDesde,
					fechaHasta: action.payload.fechaHasta,
					listaMetas: action.payload.listaMetas,
					listaProgramasSIPPE: action.payload.listaProgramasSIPPE,
					listaRelaciones: action.payload.listaRelaciones,
					listaObjetivos: action.payload.listaObjetivos,
					listaUbicaciones: action.payload.listaUbicaciones,
					listaEnlaces: action.payload.listaEnlaces,
					listaFechasPuntuales: action.payload.listaFechasPuntuales,
					listaInstituciones: action.payload.listaInstituciones,
				},
				isLoading: false,
			};
		});
	},
});

export default actividadSlice.reducer;
