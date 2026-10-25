import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { z } from 'zod';
import { API_CONFIG } from '../config/api-config';

const postSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  title: z.string(),
  body: z.string(),
});
const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  company: z.object({ name: z.string() }),
  address: z.object({ city: z.string() }),
});
const todoSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  title: z.string(),
  completed: z.boolean(),
});

export type DemoResource = 'posts' | 'users' | 'todos';
export type DemoPost = z.infer<typeof postSchema>;
export type DemoUser = z.infer<typeof userSchema>;
export type DemoTodo = z.infer<typeof todoSchema>;
export type DemoApiData =
  | { resource: 'posts'; items: DemoPost[] }
  | { resource: 'users'; items: DemoUser[] }
  | { resource: 'todos'; items: DemoTodo[] };

// Public sample data only. Transaction features keep using CenterDataAdapter.
@Injectable({ providedIn: 'root' })
export class JsonPlaceholderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getPosts() {
    return this.http
      .get<unknown>(this.url('posts'), { params: { _limit: 12 } })
      .pipe(map((response) => z.array(postSchema).parse(response)));
  }

  getUsers() {
    return this.http
      .get<unknown>(this.url('users'))
      .pipe(map((response) => z.array(userSchema).parse(response)));
  }

  getTodos() {
    return this.http
      .get<unknown>(this.url('todos'), { params: { _limit: 12 } })
      .pipe(map((response) => z.array(todoSchema).parse(response)));
  }

  load(resource: DemoResource): Observable<DemoApiData> {
    switch (resource) {
      case 'posts':
        return this.getPosts().pipe(map((items) => ({ resource, items })));
      case 'users':
        return this.getUsers().pipe(map((items) => ({ resource, items })));
      case 'todos':
        return this.getTodos().pipe(map((items) => ({ resource, items })));
    }
  }

  private url(resource: DemoResource) {
    return `${this.config.baseUrl.replace(/\/+$/, '')}/${resource}`;
  }
}
