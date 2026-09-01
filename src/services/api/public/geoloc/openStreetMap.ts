import { AddressData, Coordinates } from './geoRef';

export async function openStreetMapSearch(
  data: AddressData
): Promise<Coordinates | null> {
  try {
    const countryCode = "ar";

    // Configuración base de parámetros obligatorios
    const baseParams = new URLSearchParams({
      format: "json",
      limit: "1",
      addressdetails: "1",
      layer: "address,poi"
    });

    
    baseParams.append("countrycodes", countryCode);

  

    if(!data.departamento.toLowerCase().includes("departamento")){
      data.departamento = "Departamento " + data.departamento;
    }


    if(data.direccion.toLocaleLowerCase().includes("irigoyen")){
        data.direccion = data.direccion.toLowerCase().replace("irigoyen","Yrigoyen");
        console.log("Se reemplazó 'Irigoyen' por 'Yrigoyen' en la ciudad");
    }


    // -------------------------------------------------------------
    // INTENTO 1: Búsqueda estructurada completa (Máxima precisión)
    // -------------------------------------------------------------
    const params1 = new URLSearchParams(baseParams);
    if (data.direccion) params1.append("street", data.direccion);
    if (data.ciudad) params1.append("city", data.ciudad);
    if (data.departamento) params1.append("county",data.departamento);
    if (data.provincia) params1.append("state", data.provincia);
    if (data.pais) params1.append("country", data.pais);

    let result = await fetchNominatim(params1);
    if (result) return result;

    // -------------------------------------------------------------
    // INTENTO 2: Fallback estructurado (Sin departamento/county)
    // Se ejecuta si teníamos un departamento que pudo haber bloqueado la búsqueda
    // -------------------------------------------------------------
    if (data.provincia) {
      const params2 = new URLSearchParams(baseParams);
      if (data.direccion) params2.append("street", data.direccion);
      if (data.ciudad) params2.append("city", data.ciudad);
      if (data.provincia) params2.append("state", data.provincia); // Provincia manda
      if (data.pais) params2.append("country", data.pais);

      result = await fetchNominatim(params2);
      if (result) return result;
    }

    // -------------------------------------------------------------
    // INTENTO 3: Fallback a búsqueda libre 'q' (Máxima tolerancia)
    // Permite al motor difuso de Nominatim interpretar la dirección
    // -------------------------------------------------------------
    const queryLibre = [
      data.direccion,
      data.ciudad,
      data.departamento,
      data.provincia,
      data.pais
    ]
      .filter(Boolean)
      .join(", ");

    if (queryLibre) {
      const params3 = new URLSearchParams(baseParams);
      params3.append("q", queryLibre);

      result = await fetchNominatim(params3);
      if (result) return result;
    }

    return null;
  } catch (error) {
    console.error("Error buscando ubicación en Nominatim:", error);
    return null;
  }
}

/**
  Función auxiliar para realizar la petición HTTP a Nominatim
 */
async function fetchNominatim(
  params: URLSearchParams
): Promise<Coordinates | null> {


  console.log(`Buscando en Nominatim con parámetros: ${params.toString()}`);
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        // Nominatim exige un User-Agent identificable
        "User-Agent": "MiAplicacion/1.0"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Nominatim respondió con status ${response.status}`);
  }

  const results = await response.json();

  if (!results || results.length === 0) {
    return null;
  }

  return {
    latitud: results[0].lat,
    longitud: results[0].lon
  };
}