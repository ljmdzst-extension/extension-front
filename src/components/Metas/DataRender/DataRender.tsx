import { useEffect, useMemo, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { LArea } from '@/types/BasesProps';
import useAlert from '@/hooks/useAlert';

interface Props {
	objectData: any;
	spanishTitles: any;
}

interface Area {
	idRelacion: number;
	nom: string;
	idTipoRelacion: number;
}

const DataRender = ({ objectData, spanishTitles }: Props) => {
	const { bases, error, loading } = useSelector((state: RootState) => state.metas);
	const { errorAlert } = useAlert();

	const [areasMap, setAreasMap] = useState<Record<string, Area>>({});

	const camelCaseToHuman = (str: string) => {
		return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
	};

	const stringValoracion = (val: number) => {
		const valoracion = bases?.listaValoraciones?.find(
			(valoracion) => valoracion.idValoracion === val,
		);
		return valoracion?.nom;
	};

	useEffect(() => {
		if (error) errorAlert(error);
	}, [error, errorAlert]);

	useEffect(() => {
		const map: Record<string, LArea> = {};
		bases?.lAreas.forEach((area) => {
			const key = `${area.idRelacion}-${area.idTipoRelacion}`;
			map[key] = area;
		});
		setAreasMap(map);
	}, [bases?.lAreas]);

	const extraerRelacionCompleta = (idRelacion: number, idTipoRelacion: number) => {
		const key = `${idRelacion}-${idTipoRelacion}`;
		return areasMap[key];
	};

	const renderArea = (data: any[], idTipoRelacion: number, nombreArea: string) => {
		if (!data || data.length === 0) {
			return null;
		}

		const elementosArea = data
			.map((idRelacion) => extraerRelacionCompleta(idRelacion, idTipoRelacion))
			.filter(Boolean);

		if (elementosArea.length === 0) {
			return null;
		}

		return (
			<li>
				{nombreArea}
				<ul>
					{elementosArea.map((thisArea, index) => (
						<li key={`${index}-${idTipoRelacion}`}>{thisArea.nom}</li>
					))}
				</ul>
			</li>
		);
	};

	const renderObjetivos = (data: number[]) => {
		if (!data || data.length === 0) {
			return null;
		}

		const objetivos = bases?.listaObjetivos?.filter((objetivo) =>
			data.includes(objetivo.idObjetivo),
		);

		return (
			<ul>
				{objetivos?.map((objetivo) => (
					<li key={`objetivo-${objetivo.idObjetivo}`}>{objetivo.nom}</li>
				))}
			</ul>
		);
	};

	// General data renderer for different data types
	const renderData = (data: any[], dataType: string) => {
		const renderers: any = {
			listaMetas: () => {
				if (!data || data.length === 0) return null;
				return (
					<div key={dataType}>
						<p>
							<span>Listado de Metas</span>
						</p>
						<Accordion defaultActiveKey='0' alwaysOpen>
							{data.map((meta, index) => (
								<Accordion.Item eventKey={`${meta.idMeta}`} key={`meta-${meta.idMeta}`}>
									<Accordion.Header>Mostrar meta {index + 1}</Accordion.Header>
									<Accordion.Body>
										<p>
											<span>Descripción:</span> {meta.descripcion}
										</p>
										<p>
											<span>Resultado:</span> {meta.resultado}
										</p>
										<p>
											<span>Observaciones:</span> {meta.observaciones}
										</p>
										<p>
											<span>Valoracion:</span> {stringValoracion(meta.valoracion)}
										</p>
									</Accordion.Body>
								</Accordion.Item>
							))}
						</Accordion>
					</div>
				);
			},
			listaInstituciones: () => {
				if (!data || data.length === 0) return null;
				return (
					<div key={dataType} className=' mt-2'>
						<p>
							<span>Instituciones</span>
						</p>
						<ul>
							{data.map(({ idInstitucion, nom, ubicacion,latitud,longitud }: any) => (
								<li key={`institucion-${idInstitucion}`}>
									<a href={latitud?`https://www.google.com/maps?q=${latitud},${longitud}`:ubicacion} target='_blank' rel='noopener noreferrer'>
										{nom}
									</a>
								</li>
							))}
						</ul>
					</div>
				);
			},
			listaEnlaces: () => {
				if (!data || data.length === 0) return null;
				return (
					<div key={dataType} className=' mt-2'>
						<p>
							<span>Enlaces</span>
						</p>
						<ul>
							{data.map(({ idEnlace, link, desc }: any) => (
								<li key={`institucion-${idEnlace}`}>
									<a href={link} target='_blank' rel='noopener noreferrer'>
										{desc}
									</a>
								</li>
							))}
						</ul>
					</div>
				);
			},
			listaRelaciones: () => {
				if (!data || data.length === 0) return null;
				return (
					<div key={dataType}>
						<p>
							<span>Áreas</span>
						</p>
						{data.length > 0 && (
							<ol>
								{renderArea(data, 1, 'Internas Secretaria')}
								{renderArea(data, 2, 'Otras áreas centrales')}
								{renderArea(data, 3, 'Unidades Académicas involucradas')}
								{renderArea(data, 4, 'Programas de Extensión')}
							</ol>
						)}
					</div>
				);
			},
			listaProgramasSIPPE: () => {
				if (!data || data.length === 0) return null;

				const thisSIPPE = bases?.listaProgramasSIPPE?.filter((programa) =>
					data.includes(programa.idProgramaSippe),
				);

				return (
					<div key={dataType}>
						<p>
							<span>Programas de Extensión</span>
						</p>
						<ul>
							{thisSIPPE?.map((el) => (
								<li key={'Sippe' + el.idProgramaSippe}>{el.nom}</li>
							))}
						</ul>
					</div>
				);
			},
			listaObjetivos: () => {
				if (!data || data.length === 0) return null;

				const ejesTransversales = data.filter((id) => {
					const objetivo = bases?.listaObjetivos?.find((obj) => obj.idObjetivo === id);
					return objetivo?.tipoObjetivo.idTipoObj === 3;
				});

				const lineasEstrategicas = data.filter((id) => {
					const objetivo = bases?.listaObjetivos?.find((obj) => obj.idObjetivo === id);
					return objetivo?.tipoObjetivo.idTipoObj === 2;
				});

				const objetivosEstrategicos = data.filter((id) => {
					const objetivo = bases?.listaObjetivos?.find((obj) => obj.idObjetivo === id);
					return objetivo?.tipoObjetivo.idTipoObj === 1;
				});

				return (
					<div key={dataType}>
						<p>
							<span>Objetivos</span>
						</p>
						<div className=' mt-1'>
							<p className=' fw-bold fs-6 mb-1'>- Ejes Transversales</p>
							{renderObjetivos(ejesTransversales)}
						</div>
						<div className=' mt-1'>
							<p className=' fw-bold fs-6 mb-1'>- Objetivos Estratégicos</p>
							{renderObjetivos(lineasEstrategicas)}
						</div>
						<div className=' mt-1'>
							<p className=' fw-bold fs-6 mb-1'>- Lineas Institucionales Estratégicas</p>
							{renderObjetivos(objetivosEstrategicos)}
						</div>
					</div>
				);
			},
			listaUbicaciones: () => {
				if (!data || data.length === 0) return null;

				return (
					<div key={dataType}>
						<p>
							<span>Ubicaciones</span>
						</p>
						<div className='mt-1'>
							<ul>
								{data.map((ubicacion: { idUbicacion: number; enlace: string; desc: string }) => (
									<li key={`ubicacion-${ubicacion.idUbicacion}`}>
										<a href={ubicacion.enlace} target='_blank' rel='noopener noreferrer'>
											{ubicacion.desc}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				);
			},

			// Other cases for rendering different types of lists...
		};

		const renderer = renderers[dataType];
		return renderer ? renderer() : null;
	};

	// Render simple values
	const renderValue = (value: any, nameData: string) => {
		const propertyName = spanishTitles[nameData] || camelCaseToHuman(nameData);

		if (value === null) {
			return null;
		}

		return (
			<p key={nameData}>
				<span>{propertyName}:</span> {value}
			</p>
		);
	};

	const memoizedRenderData = useMemo(() => {
		if (loading) {
			return <p>Cargando...</p>;
		}

		return Object.entries(objectData).map(([nameData, value]) => {
			if (Array.isArray(value)) {
				return renderData(value, nameData);
			} else {
				return renderValue(value, nameData);
			}
		});
	}, [objectData, spanishTitles, areasMap, loading]);

	return (
		<div
			className=' overflow-y-scroll custom-scrollbar p-2 rounded-2  '
			style={{ backgroundColor: '#e8edf1' }}
		>
			{memoizedRenderData}
		</div>
	);
};

export default DataRender;
