# jus

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                 |
| ---------------------------------- | --------------------------------------------- |
| Development                        | `npm run dev:jus` - http://localhost:5202     |
| Production build with dependencies | `npm run build:jus`                           |
| Preview after build                | `npm run preview:jus` - http://localhost:5302 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/jus`. The configured login pattern is `stars`.
- Brand values: `src/brand.css`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `/api`.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
