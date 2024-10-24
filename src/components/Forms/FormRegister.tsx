import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button, Col, Form, FormSelect, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RegisterProps } from '@/types/AuthProps';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { registerAsync } from '@/redux/actions/authAction';
import Swal from 'sweetalert2';
import useAlert from '@/hooks/useAlert';

export interface UnidadesAcademicas {
	idUnidadAcademica: number;
	nom: string;
}

const FormRegister = () => {
	const [unidadesAcademicas, setUnidadesAcademicas] = React.useState<UnidadesAcademicas[]>([]);

	const dispatch = useDispatch<AppDispatch>();
	const { loading } = useSelector((state: RootState) => state.auth);
	const { errorAlert } = useAlert();

	const validationRules = {
		dni: { required: 'Campo requerido' },
		ape: { required: 'Campo requerido' },
		nom: { required: 'Campo requerido' },
		email: {
			required: 'Campo requerido',
			pattern: {
				value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
				message: 'El campo debe ser un correo valido',
			},
		},
		pass: { required: 'Campo requerido' },
		confirmPass: {
			required: 'Campo requerido',
			validate: (value: string, context: RegisterProps) =>
				value === context.pass || 'Las contraseñas no coinciden',
		},
		idUnidadAcademica: {
			required: 'Campo requerido',
			validate: (value: number) => value !== 0 || 'Campo requerido',
		},
	};

	const FormInput = ({ control, name, label, type = 'text', rules }: any) => (
		<Form.Group controlId={`form${name}`}>
			<Form.Label>{label}</Form.Label>
			<Controller
				name={name}
				control={control}
				rules={rules}
				render={({ field, fieldState: { error } }) => (
					<>
						<Form.Control size='sm' type={type} isInvalid={!!error} {...field} />
						<Form.Control.Feedback type='invalid'>{error?.message}</Form.Control.Feedback>
					</>
				)}
			/>
		</Form.Group>
	);

	const getUnidadesAcademicas = async () => {
		await fetch(`${import.meta.env.VITE_API_BASE_URL_AUTH}/bases/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => response.json())
			.then((data) => {
				setUnidadesAcademicas(data.data.unidadesAcademicas);
			})
			.catch((error) => console.log(error));
	};

	useEffect(() => {
		getUnidadesAcademicas();
	}, []);

	const { control, handleSubmit } = useForm<RegisterProps>({
		defaultValues: {
			dni: '',
			ape: '',
			nom: '',
			email: '',
			idUnidadAcademica: 0,
			pass: '',
			confirmPass: '',
		},
	});

	const handleRegister: SubmitHandler<RegisterProps> = async (values) => {
		const action = await dispatch(registerAsync(values));
		if (registerAsync.rejected.match(action)) {
			const { error } = action.payload as { error: string };
			errorAlert(error);
		} else {
			Swal.fire({
				title: 'Registro exitoso!',
				text: `Se le ha enviado un mail para validar el registro`,
				icon: 'success',
				confirmButtonText: 'Ok',
			});
		}
	};

	return (
		<Form
			onSubmit={handleSubmit(handleRegister)}
			className='border rounded p-5 bg-color-slate'
			noValidate
		>
			<p>Complete con sus datos</p>
			<Row>
				<Col>
					<FormInput
						control={control}
						name='dni'
						label='DNI'
						type='text'
						rules={validationRules.dni}
					/>
				</Col>
				<Col></Col>
			</Row>
			<Row>
				<Col>
					<FormInput
						control={control}
						name='nom'
						label='Nombre'
						type='text'
						rules={validationRules.nom}
					/>
				</Col>
				<Col>
					<FormInput
						control={control}
						name='ape'
						label='Apellido'
						type='text'
						rules={validationRules.ape}
					/>
				</Col>
			</Row>

			<FormInput
				control={control}
				name='email'
				label='Email'
				type='email'
				rules={validationRules.email}
			/>

			<Form.Group className=' position-relative mb-4'>
				<Form.Label>Unidad Académica</Form.Label>
				<Controller
					name='idUnidadAcademica'
					control={control}
					rules={validationRules.idUnidadAcademica}
					render={({ field, fieldState: { error } }) => (
						<>
							<FormSelect
								aria-label='Seleccione una unidad academica'
								isInvalid={!!error}
								{...field}
							>
								<option value={0}>Seleccione una unidad academica</option>
								{unidadesAcademicas.map((unidadAcademica: UnidadesAcademicas) => (
									<option
										key={unidadAcademica.idUnidadAcademica}
										value={unidadAcademica.idUnidadAcademica}
									>
										{unidadAcademica.nom}
									</option>
								))}
							</FormSelect>
							<Form.Control.Feedback type='invalid'>{error?.message}</Form.Control.Feedback>
						</>
					)}
				/>
			</Form.Group>
			<Row>
				<Col>
					<FormInput
						control={control}
						name='pass'
						label='Contraseña'
						type='password'
						rules={validationRules.pass}
					/>
				</Col>
				<Col>
					<FormInput
						control={control}
						name='confirmPass'
						label='Confirmar contraseña'
						type='password'
						rules={validationRules.confirmPass}
					/>
				</Col>
			</Row>

			<div className='d-flex justify-content-center'>
				<Button variant='primary' type='submit' className='btn-primary-custom' disabled={loading}>
					{loading ? 'Registrando...' : 'Registrarse'}
				</Button>
			</div>

			<div className=' mt-4'>
				<p>Una vez registrado, se le enviará un mail para validar el registro.</p>
				<p>
					Ya posee un usuario? Ingrese{' '}
					<Link to={'/login'} style={{ color: '#08473f' }} className=' text-decoration-underline'>
						aqui
					</Link>
					.
				</p>
			</div>
		</Form>
	);
};

export default FormRegister;
