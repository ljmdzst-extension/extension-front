import { createAsyncThunk } from '@reduxjs/toolkit';
import { Actividad } from '@/types/ActivityProps';

// export const SET_HAY_CAMBIOS = 'SET_HAY_CAMBIOS';
// export const setHayCambios = (valor: boolean) => ({
// 	type: SET_HAY_CAMBIOS,
// 	payload: { valor },
// });

export const CARGAR_DESCRIPCION = 'CARGAR_DESCRIPCION';
export const CargarDescripcionAction = (descripcion: string | null, ubicaciones: any[] | null) => ({
	type: CARGAR_DESCRIPCION,
	payload: { descripcion, ubicaciones },
});
export const CARGAR_MOTIVOCANCEL = 'CARGAR_MOTIVOCANCEL';
export const CargarMotivoCancel = (motivo: string | null) => ({
	type: CARGAR_MOTIVOCANCEL,
	payload: { motivo },
});

export const CARGAR_PERIODO = 'CARGAR_PERIODO';
export interface CargarPeriodoAction {
	type: typeof CARGAR_PERIODO;
	payload: {
		fechaDesde: string | null;
		fechaHasta: string | null;
		listaFechasPuntuales: { idFecha: number | null; fecha: string | null }[];
	};
}
export const cargarPeriodoAction = (
	fechaDesde: string | null,
	fechaHasta: string | null,
	listaFechasPuntuales: { idFecha: number | null; fecha: string | null }[],
): CargarPeriodoAction => ({
	type: CARGAR_PERIODO,
	payload: {
		fechaDesde,
		fechaHasta,
		listaFechasPuntuales,
	},
});

export const CARGAR_PIE = 'CARGAR_PIE';
export const cargarPIE = (objetivosSeleccionados: number[]) => ({
	type: CARGAR_PIE,
	payload: { objetivosSeleccionados },
});

export const CARGAR_INSTITUCION = 'CARGAR_INSTITUCIONES';

export const cargarInstitucionesAction = (
	instituciones: { idInstitucion: number | null; nom: string | null; ubicacion: string | null }[],
) => ({
	type: CARGAR_INSTITUCION,
	payload: {
		instituciones,
	},
});

export const CARGAR_META = 'CARGAR_META';
export const cargarMetaAction = (
	metas: {
		idMeta: number | null;
		descripcion: string | null;
		observaciones: string | null;
		resultado: string | null;
		valoracion: number | null;
	}[],
) => ({
	type: CARGAR_META,
	payload: {
		metas,
	},
});

export const CARGAR_RELACION = 'CARGAR_RELACION';
export const cargarRelacion = (seleecionadas: {
	relacionesSeleccionadas: number[];
	sippeSeleccionadas: number[];
}) => ({
	type: CARGAR_RELACION,
	payload: seleecionadas,
});

export const CARGAR_DATOS_ACTIVIDAD = 'CARGAR_DATOS_ACTIVIDAD';
export interface CargarDatosActividadAction {
	type: typeof CARGAR_DATOS_ACTIVIDAD;
	payload: Actividad;
}

export const CargarDatosActividadAction = createAsyncThunk(
	'CargarDatosActividadAction',
	async (id: number) => {
		const token = localStorage.getItem('token');
		try {
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL_METAS}/actividad/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error('Error al cargar los datos de actividad');
			}
			const data = await response.json();
			return data.data;
		} catch (error) {
			console.log('error', error);
		}
	},
);
