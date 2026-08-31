import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MostradorMapaInstituciones, { InstitucionPunto } from './MapaBuscadorEstructurado';
import { getInstitucionesParaMapa,getAreas } from '@/services/api/private/metas/graphics/graphicsService';
import YearSelector from '@/components/Common/YearSelector';

import {useParams,useSearchParams} from 'react-router-dom';



const InstitutionsScreen = () => {
  
  
  const navigation = useNavigate();

  const {year} = useParams();
  const [searchParams,setSearchParams] = useSearchParams();
  const [instituciones, setInstituciones] = useState<InstitucionPunto[]>([]);
  const [showDistritos, setShowDistritos] = useState<boolean>(false);
  const [areas, setAreas] = useState<{idArea: number; nom: string}[]>([]);



  const getYear = () => {

    const selectedYear = Number(year) || new Date().getFullYear();

    if(Number(year) < 2023 || Number(year) > new Date().getFullYear()) {
      return new Date().getFullYear();
    }
    return selectedYear;

  }
  const onChangeYear = (newYear: number) => {

    const selectedYear = Number(newYear) || new Date().getFullYear();

    if(Number(year) !== selectedYear){
      navigation(`/gestion/instituciones/${selectedYear}`);
    }

    return;

  }




  useEffect(() => {
    const fetchAreas = async () => {
      const selectedYear = getYear();

       getAreas({anio:selectedYear})
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setAreas(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching areas:', error);
        });
    
    }

    fetchAreas();

  }, [year]);

  useEffect(() => {
    const fetchInstituciones = async () => {

    const area = searchParams.get('area') ? Number(searchParams.get('area')) : undefined;

    const selectedYear = getYear();

     getInstitucionesParaMapa({ anio: selectedYear, area: area })
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setInstituciones(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching institutions:', error);
        })

    };



    fetchInstituciones();
  }, [searchParams,year]);


  const cambiarArea = (newArea: number | undefined) => {


    const currentArea = searchParams.get('area') ? Number(searchParams.get('area')) : undefined;
    
    if(currentArea == newArea){
      return;
    }
    
    // console.log("new area",newArea);
      
    setSearchParams((prevParams) => {

      if (newArea === undefined) {
        prevParams.delete('area');
        return prevParams;
      }

      prevParams.set('area', newArea?.toString() || '');
        return prevParams;
      });
  

  }


  return (
    <div className='container my-3'>
      <div className='d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom'>
            <CommonTitle bold underline textAlign='center'>
                Mapa de Instituciones
            </CommonTitle>
            <ArrowBack
                fontSize='large'
                className='m-1 rounded cursor-pointer'
                style={{ background: '#0a5d52', color: 'white' }}
                onClick={() => {
                  navigation('/gestion/seleccionar-grafica');
                }}
            />
        </div>
      <div className='w-100'>
        <select
            value={searchParams.get('area') || ''}
            onChange={(e) => cambiarArea(Number(e.target.value) || undefined)}
            className='form-select form-select-sm mx-2'
          >
            <option value=''>Todas las áreas</option>
            {areas.map((areaOption) => (
              <option key={areaOption.idArea} value={areaOption.idArea}>
                {areaOption.nom}
              </option>
            ))}
          </select>
        <div className='d-flex justify-content-center align-items-center m-2'>
          <YearSelector year={getYear()} onYearChange={onChangeYear} />
        </div>          

        <button
          onClick={() => setShowDistritos((prev) => !prev)}
          style={{ zIndex: 1000 }}
          className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded shadow border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer mb-2"
          title="Alternar capa de distritos"
        >
          {showDistritos ? 'Ocultar Distritos' : 'Mostrar Distritos'}
        </button>


        <MostradorMapaInstituciones instituciones={instituciones} mostrarDistritos={showDistritos} />
      </div>
    </div>
  );
}


export default InstitutionsScreen;