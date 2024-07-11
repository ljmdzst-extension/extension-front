
export interface FetchActividad {
	ok: boolean;
	data: Actividad;
	error: string;
}

export interface FetchActividades {
	ok: boolean;
	data: Actividad[];
	error: string;
}

export interface Actividad {
	idActividad: number;
	idArea: number;
	nro: number;
	desc: string;
	listaProgramasSIPPE: number[];
	listaObjetivos: number[];
	listaRelaciones: number[];
	idUsuario: null;
	fechaDesde: string;
	fechaHasta: string;
	motivoCancel: string;
	listaMetas: Meta[];
	listaUbicaciones: Ubicacione[];
	listaInstituciones: Institucione[];
	listaFechasPuntuales: FechasPuntuale[];
	listaEnlaces: Enlace[];
}

export interface Enlace {
	idEnlace: number;
	desc: string;
	link: string;
	idActividad: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: null;
}

export interface FechasPuntuale {
	idFecha: number;
	fecha: string;
}

export interface Institucione {
	idInstitucion: number;
	nom: string;
	ubicacion: string;
}

export interface Meta {
	idMeta: number;
	descripcion: string;
	resultado: string;
	observaciones: string;
	valoracion: number ;
}

export interface Ubicacione {
	idUbicacion: number;
	enlace: string;
	desc: string;
}
