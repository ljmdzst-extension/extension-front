import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { LArea, ListaProgramasSIPPE } from '@/types/BasesProps';
import { Actividad } from '@/types/ActivityProps';

interface Props {
	element: Actividad;
}

interface Area {
	idRelacion: number;
	nom: string;
	idTipoRelacion: number;
}

const ElementoResumen = ({ element }: Props) => {
	const { idActividad, desc, listaRelaciones, listaMetas, listaObjetivos, listaProgramasSIPPE } =
		element;

	const [areas, setAreas] = useState<LArea[]>([]);
	const [listaSIPPE, setListaSIPPE] = useState<ListaProgramasSIPPE[]>();

	const [areasMap, setAreasMap] = useState<Record<string, Area>>({});

	const { bases, error } = useSelector((state: RootState) => state.metas);

	useEffect(() => {
		if (!error && bases) {
			setAreas(bases.lAreas);
			setListaSIPPE(bases.listaProgramasSIPPE);
		}
	}, [bases, error, listaSIPPE]);

	useEffect(() => {
		const map: Record<string, LArea> = {};
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

	const renderArea = (data: number[], idTipoRelacion: number, nombreArea: string) => {
		if (!data || data.length === 0) {
			return null;
		}

		const elementosArea = data
			.map((idRelacion) => extraerRelacionCompleta(idRelacion, idTipoRelacion))
			.filter(Boolean)
			.sort((a, b) => a.nom.localeCompare(b.nom));

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

	function urlText(text: string) {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const newText = text.replace(urlRegex, function (url) {
			return `<a target='_blank' href=${url}>
					${url}
				</a>`;
		});
		return newText;
	}

	const renderObjetivos = () => {
		if (!listaObjetivos || listaObjetivos.length === 0) {
			return <div>No hay objetivos cargados</div>;
		}

		const objetivosFiltrados = bases?.listaObjetivos.filter((objetivo) =>
			listaObjetivos.includes(objetivo.idObjetivo),
		);

		if (!objetivosFiltrados) {
			return <div>No hay objetivos filtrados</div>;
		}

		return (
			<div className=' m-1'>
				<div>
					<h5>Objetivos estratégicos</h5>
					<ul>
						{objetivosFiltrados.map(
							(objetivo, index) =>
								objetivo.idObjetivo <= 4 && (
									<li key={index}>
										<p>{objetivo.nom}</p>
									</li>
								),
						)}
					</ul>
				</div>
				<div>
					<h5>Plan institucional</h5>
					<ul>
						{objetivosFiltrados.map(
							(objetivo, index) =>
								objetivo.idObjetivo >= 5 && (
									<li key={index}>
										<p> {objetivo.nom}</p>
									</li>
								),
						)}
					</ul>
				</div>
				<p className=' px-2 text-end w-100 fst-italic'>
					Referencia:{' '}
					<a
						href='https://www.unl.edu.ar/pie/wp-content/uploads/sites/55/2021/02/Plan-Institucional-Estrat%C3%A9gico.pdf'
						target='_blank'
						rel='noopener noreferrer'
						className=' text-decoration-underline'
					>
						Plan Institucional Estratégico
					</a>
				</p>
			</div>
		);
	};

	return (
		<div style={styles.container}>
			{/* Título de la primera sección de actividad, con estilo destacado */}
			<div style={styles.titleContainerPrimary}>
				<h5>Actividad: {idActividad}</h5>
			</div>

			{/* Descripción de la actividad */}
			<div style={styles.sectionContainer}>
				<p style={styles.paragraph}>{desc}</p>
			</div>

			{/* Objetivos */}
			<div style={styles.sectionContainer}>
				<div style={styles.titleContainer}>Lista Objetivos</div>
				<div>{renderObjetivos()}</div>
			</div>

			{/* Metas */}
			<div style={styles.sectionContainer}>
				<div style={styles.titleContainer}>Metas</div>
				<div style={styles.gridContainer}>
					<div style={styles.gridTitle}>Meta/Resultado esperado</div>
					<div style={styles.gridTitle}>Resultado alcanzado</div>
					<div style={styles.gridTitle}>Observaciones</div>
					<div style={styles.gridTitle}>Valoración</div>
				</div>

				{listaMetas?.length ? (
					listaMetas.map((meta, index) => (
						<div style={styles.gridContainer} key={index}>
							<div
								style={styles.gridItem}
								dangerouslySetInnerHTML={{ __html: urlText(meta.descripcion ?? '') }}
							/>
							<div
								style={styles.gridItem}
								dangerouslySetInnerHTML={{ __html: urlText(meta.resultado ?? '') }}
							/>
							<div
								style={styles.gridItem}
								dangerouslySetInnerHTML={{ __html: urlText(meta.observaciones ?? '') }}
							/>
							<div style={styles.gridItem}>{meta?.valoracion ?? 'No hay valoración cargada'}</div>
						</div>
					))
				) : (
					<div style={styles.paragraph}>No hay metas cargadas</div>
				)}
			</div>

			{/* Áreas */}
			<div style={styles.sectionContainer}>
				<div style={styles.titleContainer}>Áreas</div>
				<div style={styles.paragraph}>
					{listaRelaciones?.length !== undefined && listaRelaciones.length > 0 ? (
						<ol style={styles.list}>
							{renderArea(listaRelaciones, 1, 'Internas Secretaria')}
							{renderArea(listaRelaciones, 2, 'Otras áreas centrales')}
							{renderArea(listaRelaciones, 3, 'Unidades Académicas involucradas')}
							{listaProgramasSIPPE?.length !== undefined && listaRelaciones.length > 0
								? renderArea(listaProgramasSIPPE, 4, 'Programas de Extensión')
								: null}
						</ol>
					) : (
						<p>No hay Áreas Cargadas</p>
					)}
				</div>
			</div>

			{/* Link de referencia */}
			<div style={styles.linkContainer}>
				<a
					href='https://www.unl.edu.ar/pie/wp-content/uploads/sites/55/2021/02/Plan-Institucional-Estrat%C3%A9gico.pdf'
					target='_blank'
					rel='noopener noreferrer'
					style={styles.link}
				>
					Plan Institucional Estratégico
				</a>
			</div>
		</div>
	);
};

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column' as const,
		border: '2px solid #cfcfcf',
		backgroundColor: '#e5e5e5',
		fontSize: '14px',
		marginBottom: '32px',
		borderRadius: '8px',
		boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
	},
	titleContainerPrimary: {
		backgroundColor: '#0a4b43',
		color: 'white',
		textAlign: 'center' as const,
		padding: '10px 0',
		fontSize: '18px',
		fontWeight: 'bold',
		borderRadius: '8px 8px 0 0',
	},
	titleContainer: {
		backgroundColor: '#4A9F95',
		color: 'white',
		textAlign: 'center' as const,
		padding: '10px 0',
		fontSize: '18px',
		borderRadius: '8px 8px 0 0',
		fontWeight: 'bold',
	},
	sectionContainer: {
		margin: '8px 0',
	},
	paragraph: {
		margin: '8px',
		lineHeight: '1.5',
	},
	gridContainer: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		backgroundColor: '#fff',
		borderRadius: '8px',
		boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
	},
	gridTitle: {
		padding: '12px',
		backgroundColor: '#d9e7e6',
		fontWeight: 'bold',
		textAlign: 'center' as const,
		borderBottom: '2px solid #ccc',
		borderRadius: '8px 8px 0 0',
	},
	gridItem: {
		padding: '12px',
		backgroundColor: '#f9f9f9',
		border: '1px solid #e0e0e0',
		borderRadius: '4px',
	},
	link: {
		color: '#08443c',
		textDecoration: 'underline',
		fontStyle: 'italic',
	},
	gridItemHover: {
		backgroundColor: '#e0f2f1',
	},
	list: {
		listStyleType: 'none',
		padding: 0,
	},
	listItem: {
		marginBottom: '8px',
	},
	listItemArea: {
		marginBottom: '4px',
	},
	linkContainer: {
		textAlign: 'end' as const,
		padding: '8px 16px',
	},
};

export default ElementoResumen;
