export interface AddressData {
  pais: string;
  provincia: string;
  departamento: string;
  ciudad: string;
  direccion: string;
}

export interface Coordinates {
  latitud: string;
  longitud: string;
}

export async function georefSearch(data: AddressData): Promise<Coordinates | null> {
  const params = new URLSearchParams({
    direccion: data.direccion,
    provincia: data.provincia,
    departamento: data.departamento,
    localidad: data.ciudad,
  });

  const response = await fetch(
    `https://apis.datos.gob.ar/georef/api/v2.0/direcciones?${params}`
  );

  if (!response.ok) {
    throw new Error(`Georef error: ${response.status}`);
  }

  const result = await response.json();

  console.log("Georef result:", result);

  if (!result.direcciones || result.direcciones.length === 0) {
    return null;
  }

  const ubicacion = result.direcciones[0].ubicacion;

  if (!ubicacion?.lat || !ubicacion?.lon) {
    return null;
  }

  return {
    latitud: String(ubicacion.lat),
    longitud: String(ubicacion.lon),
  };
}