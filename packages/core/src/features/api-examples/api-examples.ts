import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  JsonPlaceholderService,
  type DemoApiData,
  type DemoResource,
} from '@workspace/data-access';
import { AppEmptyState, AppIcon, AppLoading, AppPageHeader, HlmButton } from '@workspace/ui';
import { catchError, map, of, scan, startWith, switchMap } from 'rxjs';

type LoadEvent =
  | { status: 'loading'; resource: DemoResource }
  | { status: 'ready'; resource: DemoResource; data: DemoApiData }
  | { status: 'error'; resource: DemoResource; message: string };
type ViewState = {
  status: 'loading' | 'ready' | 'error';
  resource: DemoResource;
  data?: DemoApiData;
  message?: string;
};
const initialState: ViewState = { status: 'loading', resource: 'posts' };

@Component({
  selector: 'app-api-examples',
  imports: [AppEmptyState, AppIcon, AppLoading, AppPageHeader, HlmButton],
  templateUrl: './api-examples.html',
})
export class ApiExamplesPage {
  readonly initialResource = input<DemoResource>('posts');
  private readonly api = inject(JsonPlaceholderService);
  private readonly selection = signal<DemoResource | null>(null);
  private readonly revision = signal(0);
  readonly resource = computed(() => this.selection() ?? this.initialResource());
  readonly resources = [
    { id: 'posts', label: 'المنشورات', icon: 'phosphorFileText' },
    { id: 'users', label: 'المستخدمون', icon: 'phosphorUsers' },
    { id: 'todos', label: 'المهام', icon: 'phosphorListChecks' },
  ] as const;
  readonly current = computed(() => this.resources.find((item) => item.id === this.resource())!);
  private readonly request = computed(() => ({
    resource: this.resource(),
    revision: this.revision(),
  }));

  readonly state = toSignal(
    toObservable(this.request).pipe(
      // Changing the resource cancels the previous HTTP request.
      switchMap(({ resource }) =>
        this.api.load(resource).pipe(
          map((data): LoadEvent => ({ status: 'ready', resource, data })),
          catchError((error: unknown) =>
            of<LoadEvent>({
              status: 'error',
              resource,
              message:
                error instanceof HttpErrorResponse
                  ? 'تعذّر الاتصال بخدمة البيانات. تحقق من اتصالك ثم أعد المحاولة.'
                  : 'وصلت بيانات بصيغة غير متوقعة. أعد المحاولة لاحقاً.',
            }),
          ),
          startWith<LoadEvent>({ status: 'loading', resource }),
        ),
      ),
      // A failed refresh keeps the last successful data for the same resource.
      scan<LoadEvent, ViewState>((previous, event) => {
        const data = previous.resource === event.resource ? previous.data : undefined;
        if (event.status === 'ready') return event;
        return { ...event, data };
      }, initialState),
    ),
    { initialValue: initialState },
  );

  select(resource: DemoResource) {
    this.selection.set(resource);
    this.reload();
  }

  reload() {
    this.revision.update((value) => value + 1);
  }
}
