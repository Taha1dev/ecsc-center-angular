# test-center

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                         |
| ---------------------------------- | ----------------------------------------------------- |
| Development                        | `npm run dev:test-center` - http://localhost:5203     |
| Production build with dependencies | `npm run build:test-center`                           |
| Preview after build                | `npm run preview:test-center` - http://localhost:5303 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/test-center`. The configured login pattern is `circuit`.
- Brand values: `src/brand.css` and `brand.json`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `https://jsonplaceholder.typicode.com`.

Local page folders: `api-examples`.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
