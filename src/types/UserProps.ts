export interface UserFetch {
	ok: boolean;
	data: UserData;
	error: null;
}

export interface UserPersonaFetch{
	ok: boolean;
	data: Persona;
	message: string;
	error: null;
}

export interface UserData {
	persona: Persona;
	usuario: Usuario;
	categorias: Categoria[];
	permisos: Permiso[];
	areas: Area[];
}

export interface Area {
	anio: number;
	listaProgramas: Programa[];
}

export interface Programa {
	idPrograma: number;
	nom: programasNom;
	listaAreas: ListaArea[];
}

export interface ListaArea {
	idArea: number;
	nom: string;
}

export enum programasNom {
	FormaciónYCapacitación = 'Formación y Capacitación',
	IntegraciónDeFunciones = 'Integración de Funciones',
	IntervenciónSociocultural = 'Intervención Sociocultural',
	ProgramasDeExtensiónSIPPPE = 'Programas de extensión (SIPPPE)',
	Publicaciones = 'Publicaciones',
	ÁreasEstratégicas = 'Áreas Estratégicas',
}

export interface Categoria {
	idCategoria: number;
	nombre: CategoriaNombre;
}

export enum CategoriaNombre {
	Admin = 'ADMIN',
	Eyc = 'EYC',
	EycEcoFinan = 'EYC_ECO_FINAN',
	GestionEyc = 'GESTION_EYC',
	GestionUnl = 'GESTION_UNL',
	ProgEXT = 'PROG_EXT',
}

export interface Permiso {
	idPermiso: number;
	nombre: PermisoNombre;
}

export enum PermisoNombre {
	MetasEdicion = 'METAS_EDICION',
	MetasLectura = 'METAS_LECTURA',
	PropIPLectura = 'PROP_IP_LECTURA',
}

export interface Persona {
	nroDoc: string;
	tipoDoc: number;
	ape: string;
	nom: string;
	tel: null | string;
	dom: null | string;
	email: null | string;
	ciudad: string;
	provincia: string;
	pais: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: null;
}

export interface Usuario {
	idUsuario: string;
	nroDoc: string;
	email: string;
	pass: string;
	idUnidadAcademica: number;
	pendiente: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: null;
}

export interface UserFormData {
	nom: string;
	ape: string;
	email: string;
	pass: string;
	anio: number | null;
	programas: number[];
	areas: number[];
}

// NOTE: Listado de Usuarios
export interface UserListFetch {
	ok: boolean;
	data: UserShortData[];
	error: null;
}

export interface UserShortData {
	idUsuario:  string;
	nroDoc: string;
	ape: string;
	nom: string;
	email: string;
	categorias: Categoria[];
	permisos: Permiso[];
}

export interface Categoria {
	idCategoria: number;
	nombre: CategoriaNombre;
}

export interface Permiso {
	idPermiso: number;
	nombre: PermisoNombre;
}

