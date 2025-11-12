import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';

export interface GeocodeResult {
  longitude: number;
  latitude: number;
  placeName: string;
}

interface MapboxGeocodeResponse {
  type: string;
  features: Array<{
    center: [number, number];
    place_name: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  /**
   * Geocode an address to coordinates using Mapbox Geocoding API
   * @param address - The address to geocode
   * @returns Observable of geocode result with coordinates
   */
  public geocodeAddress(address: string): Observable<GeocodeResult | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `${this.baseUrl}/${encodedAddress}.json`;

    const params = new HttpParams()
      .set('access_token', environment.mapboxToken)
      .set('country', 'CO') // Limitar búsqueda a Colombia
      .set('limit', '1') // Solo necesitamos el mejor resultado
      .set('types', 'address,place'); // Buscar direcciones y lugares

    return this.http.get<MapboxGeocodeResponse>(url, { params }).pipe(
      map((response) => {
        if (response.features && response.features.length > 0) {
          const feature = response.features[0];
          return {
            longitude: feature.center[0],
            latitude: feature.center[1],
            placeName: feature.place_name,
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error geocoding address:', address, error);
        return of(null);
      }),
    );
  }
}
