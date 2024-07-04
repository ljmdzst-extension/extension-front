import axios from 'axios';
import { UserFetch } from '@/types/UserProps';
import { privateAxiosInstance } from '../../axiosInstance';

const basePath = '/metas/admin/usr';

export const getAllUsers = async (): Promise<UserFetch> => {
	try {
		const response = await privateAxiosInstance.get<UserFetch>(basePath);
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