import type { ApplicationConfig } from '@angular/core';
import { provideApiConfig } from '@workspace/data-access';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideApiConfig({ baseUrl: environment.apiBaseUrl })],
};
