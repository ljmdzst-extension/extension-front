import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MostradorMapaInstituciones, { InstitucionPunto } from './MapaBuscadorEstructurado';
import { getInstitucionesParaMapa } from '@/services/api/private/metas/graphics/graphicsService';
import YearSelector from '@/components/Common/YearSelector';



const InstitutionsScreen = () => {
  
  
  const navigation = useNavigate();

  const [instituciones, setInstituciones] = useState<InstitucionPunto[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());


  useEffect(() => {
    const fetchInstituciones = async () => {
  
     getInstitucionesParaMapa({ anio: selectedYear })
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            setInstituciones(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching institutions:', error);
        });

    };

    fetchInstituciones();
  }, [selectedYear]);

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
        <div className='d-flex justify-content-center align-items-center m-2'>
          <YearSelector year={selectedYear} onYearChange={setSelectedYear} />
        </div>          
        <MostradorMapaInstituciones instituciones={instituciones} />
      </div>
    </div>
  );
}


export default InstitutionsScreen;