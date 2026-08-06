import GanttChart from '@/components/Common/Graficos/Gantt';
import { sampleData } from './datosGantt';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GanttScreen = () => {

  const navigation = useNavigate();
  
  return (
    <div className='container my-3'>
      <div className='d-flex justify-content-between align-items-center'>
            <CommonTitle bold underline textAlign='center'>
                Gantt Chart
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
        <GanttChart data={sampleData} />
      </div>
    </div>
  );
};

export default GanttScreen;