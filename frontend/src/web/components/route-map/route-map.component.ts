import { Component, AfterViewInit, OnDestroy, input, effect, inject } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { forkJoin } from 'rxjs';

import { environment } from '@env/environment';
import { Order } from '@web/services/orders/interfaces/order.interface';
import { GeocodingService } from '@web/services/geocoding/geocoding.service';

@Component({
  selector: 'app-route-map',
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.scss',
  imports: [],
})
export class RouteMapComponent implements AfterViewInit, OnDestroy {
  orders = input<Order[]>([]);

  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private readonly geocodingService = inject(GeocodingService);

  constructor() {
    mapboxgl.accessToken = environment.mapboxToken;

    effect(() => {
      const currentOrders = this.orders();
      if (this.map && currentOrders.length > 0) {
        this.addOrderMarkers(currentOrders);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.markers.forEach((marker) => marker.remove());
    this.map?.remove();
  }

  private initMap(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0817, 4.6097],
      zoom: 12,
    });

    this.map.on('load', () => {
      this.map.resize();
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      const currentOrders = this.orders();
      if (currentOrders.length > 0) {
        this.addOrderMarkers(currentOrders);
      }
    });
  }

  private addOrderMarkers(orders: Order[]): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    const geocodeRequests = orders.map((order) =>
      this.geocodingService.geocodeAddress(`${order.address}, ${order.city}, ${order.country}`),
    );

    forkJoin(geocodeRequests).subscribe({
      next: (results) => {
        results.forEach((geocodeResult, index) => {
          const order = orders[index];

          const coords: [number, number] = geocodeResult
            ? [geocodeResult.longitude, geocodeResult.latitude]
            : [-74.0817, 4.6097];

          const color = this.getColorByPriority(order.priority);

          const marker = new mapboxgl.Marker({ color });

          const popup = new mapboxgl.Popup().setHTML(`
            <div style="padding: 8px; font-family: 'Poppins', sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: var(--ion-color-primary); font-size: 14px; font-weight: 600;">
                ${order.id}
              </h3>
              <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Estado:</strong> ${order.order_status}</p>
              <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Prioridad:</strong> ${order.priority}</p>
              <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Dirección:</strong> ${order.address}</p>
              <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Ciudad:</strong> ${order.city}</p>
              <p style="margin: 0; font-size: 12px;"><strong>Fecha estimada:</strong> ${order.date_estimated}</p>
            </div>
          `);

          marker.setLngLat(coords).setPopup(popup).addTo(this.map);

          this.markers.push(marker);
        });

        if (this.markers.length > 0) {
          this.fitMapToMarkers();
        }
      },
      error: (err) => {
        console.error('Error geocoding addresses:', err);
      },
    });
  }

  private getColorByPriority(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return '#DC3545';
      case 'MEDIUM':
        return '#FFC107';
      case 'LOW':
        return '#20C997';
      default:
        return '#4E99EA';
    }
  }

  private fitMapToMarkers(): void {
    const bounds = new mapboxgl.LngLatBounds();

    this.markers.forEach((marker) => {
      bounds.extend(marker.getLngLat());
    });

    this.map.fitBounds(bounds, {
      padding: 80,
      maxZoom: 13,
    });
  }
}
