import GanttChart from '@/components/Common/Graficos/Gantt';
import CommonTitle from '@/components/Common/Text/CommonTitle';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const GanttScreen = () => {

  const navigation = useNavigate();
  const availableYears = [2023, 2024,2025,2026];
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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
        <div>
          <label htmlFor="year-select" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Seleccionar Año:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <GanttChart selectedYear={selectedYear} />
      </div>
    </div>
  );
};

export default GanttScreen;