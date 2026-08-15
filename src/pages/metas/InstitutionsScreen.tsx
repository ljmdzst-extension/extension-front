import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MostradorMapaInstituciones, { InstitucionPunto } from './MapaBuscadorEstructurado';
import { getInstitucionesParaMapa } from '@/services/api/private/metas/graphics/graphicsService';



const InstitutionsScreen = () => {
  
  
  const navigation = useNavigate();

  const [instituciones, setInstituciones] = useState<InstitucionPunto[]>([]);


  useEffect(() => {
    const fetchInstituciones = async () => {
  
     getInstitucionesParaMapa()
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
  }, []);

  return (
    <div className='container my-3'>
      <div className='d-flex justify-content-between align-items-center'>
            <CommonTitle bold underline textAlign='center'>
                Mapa de Instituciones
            </CommonTitle>
            <ArrowBack
                fontSize='large'
                className='m-1 rounded cursor-pointer'
                style={{ background: '#0a5d52', color: 'white' }}
                onClick={() => {
                  navigation('/gestion/metas');
                }}
            />
        </div>
      <div className='w-100'>          
        <MostradorMapaInstituciones instituciones={instituciones} />
      </div>
    </div>
  );
}


export default InstitutionsScreen;