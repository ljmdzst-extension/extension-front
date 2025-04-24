import React from 'react';
import { Button, Row, Col, InputGroup, FormSelect, Form } from 'react-bootstrap';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import FormInput from '@/components/Common/FormInput';
import { Persona } from '@/types/UserProps';

type UserData = Omit<Persona, 'createdAt' | 'updatedAt' | 'deletedAt'>;

interface UserFormProps {
	onSubmit: SubmitHandler<UserData>;
	initialValues: UserData;
}

const validationRules = {
	nom: {
		required: 'El nombre es obligatorio',
		pattern: {
			value: /^[a-zA-ZÀ-ÿ\s]{2,40}$/,
			message: 'El nombre solo puede contener letras y debe tener entre 2 y 40 caracteres',
		},
	},
	ape: {
		required: 'El apellido es obligatorio',
		pattern: {
			value: /^[a-zA-ZÀ-ÿ\s]{2,40}$/,
			message: 'El apellido solo puede contener letras y debe tener entre 2 y 40 caracteres',
		},
	},
	dom: {
		required: 'La dirección es obligatoria',
		minLength: { value: 5, message: 'La dirección debe tener al menos 5 caracteres' },
	},
	tel: {
		required: 'El teléfono es obligatorio',
		pattern: { value: /^[0-9]{7,10}$/, message: 'El teléfono debe tener entre 7 y 10 dígitos' },
	},
	email: {
		required: 'El email es obligatorio',
		pattern: {
			value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
			message: 'Debe ser un correo electrónico válido',
		},
	},
	ciudad: { required: 'La ciudad es obligatoria' },
	provincia: { required: 'La provincia es obligatoria' },
	pais: { required: 'El país es obligatorio' },
};

const fieldsConfig: Array<{
	name: keyof UserData;
	label: string;
	rules: any;
	disabled?: boolean;
}> = [
	{ name: 'nom', label: 'Nombre', rules: validationRules.nom },
	{ name: 'ape', label: 'Apellido', rules: validationRules.ape },
	{ name: 'tel', label: 'Teléfono', rules: validationRules.tel },
	{ name: 'dom', label: 'Dirección', rules: validationRules.dom },
	{ name: 'email', label: 'Email', rules: validationRules.email, disabled: true },
	{ name: 'ciudad', label: 'Ciudad', rules: validationRules.ciudad },
	{ name: 'provincia', label: 'Provincia', rules: validationRules.provincia },
	{ name: 'pais', label: 'País', rules: validationRules.pais },
];

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialValues }) => {
	const { control, handleSubmit } = useForm<UserData>({ defaultValues: initialValues });

	const DocumentInputGroup = () => (
		<Row className='mb-2'>
			<Col md={6}>
				<Form.Label>Documento</Form.Label>
				<InputGroup>
					<Col xs={4}>
						<Controller
							control={control}
							name='tipoDoc'
							render={({ field }) => (
								<FormSelect {...field} disabled size='sm'>
									<option value={0}>Tipo</option>
									<option value={1}>DNI</option>
									<option value={2}>Pasaporte</option>
									<option value={3}>Libreta Cívica</option>
									<option value={4}>Libreta de Enrolamiento</option>
								</FormSelect>
							)}
						/>
					</Col>
					<Col xs={8}>
						<Controller
							control={control}
							name='nroDoc'
							render={({ field }) => (
								<Form.Control {...field} disabled size='sm' placeholder='Número de Documento' />
							)}
						/>
					</Col>
				</InputGroup>
			</Col>
		</Row>
	);

	return (
		<Form onSubmit={handleSubmit(onSubmit)} noValidate>
			<DocumentInputGroup />
			<Row>
				{fieldsConfig.map(({ name, label, rules, disabled }, index) => (
					<Col md={6} key={index}>
						<FormInput
							control={control}
							name={name}
							label={label}
							rules={rules}
							disabled={disabled}
						/>
					</Col>
				))}
			</Row>
			<div className='d-flex justify-content-center mt-2'>
				<Button type='submit' className='btn btn-primary-custom'>
					Actualizar
				</Button>
			</div>
		</Form>
	);
};

export default UserForm;
