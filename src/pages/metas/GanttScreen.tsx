import GanttChart from '@/components/Common/Graficos/Gantt';
import { sampleData } from './datosGantt';

const GanttScreen = () => {
  return (
    <div className='container my-3'>
      <div className='w-100'>
        <GanttChart data={sampleData} />
      </div>
    </div>
  );
};

export default GanttScreen;