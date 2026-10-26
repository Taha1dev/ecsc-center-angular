# m3

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                |
| ---------------------------------- | -------------------------------------------- |
| Development                        | `npm run dev:m3` - http://localhost:5201     |
| Production build with dependencies | `npm run build:m3`                           |
| Preview after build                | `npm run preview:m3` - http://localhost:5301 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/m3`. The configured login pattern is `stars`.
- Brand values: `src/brand.css`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `/api`.

The module registers its property-field renderer from `src/sections/property-fields.ts`. This override belongs to this application.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
