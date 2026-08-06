import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {getGraphicsDataGantt} from '@/services/api/private/metas/graphics/graphicsService';


export interface RawData {
  nro:number;
  idArea: number;
  desde: string;
  hasta: string | null;
  anio?: number; // Año opcional para filtrar
}

interface GanttProps {
  data: RawData[];
}

export default function GanttChart({ data }: GanttProps) {
  const availableYears = useMemo(() => {
    const today = new Date();
    const years = data.map((item) => item.anio ?? new Date(`${item.desde?item.desde:today.toISOString().split('T')[0]}T00:00:00`).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears[0] ?? new Date().getFullYear()
  );

  const availableAreas = useMemo(() => {
    const areas = data.map((item) => item.idArea);
    return Array.from(new Set(areas)).sort((a, b) => a - b);
  }, [data]);

  const [selectedArea, setSelectedArea] = useState<number>(
    availableAreas[0] ?? (availableAreas.length > 0 ? availableAreas[0] : 0)
  );

  const chartData = useMemo(() => {
    return data
      .filter((item) => {
        if (!item.desde || !item.hasta) return false;
        const year = item.anio ?? new Date(`${item.desde}T00:00:00`).getFullYear();
        return year === selectedYear && item.idArea === selectedArea;
      })
      .map((item, index) => {
        const startDate = new Date(`${item.desde}T00:00:00`).getTime();
        const endDateObj = new Date(`${item.hasta}T00:00:00`);

        // Si la fecha desde y hasta son iguales, sumamos 1 día exacto a endDateObj
        if (item.desde === item.hasta) {
            endDateObj.setDate(endDateObj.getDate() + 1);
        }
        return {
          nro: `Act. ${item.nro}`,
          range: [startDate, endDateObj.getTime()],
          desde: item.desde,
          hasta: item.hasta || item.desde,
          idArea: item.idArea
        };
      });
  }, [data, selectedYear, selectedArea]);

  // Calculamos la altura del canvas del gráfico según las tareas
  const computedHeight = Math.max(300, chartData.length * 35);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controles de Selección */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', flexShrink: 0 }}>
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

        <div>
          <label htmlFor="area-select" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Seleccionar Área:
          </label>
          <select
            id="area-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(Number(e.target.value))}
          >
            {availableAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor con Scroll para evitar el desbordamiento */}
      <div 
        style={{ 
          width: '100%', 
          maxHeight: '65vh', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px'
        }}
      >
        <ResponsiveContainer width="100%" height={computedHeight}>
          <BarChart layout="vertical" data={chartData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
            <XAxis
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(time) => new Date(time).toLocaleDateString()}
            />
            <YAxis type="category" dataKey="nro" interval={0} />
            <Tooltip
              formatter={(_, __, props) => [
                `Desde: ${props.payload.desde} | Hasta: ${props.payload.hasta}`,
                `Área ${props.payload.idArea}`
              ]}
            />
            <Bar dataKey="range" fill="#3182ce" radius={4} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}