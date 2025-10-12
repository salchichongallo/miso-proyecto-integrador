# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-platform Ionic/Angular application for MISO MediSupply that builds separately for web and mobile platforms from a single codebase. The project uses Angular 20 with standalone components, Ionic 8, and Capacitor 7.

## Architecture

### Dual Platform Build System

The application has a unique architecture that supports both web and mobile platforms with separate entry points and configurations:

- **Web Platform** (`src/web/`): Browser-based application using Material Design mode
- **Mobile Platform** (`src/mobile/`): Capacitor-based native mobile app with full plugin support
- **Shared Code** (`src/shared/`): Common components and utilities shared between platforms

### Entry Points

- `src/main.web.ts`: Web application bootstrap (uses `src/web/app.routes.ts`)
- `src/main.mobile.ts`: Mobile application bootstrap (uses `src/mobile/app.routes.ts`)
- Each platform has its own `index.html` file (`index.web.html`, `index.mobile.html`)

### Environment Configuration

Environments are platform-specific and configured via file replacements in `angular.json`:

- `environment.ts`: Development environment
- `environment.prod.ts`: Generic production environment

Key environment properties:

- `platform`: 'web' | 'mobile' | 'development'
- `features`: Feature flags for pushNotifications, biometricAuth, camera, geolocation, fileSystem, nativeStorage
- `capacitorPlugins`: Enable/disable statusBar, splashScreen, haptics, keyboard per platform

### Build Output

Builds output to separate directories:

- Web: `www/web/`
- Mobile: `www/mobile/`

The `scripts/post-build.js` script renames platform-specific index files after build.

## Development Commands

### Building

```bash
# Build for web platform (optimized production build)
npm run build:web

# Build for mobile platform (optimized production build)
npm run build:mobile

# Build both platforms
npm run build:all

# Development watch mode
npm run watch
```

### Running Dev Server

```bash
# Serve web application
npm run serve:web

# Serve mobile application
npm run serve:mobile
```

### Testing

The project uses Jest with jest-preset-angular:

```bash
# Run all tests
npm test

# Run web-specific tests
npm run test:web

# Run mobile-specific tests
npm run test:mobile

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Test files should be named `*.spec.ts` and placed alongside their source files. Coverage reports are generated in `coverage/app/`.

### Linting and Formatting

```bash
# Lint TypeScript and HTML files
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Check both formatting and linting
npm run code:check

# Fix both formatting and linting
npm run code:fix
```

### Code Style

- **Component Selectors**: Use `app-` prefix with kebab-case (e.g., `app-user-profile`)
- **Directive Selectors**: Use `app` prefix with camelCase (e.g., `appHighlight`)
- **Component Suffixes**: Components must end with `Component` or `Page` (e.g., `LoginPage`, `HeaderComponent`)
- **Standalone Components**: All components use Angular standalone API (no NgModules)

## Platform-Specific Development

### Adding Features

When adding new features, consider platform differences:

1. Check `environment.features` and `environment.capacitorPlugins` to determine capability availability
2. Web platform has limited native features (no filesystem, native storage, or Capacitor plugins)
3. Mobile platform has full access to Capacitor plugins and native features

### Routing

- Web routes are defined in `src/web/app.routes.ts`
- Mobile routes are defined in `src/mobile/app.routes.ts`
- Both use lazy loading with `loadComponent` or `loadChildren`

### Shared Components

Place reusable components in `src/shared/components/` to share between web and mobile platforms.

## TypeScript Configuration

The project uses strict TypeScript settings:

- Strict mode enabled
- No implicit returns
- No fallthrough cases in switch
- Force consistent casing in file names
- Strict Angular templates

### Absolute Path Imports

**IMPORTANT**: Always use absolute path imports instead of relative paths. The following path aliases are configured in `tsconfig.json`:

- `@web/*` - Maps to `src/web/*` (web platform files)
- `@mobile/*` - Maps to `src/mobile/*` (mobile platform files)
- `@shared/*` - Maps to `src/shared/*` (shared components, services, utilities)
- `@env/*` - Maps to `src/environments/*` (environment configurations)
- `@assets/*` - Maps to `src/assets/*` (static assets)
- `@theme/*` - Maps to `src/theme/*` (theme and style files)

**Examples:**

```typescript
// ❌ DON'T use relative imports
import { LoginPage } from '../../pages/login/login.page';
import { ExploreContainerComponent } from '../../../shared/components/explore-container/explore-container.component';
import { environment } from '../../../environments/environment';

// ✅ DO use absolute imports
import { LoginPage } from '@web/pages/login/login.page';
import { ExploreContainerComponent } from '@shared/components/explore-container/explore-container.component';
import { environment } from '@env/environment';
```

**Benefits:**

- Easier refactoring and moving files
- Cleaner, more readable imports
- No confusion with relative path depth (`../../` vs `../../../`)
- IDE autocomplete works better

## Capacitor

Capacitor configuration is in `capacitor.config.ts`:

- App ID: `io.ionic.starter`
- App Name: `MISO - MediSupply`
- Web directory: `www/mobile`

To sync Capacitor platforms after mobile build, use standard Capacitor CLI commands.

## Styling and Theming

The application uses Ionic's theming system with custom colors and Poppins font from Google Fonts.

### Color Palette

- **Primary**: `#4E99EA` - Main brand color
- **Secondary**: `#20C997` - Secondary brand color
- **Danger**: `#DC3545` - Errors and destructive actions
- **Medium**: `#6C757D` - Neutral color for secondary text

### Typography

- **Font Family**: Poppins (imported from Google Fonts)
- **Weights Available**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Using Colors in Components

Use the `color` attribute on Ionic components:

```html
<ion-button color="primary">Primary Button</ion-button> <ion-button color="danger">Delete</ion-button>
```

Or use CSS variables directly:

```scss
.element {
  background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}
```

See `STYLING_GUIDE.md` for complete theming documentation and examples.
