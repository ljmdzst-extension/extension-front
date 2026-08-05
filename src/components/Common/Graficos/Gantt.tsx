import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface RawData {
  idArea: number;
  idPrograma: number;
  desde: string;
  hasta: string | null;
}

interface GanttProps {
  data: RawData[];
}

export default function GanttChart({ data }: GanttProps) {
  // Extraer los años disponibles de los datos dinámicamente
  const availableYears = useMemo(() => {
    const years = data.map((item) => new Date(`${item.desde}T00:00:00`).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears[0] ?? new Date().getFullYear()
  );

  // Filtrar y formatear los datos para Recharts
  const chartData = useMemo(() => {
    return data
      .filter((item) => {
        const year = new Date(`${item.desde}T00:00:00`).getFullYear();
        return year === selectedYear;
      })
      .map((item, index) => {
        // Concatenamos T00:00:00 para evitar desajustes por zona horaria local
        const startDate = new Date(`${item.desde}T00:00:00`).getTime();
        const endDate = item.hasta 
          ? new Date(`${item.hasta}T00:00:00`).getTime() 
          : startDate;

        return {
          task: `Tarea ${index + 1}`,
          range: [startDate, endDate], // Barra de rango [inicio, fin]
          desde: item.desde,
          hasta: item.hasta || item.desde,
          idArea: item.idArea,
          idPrograma: item.idPrograma,
        };
      });
  }, [data, selectedYear]);

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {/* Selector de Año dinámico */}
      <div style={{ marginBottom: '20px' }}>
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

      {/* Gráfico de Gantt */}
      <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 50)}>
        <BarChart layout="vertical" data={chartData} margin={{ left: 20, right: 20 }}>
          <XAxis
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(time) => new Date(time).toLocaleDateString()}
          />
          <YAxis type="category" dataKey="task" />
          <Tooltip
            formatter={(_, __, props) => [
              `Desde: ${props.payload.desde} | Hasta: ${props.payload.hasta}`,
              `Programa ${props.payload.idPrograma} (Área ${props.payload.idArea})`
            ]}
          />
          <Bar dataKey="range" fill="#3182ce" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}