import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// CSS de Leaflet (súper importante para que no colapse visualmente)
import 'leaflet/dist/leaflet.css';

// Fix de íconos predeterminados de Leaflet para Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
}

interface Props {
  onLocationSelect?: (coords: { lat: number; lng: number; address?: string }) => void;
}

const DEFAULT_CENTER: [number, number] = [-31.6333, -60.7000]; // Santa Fe, Argentina

// Escuchador de clics en el lienzo del mapa
const MapEvents: React.FC<{ onSelectPoint: (lat: number, lng: number) => void }> = ({ onSelectPoint }) => {
  useMapEvents({
    click(e) {
      onSelectPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapaBuscadorEstructurado: React.FC<Props> = ({ onLocationSelect }) => {
  // Inputs del formulario
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Argentina');

  // Estados de control de búsqueda y punto activo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Punto visible en el mapa (por defecto en el centro)
  const [selectedPoint, setSelectedPoint] = useState<LocationData>({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
    displayName: 'Ubicación inicial (haz clic o arrastra el marcador)',
  });

  // Handler de Búsqueda para React 18
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: '1',
    });

    if (street.trim()) params.append('street', street.trim());
    if (city.trim()) params.append('city', city.trim());
    if (state.trim()) params.append('state', state.trim());
    if (country.trim()) params.append('country', country.trim());

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'MiAplicacionInstituciones/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLocation: LocationData = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
        };

        setSelectedPoint(newLocation);
        if (onLocationSelect) {
          onLocationSelect({ lat: newLocation.lat, lng: newLocation.lng, address: newLocation.displayName });
        }
      } else {
        setError('No se encontraron resultados para la dirección ingresada.');
      }
    } catch (err) {
      console.error('Error al buscar dirección:', err);
      setError('Ocurrió un error al consultar el servicio de ubicación.');
    } finally {
      setLoading(false);
    }
  };

  // Clic directo sobre el mapa
  const handleMapClick = (lat: number, lng: number) => {
    const point = {
      lat,
      lng,
      displayName: `Ubicación seleccionada (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    };
    setSelectedPoint(point);
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: point.displayName });
    }
  };

  // Arrastrar el pin
  const handleMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const point = {
      lat: position.lat,
      lng: position.lng,
      displayName: `Ubicación ajustada (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`,
    };
    setSelectedPoint(point);
    if (onLocationSelect) {
      onLocationSelect({ lat: position.lat, lng: position.lng, address: point.displayName });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Ubicación de la Institución</h2>
        <span className="text-xs text-gray-500 italic">
          Ingresa la dirección o interactúa libremente con el mapa.
        </span>
      </div>

      {/* Formulario Estructurado */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200"
      >
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Calle y N°</label>
          <input
            type="text"
            placeholder="Ej: San Martín 1234"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
          <input
            type="text"
            placeholder="Ej: Santa Fe"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Provincia / Estado</label>
          <input
            type="text"
            placeholder="Ej: Santa Fe"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">País</label>
          <input
            type="text"
            placeholder="Ej: Argentina"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar Dirección'}
          </button>

          <div className="text-right">
            <span className="block text-xs text-blue-600 font-semibold">Coordenadas:</span>
            <span className="text-xs text-gray-700 font-mono">
              Lat: <strong>{selectedPoint.lat.toFixed(6)}</strong> | Lng: <strong>{selectedPoint.lng.toFixed(6)}</strong>
            </span>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* MAPA VISUAL (Estilo de altura explícito) */}
      <div
        style={{ height: '450px', width: '100%', position: 'relative' }}
        className="rounded-lg overflow-hidden border border-gray-300 shadow-sm"
      >
        <MapContainer
          key={`${selectedPoint.lat}-${selectedPoint.lng}`}
          center={[selectedPoint.lat, selectedPoint.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onSelectPoint={handleMapClick} />

          <Marker
            position={[selectedPoint.lat, selectedPoint.lng]}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Punto de Institución:</strong>
                <br />
                {selectedPoint.displayName}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapaBuscadorEstructurado;