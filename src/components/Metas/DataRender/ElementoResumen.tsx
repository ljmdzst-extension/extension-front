import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { LArea, ListaProgramasSIPPE } from '@/types/BasesProps';
import { Actividad, Institucione } from '@/types/ActivityProps';

interface Props {
	element: Actividad;
}

interface Area {
	idRelacion: number;
	nom: string;
	idTipoRelacion: number;
}

const ElementoResumen = ({ element }: Props) => {
	const { idActividad, desc, listaRelaciones, listaMetas, listaObjetivos, listaInstituciones, listaProgramasSIPPE } =
		element;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [areas, setAreas] = useState<LArea[]>([]);
	const [, setListaSIPPE] = useState<ListaProgramasSIPPE[]>();
	const [areasMap, setAreasMap] = useState<Record<string, Area>>({});

	const { bases, error } = useSelector((state: RootState) => state.metas);

	useEffect(() => {
		if (!error && bases) {
			setAreas(bases.lAreas);
			setListaSIPPE(bases.listaProgramasSIPPE);
		}
	}, [bases, error]);

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
		if (!data || data.length === 0) return null;

		const elementosArea = data
			.map((idRelacion) => extraerRelacionCompleta(idRelacion, idTipoRelacion))
			.filter(Boolean)
			.sort((a, b) => a.nom.localeCompare(b.nom));

		if (elementosArea.length === 0) return null;

		return (
			<div style={styles.areaBlock}>
				<span style={styles.areaTitle}>{nombreArea}</span>
				<ul style={styles.areaList}>
					{elementosArea.map((thisArea, index) => (
						<li key={`${index}-${idTipoRelacion}`}>{thisArea.nom}</li>
					))}
				</ul>
			</div>
		);
	};

	function urlText(text: string) {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.replace(urlRegex, (url) => {
			return `<a target='_blank' rel='noopener noreferrer' href="${url}" style="color: #0d6efd; text-decoration: underline;">${url}</a>`;
		});
	}

	const renderObjetivos = () => {
		if (!listaObjetivos || listaObjetivos.length === 0) {
			return <div style={styles.emptyText}>No hay objetivos cargados</div>;
		}

		const objetivosFiltrados = bases?.listaObjetivos.filter((objetivo) =>
			listaObjetivos.includes(objetivo.idObjetivo),
		);

		if (!objetivosFiltrados || objetivosFiltrados.length === 0) {
			return <div style={styles.emptyText}>No hay objetivos filtrados</div>;
		}

		const estratega = objetivosFiltrados.filter((o) => o.idObjetivo <= 4);
		const planInst = objetivosFiltrados.filter((o) => o.idObjetivo >= 5);

		return (
			<div style={styles.objetivosGrid}>
				{estratega.length > 0 && (
					<div>
						<h6 style={styles.subSubtitle}>Objetivos Estratégicos</h6>
						<ul style={styles.listDisc}>
							{estratega.map((objetivo, index) => (
								<li key={index}>{objetivo.nom}</li>
							))}
						</ul>
					</div>
				)}

				{planInst.length > 0 && (
					<div>
						<h6 style={styles.subSubtitle}>Plan Institucional</h6>
						<ul style={styles.listDisc}>
							{planInst.map((objetivo, index) => (
								<li key={index}>{objetivo.nom}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	};

	const renderInstituciones = (data: Institucione[]) => {
		if (!data || data.length === 0) return null;

		
		return (
			<div style={styles.areaBlock}>
				<ul style={styles.areaList}>
					{data.map((inst, index) => (
						<li key={index}>{inst.nom}</li>
					))}
				</ul>
			</div>
		);
	};


	return (
		<div style={styles.cardContainer}>
			{/* Encabezado visible siempre con el Título/ID prominente */}
			<div style={styles.cardHeader} onClick={() => setIsOpen(!isOpen)}>
				<div style={styles.titleWrapper}>
					<div style={styles.badge}>
						ACTIVIDAD #{idActividad}
					</div>
					<h6 style={styles.mainTitle}>
						{desc ? desc : `Actividad Sin Descripción (${idActividad})`}
					</h6>
				</div>
				<button 
					type='button' 
					style={styles.toggleBtn}
					onClick={(e) => {
						e.stopPropagation(); // Evita que se dispare dos veces si el padre tiene onClick
						setIsOpen(!isOpen);
					}}
				>
					<span 
						style={{ 
							display: 'inline-block', 
							transform: isOpen ? 'rotate(0deg)' : 'rotate(90deg)', 
							transition: 'transform 0.2s ease-in-out',
							cursor: 'pointer'
						}}
					>
						▼
					</span>
				</button>
			</div>

			{/* Contenido desplegable */}
			{isOpen && (
				<div style={styles.cardBody}>
					{/* Sección Objetivos */}
					<div style={styles.section}>
						<div style={styles.sectionHeader}>OBJETIVOS</div>
						{renderObjetivos()}
					</div>

					{/* Sección Metas */}
					<div style={styles.section}>
						<div style={styles.sectionHeader}>METAS Y RESULTADOS</div>
						{listaMetas?.length ? (
							<div style={styles.tableWrapper}>
								<div style={styles.gridHeader}>
									<div>Meta / Resultado esperado</div>
									<div>Resultado alcanzado</div>
									<div>Observaciones</div>
									<div>Valoración</div>
								</div>
								{listaMetas.map((meta, index) => (
									<div style={styles.gridRow} key={index}>
										<div
											style={styles.gridCell}
											dangerouslySetInnerHTML={{ __html: urlText(meta.descripcion ?? '-') }}
										/>
										<div
											style={styles.gridCell}
											dangerouslySetInnerHTML={{ __html: urlText(meta.resultado ?? '-') }}
										/>
										<div
											style={styles.gridCell}
											dangerouslySetInnerHTML={{ __html: urlText(meta.observaciones ?? '-') }}
										/>
										<div style={styles.gridCellBold}>
											{meta?.nombreValoracion ?? 'Sin valoración'}
										</div>
									</div>
								))}
							</div>
						) : (
							<div style={styles.emptyText}>No hay metas cargadas</div>
						)}
					</div>

					{/* Sección Áreas */}
					<div style={styles.section}>
						<div style={styles.sectionHeader}>ÁREAS INVOLUCRADAS</div>
						{listaRelaciones?.length !== undefined && listaRelaciones.length > 0 ? (
							<div style={styles.areasGrid}>
								{renderArea(listaRelaciones, 1, 'Internas Secretaría')}
								{renderArea(listaRelaciones, 2, 'Otras Áreas Centrales')}
								{renderArea(listaRelaciones, 3, 'Unidades Académicas Involucradas')}
								{listaProgramasSIPPE?.length !== undefined && listaRelaciones.length > 0
									? renderArea(listaProgramasSIPPE, 4, 'Programas de Extensión')
									: null}
							</div>
						) : (
							<div style={styles.emptyText}>No hay áreas cargadas</div>
						)}
					</div>


					<div style={styles.section}>
						<div style={styles.sectionHeader}>INSTITUCIONES INVOLUCRADAS</div>
						{listaInstituciones?.length !== undefined && listaInstituciones.length > 0 ? (
							<div style={styles.areasGrid}>
								{renderInstituciones(listaInstituciones)}
							</div>
						) : (
							<div style={styles.emptyText}>No hay instituciones cargadas</div>
						)}
					</div>

					{/* Enlace de referencia */}
					<div style={{ textAlign: 'right' }}>
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
			)}
		</div>
	);
};

const styles = {
	cardContainer: {
		width: '100%',
		minHeight: '65px',
		flexShrink: 0, // EVITA QUE SE APLASTEN EN LISTAS LARGAS
		backgroundColor: '#ffffff',
		borderRadius: '8px',
		border: '1px solid #0a4b43',
		boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
		marginBottom: '8px',
		overflow: 'hidden',
	},
	cardHeader: {
		padding: '14px 18px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		cursor: 'pointer',
		backgroundColor: '#ffffff',
		borderLeft: '5px solid #0a4b43',
	},
	titleWrapper: {
		display: 'flex',
		flexDirection: 'column' as const,
		gap: '4px',
		width: '90%',
	},
	badge: {
		fontSize: '11px',
		fontWeight: '700' as const,
		color: '#0a4b43',
		letterSpacing: '0.5px',
	},
	mainTitle: {
		margin: 0,
		fontSize: '15px',
		fontWeight: '600' as const,
		color: '#354152',
		lineHeight: '1.2',
	},
	toggleBtn: {
		background: 'none',
		border: 'none',
		fontSize: '14px',
		color: '#6b7280',
		cursor: 'pointer',
		padding: '4px 8px',
	},
	cardBody: {
		padding: '16px',
		backgroundColor: '#f3f4f6',
		borderTop: '1px solid #e5e7eb',
		display: 'flex',
		flexDirection: 'column' as const,
		gap: '16px',
	},
	section: {
		backgroundColor: '#ffffff',
		padding: '12px 16px',
		borderRadius: '6px',
		border: '1px solid #e5e7eb',
	},
	sectionHeader: {
		fontSize: '12px',
		fontWeight: '700' as const,
		color: '#0a4b43',
		marginBottom: '8px',
		letterSpacing: '0.5px',
	},
	emptyText: {
		fontSize: '13px',
		color: '#393a3a',
		fontStyle: 'italic',
	},
	objetivosGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
		gap: '12px',
	},
	subSubtitle: {
		margin: '0 0 4px 0',
		fontSize: '13px',
		fontWeight: '600' as const,
		color: '#374151',
	},
	listDisc: {
		margin: 0,
		paddingLeft: '18px',
		fontSize: '13px',
		color: '#000000',
	},
	tableWrapper: {
		display: 'flex',
		flexDirection: 'column' as const,
		border: '1px solid #e5e7eb',
		borderRadius: '4px',
		overflow: 'hidden',
	},
	gridHeader: {
		display: 'grid',
		gridTemplateColumns: '2fr 2fr 2fr 1fr',
		backgroundColor: '#f3f4f6',
		padding: '8px 12px',
		fontWeight: '600' as const,
		fontSize: '12px',
		color: '#374151',
	},
	gridRow: {
		display: 'grid',
		gridTemplateColumns: '2fr 2fr 2fr 1fr',
		borderTop: '1px solid #e5e7eb',
	},
	gridCell: {
		padding: '8px 12px',
		fontSize: '13px',
		color: '#000000',
	},
	gridCellBold: {
		padding: '8px 12px',
		fontSize: '13px',
		fontWeight: '600' as const,
		color: '#0a4b43',
	},
	areasGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: '8px',
	},
	areaBlock: {
		backgroundColor: '#f3f4f6',
		padding: '8px 12px',
		borderRadius: '4px',
	},
	areaTitle: {
		fontSize: '12px',
		fontWeight: '700' as const,
		color: '#374151',
		display: 'block',
	},
	areaList: {
		margin: 0,
		paddingLeft: '16px',
		fontSize: '12px',
		color: '#4b5563',
	},
	link: {
		fontSize: '12px',
		color: '#0a4b43',
		textDecoration: 'underline',
	},
};

export default ElementoResumen;