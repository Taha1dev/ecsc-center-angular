# layal-center

An independently configured example application. Its sample catalog and workflows do not define requirements for other centers.

| Task                               | Command / URL                                          |
| ---------------------------------- | ------------------------------------------------------ |
| Development                        | `npm run dev:layal-center` - http://localhost:5204     |
| Production build with dependencies | `npm run build:layal-center`                           |
| Preview after build                | `npm run preview:layal-center` - http://localhost:5304 |

## Application-owned configuration

- Profile and assets: `src/config/center.ts` and `public/brands/layal-center`. The configured login pattern is `circuit`.
- Brand values: `src/brand.css` and `brand.json`.
- Composition, catalog, and reports: `src/config`.
- Extra/replacement page registrations: `src/routes.ts`; menu configuration: `src/navigation.ts`.
- API providers: `src/app.config.ts`; test/production addresses: `src/environments`. The current test address is `https://jsonplaceholder.typicode.com`.

Local page folders: `about`, `api-examples`, `aurora`, `contact`, `faq`, `team`.

See [development](../../docs/development-guide.md), [API configuration](../../docs/api-configuration.md), and [navigation](../../docs/center-navigation.md) for shared instructions.
