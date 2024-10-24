import React, { useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
	Form,
	Button,
	Row,
	Col,
	InputGroup,
	Tabs,
	Tab,
	Container,
	FormGroup,
} from 'react-bootstrap';
import Select, { MultiValue } from 'react-select';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import FormInput from '@/components/Common/FormInput';
import { Area, programasNom, UserData } from '@/types/UserProps';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Add, Close, Undo } from '@mui/icons-material';
import { putUsers } from '@/services';
import useAlert from '@/hooks/useAlert';

const MySwal = withReactContent(Swal);

Swal.bindClickHandler();

Swal.mixin({
	toast: true,
}).bindClickHandler('#data-swal-custom-toast');

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

interface OptionProps {
	value: number;
	label: string;
}

interface Permiso {
	idPermiso: number;
	nombre: string;
}

const permisosOptions: Permiso[] = [
	{ idPermiso: 1, nombre: 'METAS_LECTURA' },
	{ idPermiso: 2, nombre: 'METAS_EDICION' },
];

const FormUsers: React.FC<FormUsersProps> = ({ userData, onClose, updateList }) => {
	const { bases } = useSelector((state: RootState) => state.metas);
	const { errorAlert, successAlert } = useAlert();
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [selectedYear, setSelectedYear] = useState<OptionProps | null>(null);
	const [selectedProgram, setSelectedProgram] = useState<OptionProps | null>(null);
	const [loadingPrograms, setLoadingPrograms] = useState<boolean>(false);
	const [loadingAreas, setLoadingAreas] = useState<boolean>(false);
	const [currentCompleteAreaList, setCurrentCompleteAreaList] = useState<Area[]>(userData.areas);
	const [areaHistory, setAreaHistory] = useState<(typeof userData.areas)[]>([userData.areas]);

	const yearOptions = useMemo(
		() =>
			bases.lAreasProgramasAnios.map((item, index) => ({
				label: item.anio.toString(),
				value: index,
			})),
		[bases.lAreasProgramasAnios],
	);

	const { handleSubmit, control, setValue } = useForm<UserData>({
		defaultValues: userData,
	});

	const getPrograms = useCallback(
		(type = 'all'): OptionProps[] => {
			if (!selectedYear) return [];

			setLoadingPrograms(true);

			const yearPrograms =
				bases.lAreasProgramasAnios.find((item) => item.anio === Number(selectedYear.label))
					?.listaProgramas || [];

			const programs = yearPrograms.map((program) => ({
				label: program.nom,
				value: program.idPrograma,
			}));

			const filteredPrograms =
				type === 'user'
					? programs.filter((program) =>
							currentCompleteAreaList
								.filter((area) => area.anio === Number(selectedYear.label))
								.flatMap((area) => area.listaProgramas)
								.some((userProgram) => userProgram.idPrograma === program.value),
					  )
					: programs;

			setLoadingPrograms(false);
			return filteredPrograms;
		},
		[bases.lAreasProgramasAnios, currentCompleteAreaList, selectedYear],
	);

	const getAreas = useCallback(
		(type = 'all'): OptionProps[] => {
			if (!selectedProgram || !selectedYear) return [];

			setLoadingAreas(true);

			const yearPrograms =
				bases.lAreasProgramasAnios.find((item) => item.anio === Number(selectedYear.label))
					?.listaProgramas || [];

			const programAreas =
				yearPrograms.find((program) => program.idPrograma === selectedProgram.value)?.listaAreas ||
				[];

			const areas = programAreas.map((area) => ({ label: area.nom, value: area.idArea }));

			const filteredAreas =
				type === 'user'
					? areas.filter((area) =>
							currentCompleteAreaList
								.flatMap((completeArea) => completeArea.listaProgramas)
								.some((program) =>
									program.listaAreas.some((userArea) => userArea.idArea === area.value),
								),
					  )
					: areas;

			setLoadingAreas(false);
			return filteredAreas;
		},
		[selectedYear, selectedProgram, currentCompleteAreaList, bases.lAreasProgramasAnios],
	);

	const generateFieldName = useCallback(
		(type: 'anio' | 'programas' | 'areas'): any => {
			if (!selectedYear) return '';

			const yearIndex = Number(selectedYear.value);

			if (type === 'anio') {
				return `areas.${yearIndex}.anio`;
			}

			if (!selectedProgram) return '';

			const programIndex = currentCompleteAreaList[yearIndex]?.listaProgramas.findIndex(
				(program) => program.idPrograma === selectedProgram.value,
			);

			if (type === 'programas') {
				return `areas.${yearIndex}.listaProgramas.${programIndex}.nom`;
			} else if (type === 'areas') {
				return `areas.${yearIndex}.listaProgramas.${programIndex}.listaAreas`;
			}

			return '';
		},
		[currentCompleteAreaList, selectedProgram, selectedYear],
	);

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	// NOTE: Funcionalidad para agregar programas y areas

	let isUpdating = false; // Bandera para evitar actualizaciones múltiples

	const editAreaData = (type: string, data: OptionProps | OptionProps[]) => {
		if (isUpdating) return; // Evita que se ejecute si ya está en proceso
		isUpdating = true; // Indica que una actualización está en proceso

		const dataArray = Array.isArray(data) ? data : [data];

		setCurrentCompleteAreaList((prevState) => {
			const updatedList: Area[] = JSON.parse(JSON.stringify(prevState));
			const yearIndex = updatedList.findIndex((area) => area.anio === Number(selectedYear?.label));

			if (yearIndex !== -1) {
				const yearPrograms = updatedList[yearIndex].listaProgramas;

				if (
					type === 'add-program' &&
					!yearPrograms.some((program) => program.idPrograma === dataArray[0].value)
				) {
					yearPrograms.push({
						idPrograma: dataArray[0].value,
						nom: dataArray[0].label as programasNom,
						listaAreas: [],
					});
				}

				if (type === 'add-area') {
					const program = yearPrograms.find(
						(program) => program.idPrograma === selectedProgram?.value,
					);

					if (program) {
						dataArray.forEach((area) => {
							if (!program.listaAreas.some((existingArea) => existingArea.idArea === area.value)) {
								program.listaAreas.push({ idArea: area.value, nom: area.label });
							}
						});
					}
				}
			} else {
				updatedList.push({
					anio: Number(selectedYear?.label),
					listaProgramas: [
						{
							idPrograma: selectedProgram?.value as number,
							nom: selectedProgram?.label as programasNom,
							listaAreas: dataArray.map((area) => ({
								idArea: area.value,
								nom: area.label,
							})),
						},
					],
				});
			}

			setAreaHistory((prevHistory) => {
				const lastHistoryItem = prevHistory[prevHistory.length - 1];

				// Convertir las listas a strings para comparación sencilla
				const lastItemString = JSON.stringify(lastHistoryItem);
				const updatedListString = JSON.stringify(updatedList);

				if (lastItemString !== updatedListString) {
					return [...prevHistory, updatedList];
				}
				return prevHistory;
			});

			isUpdating = false; // Resetea la bandera para permitir futuras actualizaciones

			return updatedList;
		});
	};

	// NOTE: Alerta Agregar Programa
	const handleAddProgram = () => {
		MySwal.fire({
			title: 'Agregar Programa',
			animation: false,
			html: getPrograms('all')
				.map((program) => {
					const isSelected = getPrograms('user').some(
						(selected) => selected.value === program.value,
					);
					return `<button class="swal2-program-button btn btn-primary-custom btn-sm m-1" data-value="${
						program.value
					}" ${isSelected ? 'disabled' : ''}>${program.label}</button>`;
				})
				.join(''),
			toast: true,
			showCloseButton: true,
			showConfirmButton: false,
			showCancelButton: false,
			didOpen: () => {
				const toastContainer = MySwal.getContainer();
				const addButton = document.getElementById('addProgramButton');
				if (toastContainer && addButton) {
					const rect = addButton.getBoundingClientRect();
					toastContainer.style.position = 'absolute';
					toastContainer.style.left = `${rect.right - 220}px`; // A la derecha del botón
					toastContainer.style.top = `${rect.top}px`; // Alineado verticalmente
				}

				const buttons = document.querySelectorAll('.swal2-program-button');
				buttons.forEach((button) => {
					button.addEventListener('click', () => {
						const selectedValue = parseInt(button.getAttribute('data-value') as string);
						const selectedProgram = getPrograms('all').find(
							(program) => program.value === selectedValue,
						);
						if (selectedProgram) {
							editAreaData('add-program', selectedProgram);
							MySwal.close();
						}
					});
				});
			},
		});
	};

	// NOTE: Funcionalidad deshacer cambios de areas
	const handleUndo = () => {
		setAreaHistory((prevHistory) => {
			if (prevHistory.length > 0) {
				// Remover el último estado del historial y actualizar el estado actual
				const newHistory = prevHistory.slice(0, -1);
				setCurrentCompleteAreaList(newHistory[newHistory.length - 1]);
				return newHistory;
			}
			return prevHistory;
		});
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
					<Container className=' custom-scrollbar overflow-y-scroll ' style={{ maxHeight: '50vh' }}>
						<FormGroup controlId='formPermisos' className='mb-2'>
							<Form.Label>Permisos</Form.Label>
							<Controller
								name='permisos'
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										options={permisosOptions}
										isMulti
										getOptionLabel={(option) => option.nombre}
										getOptionValue={(option) => option.idPermiso.toString()}
										placeholder='Select permissions'
										onChange={(selectedOptions: MultiValue<Permiso>) => {
											console.log(selectedOptions);
											field.onChange(selectedOptions);
										}}
									/>
								)}
							/>
						</FormGroup>
						<Form.Label className='w-100 text-center text-decoration-underline m-1'>
							{' '}
							Seccion Programas y Areas
						</Form.Label>
						<Form.Group controlId='formMetas' className='mb-2'>
							<div className=' d-flex justify-content-between align-items-center '>
								<Form.Label>Año</Form.Label>
								<Button
									size='sm'
									variant='warning'
									onClick={handleUndo}
									className={` mb-2 ${areaHistory.length === 1 ? 'disabled' : ''}`}
								>
									Deshacer <Undo />
								</Button>
							</div>
							<Controller
								name={generateFieldName('anio')}
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										options={yearOptions}
										onChange={(selectedOption) => {
											setSelectedYear(selectedOption);
											setValue(generateFieldName('anio'), Number(selectedOption?.label), {
												shouldValidate: true,
												shouldDirty: true,
											});
											setSelectedProgram(null);
										}}
										value={selectedYear}
									/>
								)}
							/>
						</Form.Group>
						<Form.Group controlId='formPrograms' className='mb-2'>
							<Form.Label>Programas</Form.Label>
							{selectedYear && !loadingPrograms ? (
								<InputGroup className='d-flex'>
									<Controller
										name={generateFieldName('programas')}
										control={control}
										render={({ field }) => (
											<Select
												{...field}
												options={getPrograms('user')}
												onChange={(selectedOption) => {
													setSelectedProgram(selectedOption);
												}}
												placeholder='No hay programas cargados'
												className='flex-grow-1'
												value={selectedProgram}
											/>
										)}
									/>
									<IconButton className='ml-2' id='addProgramButton' onClick={handleAddProgram}>
										<Add />
									</IconButton>
								</InputGroup>
							) : (
								<p>Seleccione un año primero</p>
							)}
						</Form.Group>
						<Form.Group controlId='formAreas' className='mb-2'>
							<Form.Label>Áreas</Form.Label>
							{selectedProgram && !loadingAreas ? (
								<InputGroup className='d-flex'>
									<Controller
										name={generateFieldName('areas')}
										control={control}
										render={({ field }) => (
											<Select
												{...field}
												options={getAreas()}
												onChange={(selectedOption) => {
													const selectedAreas = selectedOption as MultiValue<OptionProps>;
													field.onChange(selectedAreas);
													editAreaData('add-area', selectedAreas as OptionProps[]);
												}}
												isMulti
												placeholder='Agregar Área'
												className='flex-grow-1'
												styles={{ multiValueRemove: (base) => ({ ...base, visibility: 'hidden' }) }}
												value={getAreas('user')}
											/>
										)}
									/>
								</InputGroup>
							) : (
								<p>Seleccione un programa primero</p>
							)}
						</Form.Group>
					</Container>
				</Tab>
				<Tab eventKey='gestor' title='Gestor'>
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
