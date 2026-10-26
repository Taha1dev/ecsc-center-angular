# gov-center

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                        |
| ---------------------------------- | ---------------------------------------------------- |
| Development                        | `npm run dev:gov-center` - http://localhost:5206     |
| Production build with dependencies | `npm run build:gov-center`                           |
| Preview after build                | `npm run preview:gov-center` - http://localhost:5306 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/gov-center`. The configured login pattern is `stars`.
- Brand values: `src/brand.css` and `brand.json`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`; menu configuration: `src/navigation.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `/api`.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
