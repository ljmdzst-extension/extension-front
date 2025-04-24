import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Button, Row, Col, Tabs, Tab, Container } from 'react-bootstrap';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormInput from '@/components/Common/FormInput';
import { Area, UserData } from '@/types/UserProps';
import { Close } from '@mui/icons-material';
import { putUsers } from '@/services';
import useAlert from '@/hooks/useAlert';
import AdminMetasForm from './components/AdminMetasForm';

interface FormUsersProps {
	userData: UserData;
	onClose: () => void;
	updateList: () => void;
}

const validationRules = {
	nom: { required: 'Nombre es requerido' },
	ape: { required: 'Apellido es requerido' },
	email: {
		required: 'Email es requerido',
		pattern: {
			value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
			message: 'Email inválido',
		},
	},
	pass: { required: 'Contraseña es requerida' },
};

const FormUsers: React.FC<FormUsersProps> = ({ userData, onClose, updateList }) => {
	const { errorAlert, successAlert } = useAlert();
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const [currentCompleteAreaList, setCurrentCompleteAreaList] = useState<Area[]>(userData.areas);

	const { handleSubmit, control, setValue } = useForm<UserData>({
		defaultValues: userData,
	});

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	// NOTE: Guardar Usuario

	const onSubmit = async (data: UserData) => {
		// TODO: volver a chequear cuando se arregle el back y agregar alertas
		try {
			data.areas = currentCompleteAreaList;
			console.log(data);
			await putUsers(data);
			successAlert('Usuario actualizado correctamente');
			await updateList();
			onClose();
		} catch (err) {
			errorAlert((err as Error).message);
			console.log(err);
		}
	};

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className='d-flex flex-column h-100'>
			<div className='d-flex justify-content-end'>
				<Close onClick={onClose} fontSize='small' className=' cursor-pointer' />
			</div>
			<Tabs variant='tabs' transition className=' mb-2' fill>
				<Tab eventKey='user' title='Usuario'>
					<Container>
						<Row>
							<Col>
								<FormInput
									control={control}
									name='persona.nom'
									label='Nombre'
									rules={validationRules.nom}
								/>
							</Col>
							<Col>
								<FormInput
									control={control}
									name='persona.ape'
									label='Apellido'
									rules={validationRules.ape}
								/>
							</Col>
						</Row>
						<Row>
							<Col>
								<FormInput
									control={control}
									name='usuario.email'
									label='Email'
									type='email'
									rules={validationRules.email}
								/>
							</Col>
							<Col>
								<Form.Group controlId='formPass' className='mb-2'>
									<Form.Label>Contraseña</Form.Label>
									<div className='d-flex align-items-center'>
										<Controller
											name='usuario.pass'
											control={control}
											rules={validationRules.pass}
											render={({ field, fieldState: { error } }) => (
												<div>
													<Form.Control
														size='sm'
														type={showPassword ? 'text' : 'password'}
														isInvalid={!!error}
														{...field}
													/>
													<Form.Control.Feedback type='invalid'>
														{error?.message}
													</Form.Control.Feedback>
												</div>
											)}
										/>
										<IconButton onClick={toggleShowPassword} size='small'>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</div>
								</Form.Group>
							</Col>
						</Row>
					</Container>
				</Tab>
				<Tab eventKey='metas' title='Planificaciones y resultados'>
					<AdminMetasForm
						control={control}
						currentCompleteAreaList={currentCompleteAreaList}
						setCurrentCompleteAreaList={setCurrentCompleteAreaList}
						setValue={setValue}
						userAreaData={userData.areas}
					/>
				</Tab>
				<Tab eventKey='gestor' title='Gestor' disabled>
					<div className=' d-flex justify-content-center align-items-center'>Gestor</div>
				</Tab>
			</Tabs>
			<Button size='sm' type='submit' variant='primary' className='mt-auto'>
				Guardar
			</Button>
		</Form>
	);
};

export default FormUsers;
