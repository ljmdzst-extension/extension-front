import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ubicacione } from '@/types/ActivityProps';

// Fix de íconos predeterminados de Leaflet para Webpack / Next.js / Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Extendemos Ubicacione para permitir 'nom' o 'desc' indistintamente
export type UbicacionMapaItem = Ubicacione & {
    nom?: string;
};

interface Props {
    ubicaciones: UbicacionMapaItem[];
    height?: string;
}

const DEFAULT_CENTER: [number, number] = [-31.6333, -60.7000]; // Santa Fe, Argentina

// Componente para reajustar el zoom y centrado automáticamente según los puntos
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
    height = '380px',
}) => {
    // Parsear y filtrar elementos con coordenadas válidas (latitud y longitud)
    const elementosValidos = ubicaciones
        .map((item) => {
            const lat = typeof item.latitud === 'string' ? parseFloat(item.latitud) : item.latitud;
            const lng = typeof item.longitud === 'string' ? parseFloat(item.longitud) : item.longitud;

            if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
                return { ...item, lat, lng };
            }
            return null;
        })
        .filter((item): item is UbicacionMapaItem & { lat: number; lng: number } => item !== null);

    const coordsList: [number, number][] = elementosValidos.map((p) => [p.lat, p.lng]);
    const initialCenter: [number, number] = coordsList.length > 0 ? coordsList[0] : DEFAULT_CENTER;

    if (elementosValidos.length === 0) {
        return (
            <div
                style={{ height }}
                className="d-flex align-items-center justify-content-center bg-light border rounded text-muted"
            >
                <span>No hay ubicaciones georreferenciadas para mostrar en el mapa.</span>
            </div>
        );
    }

    return (
        <div
            style={{ height, width: '100%', position: 'relative' }}
            className="rounded overflow-hidden border border-secondary-subtle shadow-sm my-3"
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

                {/* Encuadre automático */}
                <AutoFitBounds points={coordsList} />

                {elementosValidos.map((item, index) => {
                    const key = item.idUbicacion || `${item.desc || item.nom}-${index}`;
                    const radioMetros = Number(item.radio) || 0;
                    const esCirculo = radioMetros > 0;
                    const nombreLugar = item.desc || item.nom || 'Ubicación sin nombre';

                    return (
                        <React.Fragment key={key}>
                            {/* DIBUJAR CIRCUNFERENCIA SI RADIO > 0 */}
                            {esCirculo && (
                                <Circle
                                    center={[item.lat, item.lng]}
                                    radius={radioMetros}
                                    pathOptions={{
                                        color: '#0d6efd',       // Azul Bootstrap
                                        fillColor: '#0d6efd',
                                        fillOpacity: 0.25,
                                        weight: 2,
                                        dashArray: '4, 4',       // Borde punteado para distinguir áreas
                                    }}
                                />
                            )}

                            {/* MARCADOR DEL PUNTO CENTRAL */}
                            <Marker position={[item.lat, item.lng]}>
                                <Popup>
                                    <div className="p-1 style-popup">
                                        <strong className="text-primary d-block mb-1">{nombreLugar}</strong>

                                        {esCirculo ? (
                                            <span className="badge bg-info text-dark mb-2">
                                                Radio de cobertura: {radioMetros} m
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary mb-2">Punto Exacto</span>
                                        )}

                                        {item.direccion && (
                                            <div className="small text-secondary">
                                                {item.direccion}
                                            </div>
                                        )}

                                        {(item.ciudad || item.provincia) && (
                                            <div className="small text-muted">
                                                {[item.ciudad, item.provincia, item.pais].filter(Boolean).join(', ')}
                                            </div>
                                        )}

                                        <hr className="my-2" />

                                        <a
                                            href={item.enlace || `https://www.google.com/maps?q=${item.lat},${item.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary w-100 mt-1"
                                        >
                                            Ver en Google Maps
                                        </a>
                                    </div>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapaUbicacionActividades;