import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// Estructura de la institución o zona
export interface UbicacionPunto {
  idInstitucion?: number;
  nom: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  latitud?: string | number;
  longitud?: string | number;
  radio?: number; // Radio en metros (solo para círculos)
}

interface Props {
  ubicaciones: UbicacionPunto[];
  height?: string;
}

const DEFAULT_CENTER: [number, number] = [-31.6333, -60.7000]; // Santa Fe, Argentina

// Componente para reajustar el zoom y centrado automáticamente
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

export const MapaUbicacionActividades: React.FC<Props> = ({
  ubicaciones,
  height = '450px',
}) => {
  // Filtrar y parsear los elementos que poseen coordenadas válidas
  const elementosValidos = ubicaciones
    .map((inst) => {
      const lat = typeof inst.latitud === 'string' ? parseFloat(inst.latitud) : inst.latitud;
      const lng = typeof inst.longitud === 'string' ? parseFloat(inst.longitud) : inst.longitud;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { ...inst, lat, lng };
      }
      return null;
    })
    .filter((inst): inst is UbicacionPunto & { lat: number; lng: number } => inst !== null);

  const coordsList: [number, number][] = elementosValidos.map((p) => [p.lat, p.lng]);

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

        {/* Ajusta automáticamente la vista del mapa */}
        <AutoFitBounds points={coordsList} />

        {/* Renderizado condicional: Círculo o Marcador según el tipo */}
        {elementosValidos.map((item, index) => {
          const key = item.idInstitucion || `${item.nom}-${index}`;
          const esCirculo =
            item.radio != 0 && item.radio != null;

          return (
            <React.Fragment key={key}>
              {esCirculo ? (
                /* MOSTRAR ZONA CIRCULAR */
                <Circle
                  center={[item.lat, item.lng]}
                  radius={item.radio || 500} // Valor por defecto 500m si no viene radio
                  pathOptions={{
                    color: '#2563eb',       // Borde azul
                    fillColor: '#60a5fa',   // Relleno azul claro
                    fillOpacity: 0.3,       // Transparencia del relleno
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-blue-600">{item.nom}</strong>
                      <div>
                        <small className="text-gray-600">
                          Zona de Cobertura: {item.radio ? `${item.radio}m` : '500m'}
                        </small>
                      </div>
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
                        Abrir centro en Google Maps
                      </a>
                    </div>
                  </Popup>
                </Circle>
              ) : (
                /* MOSTRAR MARCADOR PUNTO */
                <Marker position={[item.lat, item.lng]}>
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
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaUbicacionActividades;