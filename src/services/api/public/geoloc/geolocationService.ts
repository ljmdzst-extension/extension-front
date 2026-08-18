import { georefSearch, AddressData,Coordinates } from './geoRef';
import {openStreetMapSearch} from './openStreetMap';

export async function handleSearch(data: AddressData): Promise<Coordinates> {
  // Primero intentamos con Georef
  try {
    const georefResult = await georefSearch(data);

    if (georefResult) {
      console.log("Ubicación obtenida mediante Georef");

      return georefResult;
    }
  } catch (error) {
    console.error("Georef falló:", error);
  }


  /* 
  try {
    const geoapifyResult = await geoapifySearch(data);
    if (geoapifyResult) {
      console.log("Ubicación obtenida mediante Geoapify");
      return geoapifyResult;
    }
  } catch (error) {
    console.error("Geoapify falló:", error);
  }
  */

  // Si Georef falla, usamos OpenStreetMap
  try {
    const openStreetMapResult = await openStreetMapSearch(data);

    if (openStreetMapResult) {
      console.log("Ubicación obtenida mediante OpenStreetMap");

      return openStreetMapResult;
    }
  } catch (error) {
    console.error("OpenStreetMap falló:", error);
  }




  throw new Error(
    "No se pudo obtener la ubicación para la dirección indicada."
  );
}