import { Undo, Add } from '@mui/icons-material';
import { Button, Container, Form, FormGroup, InputGroup } from 'react-bootstrap';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import Select, { MultiValue } from 'react-select';
import { useCallback, useMemo, useState } from 'react';
import { Area, programasNom, UserData } from '@/types/UserProps';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import IconButton from '@mui/material/IconButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useProgramsAndAreas } from '@/hooks/useProgramsAndAreas';

const MySwal = withReactContent(Swal);

Swal.bindClickHandler();

Swal.mixin({
	toast: true,
}).bindClickHandler('#data-swal-custom-toast');

interface AdminMetasFormProps {
	currentCompleteAreaList: Area[];
	setCurrentCompleteAreaList: React.Dispatch<React.SetStateAction<Area[]>>;
	control: Control<UserData, any>;
	setValue: UseFormSetValue<UserData>;
	userAreaData: any;
}

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

const AdminMetasForm: React.FC<AdminMetasFormProps> = ({
	currentCompleteAreaList,
	setCurrentCompleteAreaList,
	control,
	setValue,
	userAreaData,
}) => {
	const { bases } = useSelector((state: RootState) => state.metas);
	const [selectedYear, setSelectedYear] = useState<OptionProps | null>(null);
	const [selectedProgram, setSelectedProgram] = useState<OptionProps | null>(null);
	const [areaHistory, setAreaHistory] = useState<(typeof userAreaData)[]>([userAreaData]);

	const { programs, userPrograms, areas, userAreas, isLoadingPrograms, isLoadingAreas } =
		useProgramsAndAreas({
			selectedYear: Number(selectedYear?.label) || null,
			selectedProgram: selectedProgram?.value || null,
			completeAreaList: currentCompleteAreaList,
		});

	const yearOptions = useMemo(
		() =>
			bases.lAreasProgramasAnios.map((item, index) => ({
				label: item.anio.toString(),
				value: index,
			})),
		[bases.lAreasProgramasAnios],
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
			html: programs
				.map((program) => {
					const isSelected = userPrograms.some((selected) => selected.value === program.value);
					return `<button class="swal2-program-button btn btn-primary btn-sm m-1" data-value="${
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
						const selectedProgram = programs.find((program) => program.value === selectedValue);
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

	return (
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
				{selectedYear && !isLoadingPrograms ? (
					<InputGroup className='d-flex'>
						<Controller
							name={generateFieldName('programas')}
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									options={userPrograms}
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
				{selectedProgram && !isLoadingAreas ? (
					<InputGroup className='d-flex'>
						<Controller
							name={generateFieldName('areas')}
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									options={areas}
									onChange={(selectedOption) => {
										const selectedAreas = selectedOption as MultiValue<OptionProps>;
										field.onChange(selectedAreas);
										editAreaData('add-area', selectedAreas as OptionProps[]);
									}}
									isMulti
									placeholder='Agregar Área'
									className='flex-grow-1'
									styles={{ multiValueRemove: (base) => ({ ...base, visibility: 'hidden' }) }}
									value={userAreas}
								/>
							)}
						/>
					</InputGroup>
				) : (
					<p>Seleccione un programa primero</p>
				)}
			</Form.Group>
		</Container>
	);
};

export default AdminMetasForm;
