import axios from 'axios';
import { publicAxiosInstance } from '../../axiosInstance';
import { LoginResponse, RegisterProps } from '@/types/AuthProps';

const basePath = '/usr';

export const loginUser = async (email: string, pass: string) => {
	try {
		console.log(import.meta.env.VITE_API_BASE_URL);
		const response = await publicAxiosInstance.post<LoginResponse>(`${basePath}/login`, {
			email,
			pass,
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

export const registerUser = async (values: RegisterProps) => {
	try {
		const response = await publicAxiosInstance.post<LoginResponse>(`${basePath}/register`, values);
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

export const validateEmail = async (validationString: string) => {
	try {
		const response = await publicAxiosInstance.post<LoginResponse>(
			`${basePath}/validar/${validationString}`,
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