import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Search } from '@mui/icons-material';
import { InputGroup, Form, Button } from 'react-bootstrap';
import { Actividad } from '@/types/ActivityProps';
import { getAreasResumen } from '@/services/api/private/metas';
import LoadingSpinner from '@/components/Common/Spinner/LoadingSpinner';
import ElementoResumen from '@/components/Metas/DataRender/ElementoResumen';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import CommonIconWithTooltip from '@/components/Common/Icon/CommonIconWithTooltip';

interface Area {
	idArea: number;
	nom: string;
	listaActividades: Actividad[];
	anio: string;
}

const ResumenAreaScreen = () => {
	const [data, setData] = useState<Actividad[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const { idArea } = useParams<{ idArea: string }>();
	const navigate = useNavigate();

	const [search, setSearch] = useState<string>(''); 

	const elementRef = useRef(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	const handleSearch = () => {
		if (search.length > 3 || search.length === 0) {
		
			setOffset(0);
			setData([]);
			setHasMore(true);
			getData(0, search); 
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(OnIntersection);
		if (observer && elementRef.current) observer.observe(elementRef.current);
		return () => {
			if (observer) observer.disconnect();
		};
	}, [data, search]);

	const OnIntersection = async (entries: IntersectionObserverEntry[]) => {
		const firstEntry = entries[0];
		if (firstEntry.isIntersecting && hasMore) await getData(offset, search); 
	};

	const getData = async (offset: number, keyword: string = '') => {
		const stringAreaData = localStorage.getItem('currentArea');
		const areaData = JSON.parse(stringAreaData!) as Area;

		if (idArea) {
			getAreasResumen(idArea, areaData.anio, offset.toString(), '5', keyword).then((res) => {
				if (res.data.length === 0) {
					setHasMore(false);
				} else {
					setTimeout(() => {
						setData((prevData) => [...prevData, ...res.data]);
						setOffset((prevOffset) => prevOffset + 5);
					}, 2000);
				}
			});
		}
	};

	return (
		<div
			className='d-flex flex-column h-100 m-2 border rounded p-2'
			style={{ backgroundColor: '#fefefe' }}
		>
			<div className='d-flex justify-content-between align-items-center mb-2'>
				<CommonTitle underline bold textAlign='center'>
					Lista de Actividades
				</CommonTitle>
				<CommonIconWithTooltip
					tooltipText='Atras'
					Icon={ArrowBack}
					onClick={() => navigate(-1)}
					style={{
						background: '#0a5d52',
						color: 'white',
						borderRadius: '.3rem',
						fontSize: '34px',
					}}
				/>
			</div>

			{/* Campo de búsqueda */}
			<InputGroup className='w-50 mb-2'>
				<Form.Control
					type='text'
					placeholder='Buscar Actividad'
					name='search'
					value={search} // Mantener el valor del search en el campo
					onChange={handleChange}
					size='sm'
				/>
				<Button variant='primary' size='sm' onClick={handleSearch}>
					<CommonIconWithTooltip
						tooltipText='Buscar actividades'
						Icon={Search}
						style={{
							color: 'white',
							fontSize: '24px',
						}}
						forcePointer
					/>
				</Button>
			</InputGroup>

			{/* Lista de actividades */}
			<div
				className='list-group mx-auto custom-scrollbar overflow-y-auto gap-4'
				style={{ height: '100%' }}
			>
				{data.map((el, index) => (
					<ElementoResumen element={el} key={el.desc + '-' + index} />
				))}
				{hasMore && (
					<div className='d-flex align-items-center h-100' ref={elementRef}>
						<LoadingSpinner />
					</div>
				)}
			</div>
		</div>
	);
};

export default ResumenAreaScreen;
