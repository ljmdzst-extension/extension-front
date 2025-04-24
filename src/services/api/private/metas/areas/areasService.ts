import axios from 'axios';
import { FetchActividades, FetchListaActividades, fetchUploadFile } from '@/types/ActivityProps';
import { privateAxiosInstance } from '../../../axiosInstance';

const basePath = '/metas/areas';

export const getAreasResumen = async (
	id: string,
	year: string,
	offset: string,
	limit: string,
	keyword?: string,
): Promise<FetchActividades> => {
	const url = `${basePath}/resumen/${id}/${year}/${offset}/${limit}${keyword ? `/${keyword}` : ''}`;

	try {
		const response = await privateAxiosInstance.get<FetchActividades>(url);
		return response.data;
	} catch (error) {
		if (
			axios.isAxiosError(error) &&
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			throw new Error(error.response.data.error);
		} else {
			throw new Error('An unexpected error occurred');
		}
	}
};

export const getListaActividadesPorArea = async (
	idArea: string,
	anio: string,
): Promise<FetchListaActividades> => {
	const url = `${basePath}/${idArea}/${anio}`;

	try {
		const response = await privateAxiosInstance.get<FetchListaActividades>(url);
		return response.data;
	} catch (error) {
		if (
			axios.isAxiosError(error) &&
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			throw new Error(error.response.data.error);
		} else {
			throw new Error('An unexpected error occurred');
		}
	}
};

export const postArchivoPresupuesto = async (
	formData: FormData,
	anio: number,
	idArea: number,
	idPrograma: number,
): Promise<fetchUploadFile> => {
	const url = `${basePath}/subir/presupuesto/${anio}/${idPrograma}/${idArea}`;
	try {
		const response = await privateAxiosInstance.post<fetchUploadFile>(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		if (
			axios.isAxiosError(error) &&
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			throw new Error(error.response.data.error);
		} else {
			throw new Error('An unexpected error occurred');
		}
	}
};

export const getArchivoPresupuesto = async (
	anio: number,
	idArea: number,
	idPrograma: number,
): Promise<fetchUploadFile> => {
	const url = `${basePath}/descargar/presupuesto/${anio}/${idPrograma}/${idArea}`;

	try {
		const response = await privateAxiosInstance.get(url, {
			responseType: 'blob',
		});

		// Crear un Blob a partir de la respuesta
		const blob = new Blob([response.data], { type: response.headers['content-type'] });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `presupuesto_${anio}_${idArea}_${idPrograma}.xlsx`;

		// Iniciar la descarga del archivo
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Retorna el objeto indicando éxito
		return { ok: true, data: null, error: '' };
	} catch (error) {
		let errorMessage = 'An unexpected error occurred';

		if (axios.isAxiosError(error) && error.response && error.response.data) {
			// Si el error tiene la estructura esperada, extraer el mensaje
			errorMessage = error.response.data.error || errorMessage;
		}

		// Retorna el objeto indicando el error
		return { ok: false, data: null, error: errorMessage };
	}
};
