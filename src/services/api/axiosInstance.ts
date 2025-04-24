import axios from 'axios';
const publicAxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

const privateAxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

privateAxiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export { publicAxiosInstance, privateAxiosInstance };
