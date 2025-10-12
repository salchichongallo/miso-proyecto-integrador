# Guía de Absolute Path Imports

Esta guía explica cómo usar los absolute paths configurados en el proyecto para evitar rutas relativas complejas.

## Configuración

Los absolute paths están configurados en `tsconfig.json` bajo la propiedad `compilerOptions.paths`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@web/*": ["src/web/*"],
      "@mobile/*": ["src/mobile/*"],
      "@shared/*": ["src/shared/*"],
      "@env/*": ["src/environments/*"],
      "@assets/*": ["src/assets/*"],
      "@theme/*": ["src/theme/*"]
    }
  }
}
```

## Path Aliases Disponibles

### `@web/*`

Apunta a: `src/web/*`

Usado para importar archivos específicos de la plataforma web.

```typescript
// ❌ Ruta relativa
import { LoginPage } from '../../pages/login/login.page';
import { AppComponent } from '../app.component';
import { routes } from '../app.routes';

// ✅ Absolute path
import { LoginPage } from '@web/pages/login/login.page';
import { AppComponent } from '@web/app.component';
import { routes } from '@web/app.routes';
```

### `@mobile/*`

Apunta a: `src/mobile/*`

Usado para importar archivos específicos de la plataforma mobile.

```typescript
// ❌ Ruta relativa
import { Tab1Page } from '../../tab1/tab1.page';
import { TabsPage } from '../tabs/tabs.page';

// ✅ Absolute path
import { Tab1Page } from '@mobile/tab1/tab1.page';
import { TabsPage } from '@mobile/tabs/tabs.page';
```

### `@shared/*`

Apunta a: `src/shared/*`

Usado para importar componentes, servicios y utilidades compartidas entre web y mobile.

```typescript
// ❌ Ruta relativa
import { ExploreContainerComponent } from '../../../shared/components/explore-container/explore-container.component';
import { AuthService } from '../../shared/services/auth.service';
import { formatDate } from '../../../shared/utils/date.utils';

// ✅ Absolute path
import { ExploreContainerComponent } from '@shared/components/explore-container/explore-container.component';
import { AuthService } from '@shared/services/auth.service';
import { formatDate } from '@shared/utils/date.utils';
```

### `@env/*`

Apunta a: `src/environments/*`

Usado para importar configuraciones de entorno.

```typescript
// ❌ Ruta relativa
import { environment } from '../../../environments/environment';

// ✅ Absolute path
import { environment } from '@env/environment';
```

### `@assets/*`

Apunta a: `src/assets/*`

Usado para referenciar assets estáticos en TypeScript (imágenes, JSON, etc.).

```typescript
// ❌ Ruta relativa
import * as configData from '../../../assets/data/config.json';

// ✅ Absolute path
import * as configData from '@assets/data/config.json';
```

**Nota**: En HTML y SCSS, los assets se referencian normalmente con `assets/...` sin el alias.

### `@theme/*`

Apunta a: `src/theme/*`

Usado para importar archivos de tema y estilos globales (si es necesario en TypeScript).

```typescript
// ✅ Absolute path
import variables from '@theme/variables.scss';
```

## Ejemplos Completos

### Archivo: `src/web/pages/login/login.page.ts`

```typescript
import { Component } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

// Componentes compartidos
import { ExploreContainerComponent } from '@shared/components/explore-container/explore-container.component';

// Servicios compartidos
import { AuthService } from '@shared/services/auth.service';

// Environment
import { environment } from '@env/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [IonContent, IonButton, RouterLink, ExploreContainerComponent],
})
export class LoginPage {
  constructor(private authService: AuthService) {
    console.log('API URL:', environment.apiUrl);
  }
}
```

### Archivo: `src/main.web.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// Usando absolute paths
import { routes } from '@web/app.routes';
import { AppComponent } from '@web/app.component';
import { environment } from '@env/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
});
```

### Archivo: `src/mobile/tab1/tab1.page.ts`

```typescript
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

// Componente compartido
import { ExploreContainerComponent } from '@shared/components/explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page {
  constructor() {}
}
```

## Reglas de Uso

### ✅ SIEMPRE usar absolute paths para:

1. **Imports entre diferentes carpetas principales** (`web`, `mobile`, `shared`, `environments`)
2. **Componentes compartidos** desde cualquier archivo
3. **Servicios y utilidades** compartidas
4. **Configuraciones de entorno**
5. **Imports en archivos de entrada** (`main.web.ts`, `main.mobile.ts`)

### ⚠️ Puedes usar rutas relativas para:

1. **Archivos en la misma carpeta** (opcional, aunque absolute paths también funciona)

   ```typescript
   // Ambos son aceptables
   import { LoginService } from './login.service';
   import { LoginService } from '@web/pages/login/login.service';
   ```

2. **Templates y estilos en el mismo componente**
   ```typescript
   @Component({
     selector: 'app-login',
     templateUrl: './login.page.html',  // ✅ Relativo está bien aquí
     styleUrls: ['./login.page.scss'],   // ✅ Relativo está bien aquí
   })
   ```

## Beneficios

1. **Refactoring más fácil**: Mover archivos no requiere actualizar todos los imports
2. **Código más limpio**: No más `../../../` confusos
3. **Mejor IDE support**: Autocomplete funciona mejor
4. **Consistencia**: Todos los imports se ven igual sin importar dónde estés
5. **Legibilidad**: Inmediatamente sabes de dónde viene cada import

## Migración de Imports Existentes

Si encuentras imports con rutas relativas en el código existente, reemplázalos siguiendo estos ejemplos:

```typescript
// Antes
import { Component } from '../../../shared/components/component';
import { Service } from '../../shared/services/service';
import { environment } from '../environments/environment';

// Después
import { Component } from '@shared/components/component';
import { Service } from '@shared/services/service';
import { environment } from '@env/environment';
```

## Soporte de IDE

Los absolute paths configurados funcionan automáticamente en:

- ✅ Visual Studio Code
- ✅ WebStorm / IntelliJ IDEA
- ✅ Angular Language Service
- ✅ ESLint
- ✅ Jest (para pruebas)

No se requiere configuración adicional.

## Troubleshooting

### Error: "Cannot find module '@web/...'"

**Solución**: Verifica que:

1. `tsconfig.json` tenga la configuración de `paths`
2. Tu IDE haya recargado la configuración de TypeScript
3. Reinicia el servidor de desarrollo si está corriendo

### Los imports no se autocompletar en el IDE

**Solución**:

1. Recarga la ventana del IDE (VSCode: `Ctrl+Shift+P` > "Reload Window")
2. Verifica que el archivo `tsconfig.json` no tenga errores de sintaxis

## Referencias

- Documentación de TypeScript: [Module Resolution - Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- Guía de Angular: [TypeScript Configuration](https://angular.io/guide/typescript-configuration)
