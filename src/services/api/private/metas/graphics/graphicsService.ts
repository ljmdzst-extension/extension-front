import axios from 'axios';
import { GraphicsResponse } from '@/types/GraphicsProps';
import { privateAxiosInstance } from '../../../axiosInstance';

const basePath = '/metas/graficos';

export const getGraphicsData = async (year?: number): Promise<GraphicsResponse> => {
	try {
		const response = await privateAxiosInstance.get<GraphicsResponse>(
			`${basePath}/general/${year}`,
		);
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

export const getGraphicsDataByArea = async (
	year?: number,
	area?: number,
): Promise<GraphicsResponse> => {
	try {
		const response = await privateAxiosInstance.get<GraphicsResponse>(
			`${basePath}/area/${year}/${area}`,
		);
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

export const getGraphicsDataGantt = async (anio?: number): Promise<GraphicsResponse> => {

	try {
		const response = await privateAxiosInstance.get<GraphicsResponse>(
			`${basePath}/gantt/${anio}`,
		);
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
}
