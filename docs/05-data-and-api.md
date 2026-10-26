# 05 · Load data from an API

[README](../README.md) · Previous: [Pages and navigation](04-pages-and-navigation.md) · Next: [Build and check](06-build-and-check.md)

The page can read configuration. Now use that configuration for a real request and display the result. This example reads public JSONPlaceholder posts; it does not change transaction storage.

## Set the address

In `apps/guide-center/src/environments/environment.ts`, set:

```ts
export const environment = {
  production: false,
  name: 'test',
  apiBaseUrl: 'https://jsonplaceholder.typicode.com',
};
```

In `environment.production.ts`, use the same properties with `production: true` and `name: 'production'`. For this public example, keep the same API address in both files. Real environments may have different addresses.

These values are public build-time settings, not secrets or a runtime configuration service. Always import `environment.ts`; production file replacement selects the other file. Build commands belong in [chapter 06](06-build-and-check.md).

The generator already creates `src/app.config.ts`:

```ts
import type { ApplicationConfig } from '@angular/core';
import { provideApiConfig } from '@workspace/data-access';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideApiConfig({ baseUrl: environment.apiBaseUrl })],
};
```

`main.ts` passes this to `startCenter`. The shared bootstrap merges it with HTTP, router, and center providers. `HttpClient` is already available; no second bootstrap or page input for the URL is needed. Root-provided services read application-level configuration, not providers attached to a child route.

## Generate the service

From the root, after `.\dev.ps1`:

```sh
ng g s posts-api
```

At `Where should this go?`, choose **Packages**, then **data-access** at `Choose a package:`. This backend contract is identical for any center using the example. The file is `packages/data-access/src/services/posts-api.service.ts`.

Replace it with:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, startWith, type Observable } from 'rxjs';
import { z } from 'zod';
import { API_CONFIG } from '../config/api-config';

const postSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  title: z.string(),
  body: z.string(),
});

export type PostsState =
  | { status: 'loading' }
  | { status: 'success'; posts: z.infer<typeof postSchema>[] }
  | { status: 'error'; message: string };

@Injectable({ providedIn: 'root' })
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getPosts(): Observable<PostsState> {
    const base = this.config.baseUrl.replace(/\/+$/, '');
    return this.http.get<unknown>(`${base}/posts`, { params: { _limit: 6 } }).pipe(
      map((response): PostsState => ({
        status: 'success',
        posts: z.array(postSchema).parse(response),
      })),
      catchError(() => of<PostsState>({
        status: 'error',
        message: 'Could not load posts. Refresh the page to try again.',
      })),
      startWith({ status: 'loading' } as PostsState),
    );
  }
}
```

Each call creates a request stream with loading, successful data, or an error. Zod checks the response; a TypeScript HTTP type alone would not validate external data. The owning package already declares Angular HTTP, RxJS, and Zod dependencies.

Append this public export to `packages/data-access/src/index.ts`, retaining its existing exports:

```ts
export * from './services/posts-api.service';
```

For an endpoint used only by one center, choose **Centers** and its ID instead. It belongs in that app's `src/services/`; import `API_CONFIG` from `@workspace/data-access` there, and declare any new direct dependencies in the app manifest. Revisit [ownership](01-workspace.md) before moving a service just because several local pages call it.

## Call it from a page

From the root:

```sh
ng g page --center-name=guide-center api-posts
```

Replace `apps/guide-center/src/pages/api-posts/api-posts.ts` with:

```ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PostsApiService, type PostsState } from '@workspace/data-access';

@Component({
  selector: 'app-api-posts',
  templateUrl: './api-posts.html',
})
export class ApiPosts {
  private readonly api = inject(PostsApiService);
  readonly state = toSignal(this.api.getPosts(), {
    initialValue: { status: 'loading' } as PostsState,
  });
}
```

In `api-posts.html`:

```html
<section dir="ltr" class="mx-auto max-w-4xl space-y-5">
  <h1 class="text-page-title font-semibold">Public API posts</h1>
  @let result = state();
  @if (result.status === 'loading') {
    <p role="status">Loading posts...</p>
  } @else if (result.status === 'error') {
    <p role="alert">{{ result.message }}</p>
  } @else {
    <p>{{ result.posts.length }} sample posts</p>
    @for (post of result.posts; track post.id) {
      <article class="rounded-panel border bg-card p-5">
        <h2 class="font-semibold">{{ post.title }}</h2>
        <p class="mt-3 text-sm text-muted-foreground">{{ post.body }}</p>
      </article>
    } @empty {
      <p>No posts returned.</p>
    }
  }
</section>
```

`toSignal` subscribes once and cleans up the subscription when the page is destroyed. Returning an error state prevents observable errors from escaping into the template. Reload the page to request again.

Import `ApiPosts` into `routes.ts` from `./pages/api-posts/api-posts`, then append `{ path: 'api-posts', component: ApiPosts }` to the existing `extensions` array. Keep the Getting started route. Append `{ kind: 'link', id: 'api-posts', label: 'Public API posts', path: 'api-posts' }` to the current navigation array. The [registration flow](04-pages-and-navigation.md) is unchanged.

## Check the request

Start `npm run dev:guide-center` from the root. Open `/centers/guide-center/api-posts`, then open the browser Network panel and reload. Filter for `posts`: the request should be `GET https://jsonplaceholder.typicode.com/posts?_limit=6`. The response titles should match the cards. Block that request in developer tools and reload to check the error; throttle the connection to see loading. Remove the block afterward.

The repository's existing `JsonPlaceholderService` also validates posts, users, and todos. `ApiExamplesPage` provides the richer shared example with resource switching, cancellation, reload, and retained previous data. You can inspect those files under `packages/data-access/src/demo-api` and `packages/core/src/features/api-examples`; JSONPlaceholder has no products endpoint.

## When backend contracts differ

Changing the URL chooses a server; it does not translate different response fields, paths, or operations. Keep a unique integration local. If a shared page needs differing implementations, inject a shared contract that the app supplies rather than importing app code into a package.

Existing transaction features use `CenterDataAdapter`, not this posts service. `config/module.ts` still supplies `createMemoryAdapter`. A real transaction integration belongs behind that adapter contract, preserving scoped records, validation, loading/error/retry, drafts after rejection, and stale-response safety. `CenterDataService` bridges the client to Angular Signals and cleans up subscriptions. No backend, proxy, authentication, or payment implementation is created by configuring an address.

[README](../README.md) · Previous: [Pages and navigation](04-pages-and-navigation.md) · Next: [Build and check](06-build-and-check.md)
