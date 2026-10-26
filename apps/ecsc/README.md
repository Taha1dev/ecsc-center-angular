# ecsc

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                  |
| ---------------------------------- | ---------------------------------------------- |
| Development                        | `npm run dev:ecsc` - http://localhost:5200     |
| Production build with dependencies | `npm run build:ecsc`                           |
| Preview after build                | `npm run preview:ecsc` - http://localhost:5300 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/ecsc`. The configured login pattern is `circuit`.
- Brand values: `src/brand.css`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `/api`.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
