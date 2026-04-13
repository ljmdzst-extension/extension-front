
export interface FetchBasesProps {
	ok: boolean;
	data: BasesDataProps;
	error: string;
}

export interface BasesDataProps {
	lAreas: LArea[];
	listaObjetivos: ListaObjetivo[];
	listaProgramasSIPPE: ListaProgramasSIPPE[];
	listaRelaciones: ListaRelacione[];
	listaValoraciones: ListaValoracione[];
	unidadesAcademicas: UnidadesAcademica[];
	lAreasProgramasAnios: LAreasProgramasAnio[];
}

export interface LArea {
	idRelacion: number;
	nom: string;
	idTipoRelacion: number;
}

export interface LAreasProgramasAnio {
	anio: number;
	listaProgramas: ListaPrograma[];
}

export interface ListaPrograma {
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

export interface ListaObjetivo {
	idObjetivo: number;
	nom: string;
	detalle: null | string;
	tipoObjetivo: TipoObjetivo;
}

export interface TipoObjetivo {
	idTipoObj: number;
	nom: TipoObjetivoNom;
}

export enum TipoObjetivoNom {
	EjeTransversal = 'Eje Transversal',
	LíneaInstitucionalEstratégica = 'Línea Institucional Estratégica',
	ObjetivoEstratégico = 'Objetivo Estratégico',
}

export interface ListaProgramasSIPPE {
	idProgramaSippe: number;
	nom: string;
}

export interface ListaRelacione {
	idRelacion: number;
	nom: string;
	tipoRelacion: TipoRelacion;
	desde:Date | null;
	hasta:Date | null;
}

export interface TipoRelacion {
	idTipoRelacion: number;
	nom: TipoRelacionNom;
}

export enum TipoRelacionNom {
	InternaExtensión = 'interna_extensión',
	InternaUnl = 'interna_unl',
	UA = 'U.A.',
}

export interface ListaValoracione {
	idValoracion: number;
	nom: string;
}

export interface UnidadesAcademica {
	idUnidadAcademica: number;
	nom: string;
}


// INSTITUCIONES 

export interface FetchInstituciones {
	ok:    boolean;
	data:  Institucion[];
	error: null | string;
}

export interface Institucion {
	idInstitucion: number;
	nom:           string;
	ubicacion:     string;
}
