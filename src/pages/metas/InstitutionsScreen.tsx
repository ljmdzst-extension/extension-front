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

  const [showDistritos, setShowDistritos] = useState<boolean>(false);


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

        <button
          onClick={() => setShowDistritos((prev) => !prev)}
          style={{ zIndex: 1000 }}
          className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded shadow border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
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