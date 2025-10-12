# Guía de Estilos - MediSupply

Esta guía explica cómo usar los colores y tipografías configurados en la aplicación.

## Paleta de Colores

### Colores Principales

- **Primary (Primario)**: `#4E99EA` - Color principal de la aplicación
- **Secondary (Secundario)**: `#20C997` - Color secundario
- **Danger (Error/Alerta)**: `#DC3545` - Para errores, alertas y acciones destructivas
- **Medium (Neutral)**: `#6C757D` - Color neutral para textos secundarios

### Otros Colores del Sistema

- **Success**: `#2dd36f` - Para acciones exitosas
- **Warning**: `#ffc409` - Para advertencias
- **Dark**: `#222428` - Color oscuro
- **Light**: `#f4f5f8` - Color claro para fondos

## Tipografía

La aplicación usa **Poppins** como fuente principal, importada desde Google Fonts con los siguientes pesos:

- Light (300)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

## Cómo Usar los Colores en Componentes Ionic

### 1. Usando el atributo `color` en componentes Ionic

Todos los componentes de Ionic aceptan el atributo `color` que automáticamente aplica el esquema de colores:

```html
<!-- Botones -->
<ion-button color="primary">Botón Principal</ion-button>
<ion-button color="secondary">Botón Secundario</ion-button>
<ion-button color="danger">Eliminar</ion-button>

<!-- Alertas -->
<ion-alert color="danger"></ion-alert>

<!-- Inputs -->
<ion-input color="primary"></ion-input>

<!-- Cards -->
<ion-card color="primary">
  <ion-card-content>Contenido</ion-card-content>
</ion-card>

<!-- Chips -->
<ion-chip color="secondary">
  <ion-label>Chip Secundario</ion-label>
</ion-chip>

<!-- Badges -->
<ion-badge color="danger">3</ion-badge>

<!-- Headers/Toolbars -->
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Título</ion-title>
  </ion-toolbar>
</ion-header>
```

### 2. Usando Variables CSS

Puedes usar las variables CSS directamente en tus estilos SCSS:

```scss
.mi-componente {
  background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border: 1px solid var(--ion-color-primary-shade);

  &:hover {
    background-color: var(--ion-color-primary-tint);
  }
}
```

### 3. Usando Clases Utilitarias

Se han creado clases utilitarias para uso rápido:

```html
<!-- Colores de texto -->
<p class="text-primary">Texto primario</p>
<p class="text-secondary">Texto secundario</p>
<p class="text-danger">Texto de error</p>
<p class="text-neutral">Texto neutral</p>

<!-- Colores de fondo -->
<div class="bg-primary">Fondo primario</div>
<div class="bg-secondary">Fondo secundario</div>
<div class="bg-danger">Fondo de error</div>
<div class="bg-neutral">Fondo neutral</div>
```

## Variables de Color Disponibles

Para cada color, Ionic genera automáticamente estas variantes:

- `--ion-color-{nombre}`: Color base
- `--ion-color-{nombre}-rgb`: Valores RGB del color
- `--ion-color-{nombre}-contrast`: Color de contraste (para texto sobre el color base)
- `--ion-color-{nombre}-shade`: Versión más oscura
- `--ion-color-{nombre}-tint`: Versión más clara

### Ejemplo de uso:

```scss
.mi-elemento {
  // Color base
  background-color: var(--ion-color-primary);

  // Color de contraste (asegura legibilidad del texto)
  color: var(--ion-color-primary-contrast);

  &:hover {
    // Versión más clara para hover
    background-color: var(--ion-color-primary-tint);
  }

  &:active {
    // Versión más oscura para active
    background-color: var(--ion-color-primary-shade);
  }
}
```

## Tipografía - Uso de Poppins

La fuente Poppins se aplica automáticamente a toda la aplicación. Para usar diferentes pesos:

```scss
// En tus archivos SCSS
.titulo {
  font-weight: 700; // Bold
}

.subtitulo {
  font-weight: 600; // SemiBold
}

.texto-normal {
  font-weight: 400; // Regular
}

.texto-ligero {
  font-weight: 300; // Light
}
```

O en HTML con clases de Ionic:

```html
<ion-text>
  <h1>Título Principal</h1> <!-- Automáticamente bold -->
  <h2>Subtítulo</h2>
  <p>Texto normal</p>
</ion-text>
```

## Ejemplos Completos

### Botón de Error/Alerta

```html
<ion-button color="danger" expand="block">
  <ion-icon slot="start" name="trash"></ion-icon>
  Eliminar
</ion-button>
```

### Card con Color Primario

```html
<ion-card color="primary">
  <ion-card-header>
    <ion-card-title>Título de la Card</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    Contenido de la card con el color primario
  </ion-card-content>
</ion-card>
```

### Input con Validación

```html
<ion-item>
  <ion-label position="floating">Email</ion-label>
  <ion-input type="email" color="primary"></ion-input>
</ion-item>

<!-- Mensaje de error -->
<ion-text color="danger">
  <p class="ion-padding-start">El email es requerido</p>
</ion-text>
```

### Alert (Programáticamente)

```typescript
import { AlertController } from '@ionic/angular';

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'Error',
    message: 'Ha ocurrido un error',
    buttons: ['OK'],
    cssClass: 'alert-danger', // Opcional: clase personalizada
  });

  await alert.present();
}
```

## Archivos de Configuración

Los estilos están configurados en:

- `src/theme/variables.scss` - Variables CSS de colores y tipografía
- `src/global.scss` - Estilos globales y clases utilitarias
- `src/index.web.html` - Importación de fuentes para web
- `src/index.mobile.html` - Importación de fuentes para mobile

## Recursos Adicionales

- [Documentación de Ionic Theming](https://ionicframework.com/docs/theming/basics)
- [Generador de Colores de Ionic](https://ionicframework.com/docs/theming/color-generator)
- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
