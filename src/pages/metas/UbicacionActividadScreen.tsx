import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MapaUbicacionActividades, { UbicacionPunto } from './MapaUbicacionActividades';
import { getUbicacionActividadParaMapa } from '@/services/api/private/metas/graphics/graphicsService';
import YearSelector from '@/components/Common/YearSelector';



const UbicacionActividadScreen = () => {
  
  
  const navigation = useNavigate();

  const availableYears = [2023, 2024,2025,2026];
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [ubicaciones, setUbicaciones] = useState<UbicacionPunto[]>([]);


  useEffect(() => {
    const fetchUbicaciones = async () => {
  
     getUbicacionActividadParaMapa(selectedYear)
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setUbicaciones(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching institutions:', error);
        });

    };

    fetchUbicaciones();
  }, [selectedYear]);

  return (
    <div className='container my-3'>
      <div className='d-flex justify-content-between align-items-center'>
            <CommonTitle bold underline textAlign='center'>
                Mapa de Ubicaciones
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
        <div className='d-flex justify-content-center align-items-center m-2'>
          <YearSelector year={selectedYear} onYearChange={setSelectedYear} />
        </div>
        <MapaUbicacionActividades ubicaciones={ubicaciones} />
        
      </div>
    </div>
  );
}


export default UbicacionActividadScreen;