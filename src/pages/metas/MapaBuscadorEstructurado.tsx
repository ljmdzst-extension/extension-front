import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de íconos predeterminados de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Estructura de la institución (ajusta según tus types)
export interface InstitucionPunto {
  idInstitucion?: number;
  nom: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  latitud?: string | number;
  longitud?: string | number;
}

interface Props {
  instituciones: InstitucionPunto[];
  height?: string;
}

const DEFAULT_CENTER: [number, number] = [-31.6333, -60.7000]; // Santa Fe, Argentina

// Componente para reajustar el zoom y centrado cuando hay múltiples marcadores
const AutoFitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [points, map]);

  return null;
};

export const MostradorMapaInstituciones: React.FC<Props> = ({
  instituciones,
  height = '450px',
}) => {
  // Filtrar y parsear solo los puntos que tienen coordenadas válidas
  const puntosValidos = instituciones
    .map((inst) => {
      const lat = typeof inst.latitud === 'string' ? parseFloat(inst.latitud) : inst.latitud;
      const lng = typeof inst.longitud === 'string' ? parseFloat(inst.longitud) : inst.longitud;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { ...inst, lat, lng };
      }
      return null;
    })
    .filter((inst): inst is InstitucionPunto & { lat: number; lng: number } => inst !== null);

  const coordsList: [number, number][] = puntosValidos.map((p) => [p.lat, p.lng]);

  const initialCenter: [number, number] =
    coordsList.length > 0 ? coordsList[0] : DEFAULT_CENTER;

  return (
    <div
      style={{ height, width: '100%', position: 'relative' }}
      className="rounded-lg overflow-hidden border border-gray-300 shadow-sm"
    >
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajusta automáticamente la vista del mapa a todos los marcadores */}
        <AutoFitBounds points={coordsList} />

        {/* Renderizar cada marcador */}
        {puntosValidos.map((item, index) => (
          <Marker
            key={item.idInstitucion || `${item.nom}-${index}`}
            position={[item.lat, item.lng]}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-blue-600">{item.nom}</strong>
                {item.direccion && (
                  <div>
                    <small>{item.direccion}</small>
                  </div>
                )}
                {(item.ciudad || item.provincia) && (
                  <div className="text-xs text-gray-500">
                    {[item.ciudad, item.provincia].filter(Boolean).join(', ')}
                  </div>
                )}
                <hr className="my-1" />
                <a
                  href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MostradorMapaInstituciones;