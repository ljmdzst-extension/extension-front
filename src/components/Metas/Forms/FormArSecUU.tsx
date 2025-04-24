import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Row, Col, Container } from 'react-bootstrap';
import { ListaProgramasSIPPE } from '@/types/BasesProps';
import { Actividad } from '@/types/ActivityProps';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';

const animatedComponents = makeAnimated();

interface Relacion {
	idRelacion: number;
	nom: string;
	tipoRelacion: {
		idTipoRelacion: number;
		nom: string;
	};
}

interface Option {
	value: number;
	label: string;
}

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormArSecUU({ activity, saveData }: Props) {
	const { bases, error } = useSelector((state: RootState) => state.metas);
	const [dataLoaded, setDataLoaded] = useState(false);

	const [relacionSeleccionadas1, setRelacionSeleccionadas1] = useState<Option[]>([]);
	const [relacionSeleccionadas2, setRelacionSeleccionadas2] = useState<Option[]>([]);
	const [relacionSeleccionadas3, setRelacionSeleccionadas3] = useState<Option[]>([]);
	const [sippeSeleccionadas, setSippeSeleccionadas] = useState<Option[]>([]);

	useEffect(() => {
		if (dataLoaded) {
			saveData({
				listaRelaciones: Array.from(
					new Set([
						...relacionSeleccionadas1.map((el) => el.value),
						...relacionSeleccionadas2.map((el) => el.value),
						...relacionSeleccionadas3.map((el) => el.value),
					]),
				).sort((a, b) => a - b),
				listaProgramasSIPPE: sippeSeleccionadas.map((el) => el.value),
			});
		}
	}, [relacionSeleccionadas1, relacionSeleccionadas2, relacionSeleccionadas3, sippeSeleccionadas]);

	const filtrarAreas = useCallback(
		(nomRelacion: string): Option[] => {
			if (!bases) return [];
			return bases.listaRelaciones
				.filter((relacion: Relacion) => relacion.tipoRelacion.nom === nomRelacion)
				.map((relacion: Relacion) => ({
					value: relacion.idRelacion,
					label: relacion.nom,
				}));
		},
		[bases],
	);

	const filtrarRelacionesSeleccionadas = useCallback(
		(filterFn: Option[]) => {
			if (!activity.listaRelaciones) return [];
			return filterFn.filter((el: Option) =>
				activity.listaRelaciones?.some((ri: number) => ri === el.value),
			);
		},
		[activity],
	);

	const formatearSippes = useCallback((): Option[] => {
		if (!bases) return [];
		return bases.listaProgramasSIPPE.map((sippe: ListaProgramasSIPPE) => ({
			value: sippe.idProgramaSippe,
			label: sippe.nom,
		}));
	}, [bases]);

	const filtrarSippeSeleccionadas = useCallback(() => {
		if (!activity.listaProgramasSIPPE) return [];
		return formatearSippes().filter((el: Option) =>
			activity.listaProgramasSIPPE?.some((ri: number) => ri === el.value),
		);
	}, [activity.listaProgramasSIPPE, formatearSippes]);

	useEffect(() => {
		if (!error && bases) {
			setRelacionSeleccionadas1(filtrarRelacionesSeleccionadas(filtrarAreas('interna_extensión')));
			setRelacionSeleccionadas2(filtrarRelacionesSeleccionadas(filtrarAreas('interna_unl')));
			setRelacionSeleccionadas3(filtrarRelacionesSeleccionadas(filtrarAreas('U.A.')));
			setSippeSeleccionadas(filtrarSippeSeleccionadas());

			setDataLoaded(true);
		}
	}, [bases, error]);

	const fieldsConfig = [
		{
			id: 'relacionSeleccionadas1',
			label: 'Áreas internas de la secretaría',
			placeholder: 'seleccionar',
			options: filtrarAreas('interna_extensión'),
			value: relacionSeleccionadas1,
			onChange: setRelacionSeleccionadas1,
		},
		{
			id: 'relacionSeleccionadas2',
			label: 'Secretarías',
			placeholder: 'seleccionar',
			options: filtrarAreas('interna_unl'),
			value: relacionSeleccionadas2,
			onChange: setRelacionSeleccionadas2,
		},
		{
			id: 'relacionSeleccionadas3',
			label: 'Unidades Académicas involucradas',
			placeholder: 'seleccionar',
			options: filtrarAreas('U.A.'),
			value: relacionSeleccionadas3,
			onChange: setRelacionSeleccionadas3,
		},
		{
			id: 'sippeSeleccionadas',
			label: 'Programas de Extensión',
			placeholder: 'seleccionar',
			options: formatearSippes(),
			value: sippeSeleccionadas,
			onChange: setSippeSeleccionadas,
		},
	];

	return (
		<Container fluid>
			{dataLoaded ? (
				<Row>
					{fieldsConfig.map((field) => (
						<Col md={6} key={field.id} className=' pb-2'>
							<div className=' p-1 d-flex flex-column align-items-center border rounded bg-color-slate gap-1 p-1'>
								<h5>{field.label}</h5>
								<div style={{ width: '90%', minHeight: '140px' }}>
									<p className=' align-self-start mb-1'>Seleccione según corresponda:</p>
									<Select
										styles={{
											valueContainer: (base) => ({ ...base, maxHeight: 100, overflow: 'auto' }),
										}}
										closeMenuOnSelect={false}
										components={animatedComponents}
										isMulti
										options={field.options}
										placeholder={field.placeholder}
										value={field.value}
										onChange={(selected) => field.onChange(selected as Option[])}
									/>
								</div>
							</div>
						</Col>
					))}
				</Row>
			) : (
				<LoadingSpinner />
			)}
		</Container>
	);
}
