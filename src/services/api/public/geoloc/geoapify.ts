import { AddressData, Coordinates } from './geoRef';

export async function geoapifySearch(data: AddressData): Promise<Coordinates | null> {
  const params = new URLSearchParams({
    street: data.direccion,
    city: data.ciudad + (data.departamento ? `, ${data.departamento}` : ""),
    state: data.provincia,
    country: "Argentina",
    format: "json",
    limit: "1",
    apiKey: 'YOUR_GEOAPIFY_API_KEY', // Reemplaza con tu clave de API de Geoapify
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params}`
  );

  if (!response.ok) {
    throw new Error(`Geoapify error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const location = result.results[0];

  if (
    typeof location.lat !== "number" ||
    typeof location.lon !== "number"
  ) {
    return null;
  }

  return {
    latitud: location.lat,
    longitud: location.lon,
  };
}