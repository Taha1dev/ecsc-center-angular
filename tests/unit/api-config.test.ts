import '@angular/compiler';
import {
  createEnvironmentInjector,
  inject,
  Injector,
  runInInjectionContext,
  type EnvironmentInjector,
} from '@angular/core';
import { API_CONFIG, provideApiConfig } from '@workspace/data-access';
import { expect, it } from 'vitest';

it('keeps API settings isolated between application injectors', () => {
  const settings = { baseUrl: '/first-api' };
  const first = createEnvironmentInjector(
    [provideApiConfig(settings)],
    Injector.NULL as EnvironmentInjector,
  );
  const second = createEnvironmentInjector(
    [provideApiConfig({ baseUrl: 'https://second.example.com/api' })],
    Injector.NULL as EnvironmentInjector,
  );
  try {
    settings.baseUrl = '/changed-after-registration';
    expect(runInInjectionContext(first, () => inject(API_CONFIG)).baseUrl).toBe('/first-api');
    expect(runInInjectionContext(second, () => inject(API_CONFIG)).baseUrl).toBe(
      'https://second.example.com/api',
    );
  } finally {
    first.destroy();
    second.destroy();
  }
});
