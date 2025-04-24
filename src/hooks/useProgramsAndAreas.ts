import { useState, useEffect } from 'react';
import { Area } from '@/types/UserProps';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface OptionProps {
	value: number;
	label: string;
}

interface UseProgramsAndAreasProps {
	selectedYear: number | null;
	selectedProgram: number | null;
	completeAreaList: Area[];
}

export const useProgramsAndAreas = ({
	selectedYear,
	selectedProgram,
	completeAreaList,
}: UseProgramsAndAreasProps) => {
	const { bases } = useSelector((state: RootState) => state.metas);
	const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
	const [isLoadingAreas, setIsLoadingAreas] = useState(false);

	const [programs, setPrograms] = useState<OptionProps[]>([]);
	const [userPrograms, setUserPrograms] = useState<OptionProps[]>([]);
	const [areas, setAreas] = useState<OptionProps[]>([]);
	const [userAreas, setUserAreas] = useState<OptionProps[]>([]);

	// Cargar programas
	useEffect(() => {
		if (!selectedYear) {
			setPrograms([]);
			return;
		}

		setIsLoadingPrograms(true);
		const yearData = bases.lAreasProgramasAnios.find((item) => item.anio === selectedYear);
		const programOptions =
			yearData?.listaProgramas.map((program) => ({
				value: program.idPrograma,
				label: program.nom,
			})) || [];
		setPrograms(programOptions);
		setIsLoadingPrograms(false);
	}, [selectedYear, bases]);

	// Cargar programas seleccionados por el usuario
	useEffect(() => {
		if (!selectedYear) {
			setUserPrograms([]);
			return;
		}

		const selectedYearPrograms =
			completeAreaList
				.find((area) => area.anio === selectedYear)
				?.listaProgramas.map((program) => ({
					value: program.idPrograma,
					label: program.nom,
				})) || [];
		setUserPrograms(selectedYearPrograms);
	}, [selectedYear, completeAreaList]);

	// Cargar áreas
	useEffect(() => {
		if (!selectedYear || !selectedProgram) {
			setAreas([]);
			return;
		}

		setIsLoadingAreas(true);
		const programData = bases.lAreasProgramasAnios
			.find((item) => item.anio === selectedYear)
			?.listaProgramas.find((program) => program.idPrograma === selectedProgram);
		const areaOptions =
			programData?.listaAreas.map((area) => ({
				value: area.idArea,
				label: area.nom,
			})) || [];
		setAreas(areaOptions);
		setIsLoadingAreas(false);
	}, [selectedYear, selectedProgram, bases]);

	// Cargar áreas seleccionadas por el usuario
	useEffect(() => {
		if (!selectedYear || !selectedProgram) {
			setUserAreas([]);
			return;
		}

		const userSelectedAreas =
			completeAreaList
				.find((area) => area.anio === selectedYear)
				?.listaProgramas.find((program) => program.idPrograma === selectedProgram)
				?.listaAreas.map((area) => ({
					value: area.idArea,
					label: area.nom,
				})) || [];
		setUserAreas(userSelectedAreas);
	}, [selectedYear, selectedProgram, completeAreaList]);

	return {
		programs,
		userPrograms,
		areas,
		userAreas,
		isLoadingPrograms,
		isLoadingAreas,
	};
};
