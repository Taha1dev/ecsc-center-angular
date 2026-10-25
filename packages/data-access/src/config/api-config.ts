import { InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface ApiConfig {
  readonly baseUrl: string;
}

// Each application supplies this token from its own environment settings.
export const API_CONFIG = new InjectionToken<Readonly<ApiConfig>>('API_CONFIG');

export function provideApiConfig(config: ApiConfig) {
  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: Object.freeze({ ...config }) },
  ]);
}
