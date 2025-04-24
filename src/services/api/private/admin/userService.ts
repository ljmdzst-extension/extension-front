import axios from 'axios';
import { Persona, UserData, UserFetch, UserListFetch, UserPersonaFetch } from '@/types/UserProps';
import { privateAxiosInstance } from '../../axiosInstance';

const adminBasePath = '/metas/admin/usr';
const userBasePath = '/usr';


export const getAllUsers = async (): Promise<UserListFetch> => {
	try {
		const response = await privateAxiosInstance.get<UserListFetch>(adminBasePath);
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

export const getUserByID = async (id: string): Promise<UserFetch> => {
	try {
		const response = await privateAxiosInstance.get<UserFetch>(`${adminBasePath}/${id}`);
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

export const putUsers = async (data: UserData): Promise<UserFetch> => {
	try {
		const response = await privateAxiosInstance.put<UserFetch>(adminBasePath, data);
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

export const getPersonaUserData = async (id: string): Promise<UserPersonaFetch> => {
	try {
		const response = await privateAxiosInstance.get<UserPersonaFetch>(`${userBasePath}/${id}`);
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

export const updatePersonaUserData = async (idUser: string, data: Persona): Promise<UserPersonaFetch> => {
	try {
		const response = await privateAxiosInstance.put<UserPersonaFetch>(`${userBasePath}/${idUser}`, data);
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