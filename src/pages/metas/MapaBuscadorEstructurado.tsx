import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importación del archivo GeoJSON con los distritos
import distritosSantaFeData from './geojson.json';

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

export interface InstitucionPunto {
  idActividad?: number | string;
  actividadNombre?: string;
  idInstitucion?: number;
  nom: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  latitud?: string | number;
  longitud?: string | number;
}


const DEFAULT_CENTER: [number, number] = [-31.6333, -60.7000]; // Santa Fe, Argentina

const PALETA_COLORES: string[] = [
    '#e6194b', '#0fb425', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
    '#107903', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#749e81',
    '#808000', '#ffd8b1', '#000075', '#808080', '#107c41', '#e81123', '#0078d4', '#ff8c00',
    '#00bcf2', '#b4009e', '#008a00', '#a40000', '#68217a', '#00188f', '#004e8c', '#00bcb4',
    '#228b22', '#dc143c', '#4b0082', '#ff1493', '#795548', '#607d8b', '#ff5722', '#9c27b0',
    '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
    '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#8d6e63', '#78909c', '#d32f2f', '#c2185b',
    '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c',
    '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00', '#e64a19'
];

const obtenerColorActividad = (key?: string | number): string => {
    if (!key) return '#0d6efd';
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PALETA_COLORES.length;
    return PALETA_COLORES[index];
};

const crearIconoMarcador = (color: string) => {
    const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
            <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z"/>
            <circle cx="12" cy="12" r="4.5" fill="#FFFFFF"/>
        </svg>
    `;

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svgIcon,
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [0, -38],
    });
};

const AutoFitBounds: React.FC<{ points: [number, number][]}> = ({ points }) => {
  const map = useMap();

  const ultimosPuntosRef = React.useRef<string>('');

  useEffect(() => {
    if (points.length  == 0) return;

    const puntosString = JSON.stringify(points);
    if (ultimosPuntosRef.current === puntosString) {
      console.log('Los puntos no han cambiado, no se ajusta el mapa.');
      return;
    }

   const bounds = L.latLngBounds(points);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      ultimosPuntosRef.current = puntosString; // Guardamos las coordenadas aplicadas
    }
  }, [points, map]);

  return null;
};

export const MostradorMapaInstituciones = ({
  instituciones,
  height = '70vh',
  mostrarDistritos = true,
}:{ 
  instituciones: InstitucionPunto[];
  height?: string;
  mostrarDistritos?: boolean;
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

  const initialCenter: [number, number] = coordsList.length > 0 ? coordsList[0] : DEFAULT_CENTER;

  // Estilo para cada polígono de distrito respetando las propiedades del GeoJSON
  const estiloDistrito = (feature: any) => {
    return {
      color: feature?.properties?.stroke || '#2b5c8f',
      weight: feature?.properties?.['stroke-width'] || 2,
      opacity: feature?.properties?.['stroke-opacity'] || 0.8,
      fillColor: feature?.properties?.fill || '#2b5c8f',
      fillOpacity: feature?.properties?.['fill-opacity'] || 0.25,
    };
  };

  // Popup con el nombre del distrito al hacer clic o sobrevolar
  const alCadaDistrito = (feature: any, layer: L.Layer) => {
    if (feature?.properties?.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
    }
  };

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

        {/* Capa de Distritos de Santa Fe */}
        {mostrarDistritos && (
          <GeoJSON
            data={distritosSantaFeData as any}
            style={estiloDistrito}
            onEachFeature={alCadaDistrito}
            filter={(feature) => feature.geometry.type !== 'Point'} // Muestra solo polígonos
          />
        )}
        
        
        {/* Ajusta automáticamente la vista del mapa a todos los marcadores */}
        <AutoFitBounds points={coordsList} />
      
        {/* Renderizar cada marcador */}
        {puntosValidos.map((item, index) => {
          const idActividad = item.idActividad || item.actividadNombre || index;
          const colorActividad = obtenerColorActividad(idActividad);
          const iconoMarcador = crearIconoMarcador(colorActividad);

          return (
            <Marker
              key={item.idInstitucion || `${item.nom}-${index}`}
              position={[item.lat, item.lng]}
              icon={iconoMarcador}
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

                  {item.actividadNombre && (
                    <div className="fw-semibold small mb-2 mt-2 text-dark">
                      Actividad: {item.actividadNombre}
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
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MostradorMapaInstituciones;