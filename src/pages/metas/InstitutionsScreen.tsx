import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapaBuscadorEstructurado } from './MapaBuscadorEstructurado';
const InstitutionsScreen = () => {
  const navigation = useNavigate();
  const [year, setYear] = useState<number>(new Date().getFullYear());

    return (
        <div className='container d-flex flex-column h-100'>
            <MapaBuscadorEstructurado>

            </MapaBuscadorEstructurado>
        </div>

        )
}


export default InstitutionsScreen;