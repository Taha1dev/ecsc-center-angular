# API configuration

Each center owns its API address. Shared services receive it through Angular dependency injection, so a page in `core` does not need a URL input or an import from an application.

## Set the addresses

Edit these files in the center you are working on:

- `apps/<center>/src/environments/environment.ts`: test and local development.
- `apps/<center>/src/environments/environment.production.ts`: production.

Both have an `apiBaseUrl` property. The initial value is `/api`, meaning the API is on the same origin as the application. Configure your server or development proxy to forward that path, or replace it with the actual backend address. No proxy or backend is created by this setup.

```ts
export const environment = {
  production: false,
  name: 'test',
  apiBaseUrl: 'https://test-api.example.com/layal',
};
```

Always import `environment.ts`. Angular replaces it with `environment.production.ts` during a production build. These values are included in the browser bundle; keep credentials and private keys out of them.

## Use the settings

Each application's `src/app.config.ts` registers `provideApiConfig({ baseUrl: environment.apiBaseUrl })`. Its `main.ts` passes that configuration to `startCenter(centerModule, appConfig)`. The shared bootstrap merges it with the existing router, HTTP and center providers. Application-specific providers and interceptors can go in this file later.

A service inside `data-access` can use the settings like this:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api-config';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getCustomers() {
    const baseUrl = this.config.baseUrl.replace(/\/+$/, '');
    return this.http.get<readonly { id: string; name: string }[]>(`${baseUrl}/customers`);
  }
}
```

Outside the package, import `API_CONFIG` and exported services from `@workspace/data-access`. A center-specific service can use the same token. `provideHttpClient()` is already registered by the shared bootstrap. If a package starts importing `HttpClient`, declare `@angular/common` in that package's dependencies too. Validate or map external responses when implementing the real adapter; HTTP response types alone do not validate data.

Use application-level configuration for root-provided services. A child route's provider does not reconfigure a service created in the root injector.

## Where services belong

Share a service when paths and behavior agree across centers. A different URL selects the backend; it does not translate different response shapes or operations. Use an adapter when those contracts differ. Existing transaction features already use `CenterDataAdapter` and `CenterDataService`; connect real transaction requests behind that boundary.

Services used only by one center can stay in `apps/<center>/src/services`. Shared packages must not import these files. Inject a shared contract if a shared page needs a center-specific implementation.

This setup does not replace the in-memory adapter, send requests, or add authentication. Existing demo workflows continue to work.

## Run and build

```sh
ng serve layal-center
ng build layal-center --configuration=test
npm run build:layal-center
```

Serving defaults to test. The last command builds the center and its dependencies for production. Rebuild after changing an environment value; these are build-time settings.

The center generator creates the environment files, app configuration and bootstrap wiring for every new center.

## Working example: JSONPlaceholder

Layal and test-center have a **تجربة API** menu link at `/centers/<center>/api-examples`. Both test and production environments for these two centers currently point to `https://jsonplaceholder.typicode.com` for this example.

- `packages/data-access/src/demo-api/json-placeholder.service.ts` owns the HTTP requests and validates responses with Zod. `getPosts()`, `getUsers()` and `getTodos()` call different endpoints using the same injected base address. JSONPlaceholder does not have a products endpoint.
- `packages/core/src/features/api-examples/` owns the shared display and loading/error state. Switching resources cancels the previous request; a failed refresh preserves the last successful result for that resource.
- `apps/layal-center/src/pages/api-examples/` starts on posts. `apps/test-center/src/pages/api-examples/` starts on users. Each center registers its own route and reuses the same page.

Run `npm run dev:layal-center` or `npm run dev:test-center` and open the menu link. Resource buttons and **إعادة الجلب** send new GET requests. The browser's Network panel shows `/posts?_limit=12`, `/users`, and `/todos?_limit=12`. Only the returned sample records are counted in the UI.

These are real HTTP requests for public sample data, separate from the local transaction demo. When replacing the example with your backend, update the environment addresses and implement services matching that backend's contracts.

References: Angular's [configuration providers](https://angular.dev/guide/di/defining-dependency-providers), [application configuration merging](https://angular.dev/api/core/mergeApplicationConfig), and [environment file replacements](https://angular.dev/tools/cli/environments).
