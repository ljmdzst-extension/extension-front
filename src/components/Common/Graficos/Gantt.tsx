import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getGraphicsDataGantt } from '@/services/api/private/metas/graphics/graphicsService';

// Tipos adaptados al contrato de la API
export interface Activity {
  idArea: number;
  anio: number;
  desc: string;
  nro: number;
  fechaDesde: string;
  fechaHasta: string | null;
}

export interface Area {
  idArea: number;
  nom: string;
}

export interface GraphicsResponse {
  activities: Activity[];
  areas: Area[];
}

export default function GanttChart({ selectedYear }: { selectedYear: number }) {
  const [data, setData] = useState<GraphicsResponse>({ activities: [], areas: [] });
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch de datos cada vez que cambia el año prop
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getGraphicsDataGantt(selectedYear);

        if (isMounted) {
          // Desestructuración defensiva por si la respuesta viene envuelta en response.data
          const payload = (response as any)?.data ?? response;
          const safeAreas = payload?.areas ?? [];
          const safeActivities = payload?.activities ?? [];

          setData({
            areas: safeAreas,
            activities: safeActivities,
          });

          // Selecciona el ID de la primera área por defecto si existe
          if (safeAreas.length > 0) {
            setSelectedAreaId(safeAreas[0].idArea);
          } else {
            setSelectedAreaId(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar los datos');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Encuentra el nombre del área activa para mostrar en el tooltip
  const activeAreaName = useMemo(() => {
    return data?.areas?.find((area) => area.idArea === selectedAreaId)?.nom || '';
  }, [data?.areas, selectedAreaId]);

  // 2. Filtrado y formateo de actividades para Recharts
  const chartData = useMemo(() => {
    if (!selectedAreaId || !data?.activities) return [];

    return (data.activities ?? [])
      .filter((item) => {
        if (!item?.fechaDesde) return false;
        return item.idArea === selectedAreaId;
      })
      .map((item) => {
        const startDate = new Date(`${item.fechaDesde}T00:00:00`).getTime();
        const hasta = item.fechaHasta || item.fechaDesde;
        const endDateObj = new Date(`${hasta}T00:00:00`);

        // Si la fecha desde y hasta son iguales, sumamos 1 día para visibilidad en el gráfico
        if (item.fechaDesde === hasta) {
          endDateObj.setDate(endDateObj.getDate() + 1);
        }

        return {
          nro: `Act. ${item.nro}`,
          desc: item.desc,
          range: [startDate, endDateObj.getTime()],
          desde: item.fechaDesde,
          hasta: hasta,
          nombreArea: activeAreaName,

        };
      });
  }, [data?.activities, selectedAreaId, activeAreaName]);

  // Calculamos la altura dinámica según la cantidad de barras
  const computedHeight = Math.max(300, chartData.length * 35);

  if (loading) return <div>Cargando datos del gráfico...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controles de Selección */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', flexShrink: 0 }}>
        <div>
          <label htmlFor="area-select" style={{ marginRight: '8px', fontWeight: 'bold' }}>
            Seleccionar Área:
          </label>
          <select
            id="area-select"
            value={selectedAreaId ?? ''}
            onChange={(e) => setSelectedAreaId(Number(e.target.value))}
          >
            {data?.areas?.map((area) => (
              <option key={area.idArea} value={area.idArea}>
                {area.nom}
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
          padding: '10px',
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
                `${props.payload.desc}`,
                `Desde: ${props.payload.desde} | Hasta: ${props.payload.hasta}`
              ]}
            />
            <Bar dataKey="range" fill="#3182ce" radius={4} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}