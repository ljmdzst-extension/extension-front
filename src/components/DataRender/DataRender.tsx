import { useEffect, useMemo, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import axios from 'axios';

interface Props {
	objectData: any;
	spanishTitles: any;
}

interface Valoracion {
	idValoracion: number;
	nom: string;
}

interface Area {
	idRelacion: number;
	nom: string;
	idTipoRelacion: number;
}

const DataRender = ({ objectData, spanishTitles }: Props) => {
	const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
	const [areas, setAreas] = useState<Area[]>([]);

	// Record en TypeScript es una utilidad de tipo que representa un objeto JavaScript con
	// claves de tipo string y valores de un tipo específico. En otras palabras, Record<K, T>
	// es una forma de definir un tipo para un objeto que tiene claves de tipo K y valores
	// de tipo T.
	const [areasMap, setAreasMap] = useState<Record<string, Area>>({});
	const [loading, setLoading] = useState<boolean>(true);

	const camelCaseToHuman = (str: string) => {
		return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
	};

	const stringValoracion = (val: number) => {
		const valoracion = valoraciones?.find((valoracion) => valoracion.idValoracion === val);
		return valoracion?.nom;
	};

	const fetchBases = async () => {
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL_METAS}/bases/`);
			if (response.data.ok) {
				setValoraciones(response.data.data.listaValoraciones);
				setAreas(response.data.data.lAreas);
				setLoading(false);
			} else {
				console.error('Error en la respuesta de la API');
			}
		} catch (error) {
			console.error('Error al obtener la lista de objetivos:', error);
		}
	};

	useEffect(() => {
		fetchBases();
	}, []);

	useEffect(() => {
		const map: Record<string, Area> = {};
		areas.forEach((area) => {
			const key = `${area.idRelacion}-${area.idTipoRelacion}`;
			map[key] = area;
		});
		setAreasMap(map);
	}, [areas]);

	const extraerRelacionCompleta = (idRelacion: number, idTipoRelacion: number) => {
		const key = `${idRelacion}-${idTipoRelacion}`;
		return areasMap[key];
	};

	const renderArea = (data: any[], idTipoRelacion: number, nombreArea: string) => {
		if (!data || data.length === 0) {
			return null; // O cualquier otro componente o mensaje de aviso
		}

		const elementosArea = data
			.map((idRelacion) => extraerRelacionCompleta(idRelacion, idTipoRelacion))
			.filter(Boolean); //elimina los valores null, undefined, etc

		if (elementosArea.length === 0) {
			return null; // No hay elementos para renderizar
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

	const renderData = (data: any[], dataType: string) => {
		const renderers: any = {
			listaMetas: () => (
				<div key={dataType}>
					<p>
						<span>Listado de Metas</span>
					</p>
					<Accordion defaultActiveKey='0' alwaysOpen>
						{data.map((meta) => (
							<Accordion.Item eventKey={`${meta.idMeta}`} key={`meta-${meta.idMeta}`}>
								<Accordion.Header>Mostrar meta {meta.idMeta}</Accordion.Header>
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
			),
			listaInstituciones: () => (
				<div key={dataType} className=' mt-2'>
					<p>
						<span>Instituciones</span>
					</p>
					<ul>
						{data.map(({ idInstitucion, nom, ubicacion }: any) => (
							<li key={`institucion-${idInstitucion}`}>
								<a href={ubicacion} target='_blank' rel='noopener noreferrer'>
									{nom}
								</a>
							</li>
						))}
					</ul>
				</div>
			),
			listaEnlaces: () => (
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
			),
			listaRelaciones: () => {
				return (
					<div key={dataType}>
						<p>
							<span>Areas</span>
						</p>
						{data.length > 0 && (
							<ol>
								{renderArea(data, 1, 'Internas Secretaria')}
								{renderArea(data, 2, 'Internas UNL')}
								{renderArea(data, 3, 'Unidades Académicas involucradas')}
								{renderArea(data, 4, 'Programas de Extensión')}
							</ol>
						)}
					</div>
				);
			},

			// Otros casos para renderizar diferentes tipos de listas...
		};

		const renderer = renderers[dataType];
		return renderer ? renderer() : null;
	};

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

	return <div className=' overflow-y-scroll custom-scrollbar  '>{memoizedRenderData}</div>;
};

export default DataRender;