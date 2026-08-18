import { AddressData, Coordinates } from './geoRef';

export async function openStreetMapSearch(
  data: AddressData
): Promise<Coordinates | null> {
  try {
    const query = [
      data.direccion,
      data.ciudad,
      data.departamento,
      data.provincia,
      data.pais
    ]
      .filter(Boolean)
      .join(", ");

    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      addressdetails: "1",
      countrycodes: "ar"
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "MiAplicacion/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim respondió con ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return null;
    }

    const result = results[0];

    return {
      latitud: Number(result.lat),
      longitud: Number(result.lon)
    };

  } catch (error) {
    console.error("Error buscando ubicación:", error);
    return null;
  }
}