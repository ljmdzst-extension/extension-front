import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

import CommonTitle from '@/components/Common/Text/CommonTitle';
import YearSelector from '@/components/Common/YearSelector';
import MapaUbicacionActividades, { UbicacionMapaItem } from './MapaUbicacionActividades';
import { getUbicacionActividadParaMapa, getAreas } from '@/services/api/private/metas/graphics/graphicsService';

const UbicacionActividadScreen = () => {
  const navigation = useNavigate();
  const { year } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ubicaciones, setUbicaciones] = useState<UbicacionMapaItem[]>([]);
  const [areas, setAreas] = useState<{ idArea: number; nom: string }[]>([]);

  const [showDistritos, setShowDistritos] = useState<boolean>(false);
  // 1. Saneamiento del año
  const currentYearDate = new Date().getFullYear();
  const parsedYear = Number(year);
  const selectedYear = (!parsedYear || parsedYear < 2023 || parsedYear > currentYearDate) 
    ? currentYearDate 
    : parsedYear;

  // 2. Extraer área activa desde Query Parameters (?area=3)
  const currentArea = searchParams.get('area') ? Number(searchParams.get('area')) : undefined;

  // 3. Redirección si el año en la URL no es válido
  useEffect(() => {
    if (parsedYear !== selectedYear) {
      navigation(`/gestion/ubicaciones/${selectedYear}`, { replace: true });
    }
  }, [parsedYear, selectedYear, navigation]);

  // 4. Cargar lista de áreas para el selector según el año
  useEffect(() => {
    getAreas({ anio: selectedYear })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setAreas(data.data);
        }
      })
      .catch((error) => console.error('Error fetching areas:', error));
  }, [selectedYear]);

  // 5. Cargar ubicaciones filtrando por año y área opcional
  useEffect(() => {
    getUbicacionActividadParaMapa({ anio: selectedYear, area: currentArea })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setUbicaciones(data.data);
        }
      })
      .catch((error) => console.error('Error fetching activity locations:', error));
  }, [selectedYear, currentArea]);

  const onChangeYear = (newYear: number) => {
    if (selectedYear !== newYear) {
      navigation(`/gestion/ubicaciones/${newYear}`);
    }
  };

  const cambiarArea = (newArea: number | undefined) => {
      if (currentArea === newArea) return;

      // 1. Convertimos los parámetros actuales a un objeto JS plano
      const currentParams = Object.fromEntries(searchParams.entries());

      if (newArea === undefined) {
        // 2a. Si elegimos "Todas", borramos la clave 'area'
        delete currentParams.area;
      } else {
        // 2b. Si elegimos un área, asignamos el valor
        currentParams.area = newArea.toString();
      }

      // 3. Pasamos el nuevo objeto directamente a setSearchParams
      setSearchParams(currentParams, { replace: true });
  };

  return (
    <div className='container my-3'>
      <div className='d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom'>
        <CommonTitle bold underline textAlign='center'>
          Mapa de Ubicaciones
        </CommonTitle>
        <ArrowBack
          fontSize='large'
          className='m-1 rounded cursor-pointer'
          style={{ background: '#0a5d52', color: 'white' }}
          onClick={() => navigation('/gestion/seleccionar-grafica')}
        />
      </div>

      <div className='w-100'>
        {/* Selector de Áreas */}
        <select
          value={currentArea ?? ''}
          onChange={(e) => cambiarArea(e.target.value ? Number(e.target.value) : undefined)}
          className='form-select form-select-sm mx-2'
        >
          <option value=''>Todas las áreas</option>
          {areas.map((areaOption) => (
            <option key={areaOption.idArea} value={areaOption.idArea}>
              {areaOption.nom}
            </option>
          ))}
        </select>

        {/* Selector de Año */}
        <div className='d-flex justify-content-center align-items-center m-2'>
          <YearSelector year={selectedYear} onYearChange={onChangeYear} />
        </div>


        <button
          onClick={() => setShowDistritos((prev) => !prev)}
          style={{ zIndex: 1000 }}
          className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded shadow border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Alternar capa de distritos"
        >
          {showDistritos ? 'Ocultar Distritos' : 'Mostrar Distritos'}
        </button>

        <MapaUbicacionActividades ubicaciones={ubicaciones} mostrarDistritos={showDistritos} />
      </div>
    </div>
  );
};

export default UbicacionActividadScreen;