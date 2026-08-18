export type LocationData = {
  lat: number;
  lng: number;
  displayName: string;
};

export type LocationSearchParams = {
  street: string;
  city: string;
  state: string;
  country: string;
};

const sanitizeText = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
};

export const handleSearch = async (
  { street, city, state, country }: LocationSearchParams,
  tries: number = 0
): Promise<LocationData | undefined> => {
  let cleanCity = sanitizeText(city);
  const cleanState = sanitizeText(state);
  const cleanStreet = sanitizeText(street);

  // Normalizar casos comunes para Georef AR
  const cityKey = cleanCity.toLowerCase().replace(/\s+/g, '');
  if (cityKey.includes('santafe')) {
    cleanCity = 'Santa Fe';
  }

  const params = new URLSearchParams({
    direccion: cleanStreet,
    localidad: cleanCity,
    provincia: cleanState,
  });

  try {
    console.log('Buscando dirección en Georef AR:', params.toString());

    const response = await fetch(
      `https://apis.datos.gob.ar/georef/api/direcciones?${params.toString()}`
    );

    const data = await response.json();
    console.log('Resultados obtenidos de Georef AR:', data);

    if (data.direcciones && data.direcciones.length > 0) {
      const bestMatch = data.direcciones[0];

      return {
        lat: bestMatch.ubicacion.lat,
        lng: bestMatch.ubicacion.lon,
        displayName: bestMatch.nomenclatura,
      };
    } else {
      console.log('No se encontraron resultados en Georef AR.');
      return undefined;
    }
  } catch (err) {
    console.error('Error al consultar Georef AR:', err);

    if (tries < 3) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await handleSearch({ street, city, state, country }, tries + 1);
    }

    return undefined;
  }
};