import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { createEnvironmentInjector, Injector, type EnvironmentInjector } from '@angular/core';
import { JsonPlaceholderService, provideApiConfig } from '@workspace/data-access';
import { firstValueFrom, of, throwError } from 'rxjs';
import { expect, it, vi } from 'vitest';

function setup(baseUrl: string) {
  const get = vi.fn();
  const injector = createEnvironmentInjector(
    [
      provideApiConfig({ baseUrl }),
      { provide: HttpClient, useValue: { get } },
      JsonPlaceholderService,
    ],
    Injector.NULL as EnvironmentInjector,
  );
  return { get, injector, service: injector.get(JsonPlaceholderService) };
}

it('uses the application API address and selects distinct resource endpoints', async () => {
  const { get, injector, service } = setup('https://example.com/center-api/');
  try {
    get.mockReturnValue(of([{ id: 1, userId: 2, title: 'A post', body: 'Post text' }]));
    expect(await firstValueFrom(service.load('posts'))).toEqual({
      resource: 'posts',
      items: [{ id: 1, userId: 2, title: 'A post', body: 'Post text' }],
    });
    expect(get).toHaveBeenLastCalledWith('https://example.com/center-api/posts', {
      params: { _limit: 12 },
    });

    get.mockReturnValue(of([]));
    expect(await firstValueFrom(service.load('users'))).toEqual({ resource: 'users', items: [] });
    expect(get).toHaveBeenLastCalledWith('https://example.com/center-api/users');

    get.mockReturnValue(of([{ id: 3, userId: 2, title: 'A task', completed: true }]));
    expect(await firstValueFrom(service.load('todos'))).toEqual({
      resource: 'todos',
      items: [{ id: 3, userId: 2, title: 'A task', completed: true }],
    });
    expect(get).toHaveBeenLastCalledWith('https://example.com/center-api/todos', {
      params: { _limit: 12 },
    });
  } finally {
    injector.destroy();
  }
});

it('rejects malformed responses and lets request errors reach the caller', async () => {
  const { get, injector, service } = setup('/api');
  try {
    get.mockReturnValue(of([{ id: 1, title: 'Missing required fields' }]));
    await expect(firstValueFrom(service.getPosts())).rejects.toThrow();
    const failure = new Error('Network unavailable');
    get.mockReturnValue(throwError(() => failure));
    await expect(firstValueFrom(service.getUsers())).rejects.toBe(failure);
  } finally {
    injector.destroy();
  }
});
