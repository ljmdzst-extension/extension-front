import GanttChart, { RawData } from '@/components/Common/Graficos/Gantt';

const sampleData: RawData[] = [
  { idArea: 1, idPrograma: 1, desde: '2024-04-19', hasta: '2024-04-26' },
  { idArea: 1, idPrograma: 2, desde: '2024-03-01', hasta: null },
  { idArea: 2, idPrograma: 1, desde: '2025-05-05', hasta: '2025-12-19' },
  { idArea: 2, idPrograma: 2, desde: '2026-06-10', hasta: '2026-06-12' }
];

const GanttScreen = () => {
  return (
    <div className='container d-flex flex-column h-100'>
      <div className='d-flex justify-content-center align-items-center m-2 w-100'>
        {/* Se pasa la prop "data" correctamente */}
        <GanttChart data={sampleData} />
      </div>
    </div>
  );
};


export default GanttScreen;