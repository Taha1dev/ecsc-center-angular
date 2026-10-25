import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppDialog, AppField, AppIcon, HlmButton, HlmInput } from '@workspace/ui';
import { CENTER_MODULE } from '../../module';
@Component({
  selector: 'app-login',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    AppIcon,
    AppDialog,
    AppField,
  ],
  templateUrl: './login.html',
})
export class LoginPage {
  readonly center = inject(CENTER_MODULE).profile;
  private readonly router = inject(Router);
  readonly visible = signal(false);
  readonly help = signal(false);
  readonly patternRows = Array.from({ length: 24 }, (_, i) => i);
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    remember: new FormControl(localStorage.getItem('default-center') === this.center.id, {
      nonNullable: true,
    }),
  });
  enter() {
    if (this.form.controls.remember.value) localStorage.setItem('default-center', this.center.id);
    else localStorage.removeItem('default-center');
    void this.router.navigate(['/centers', this.center.id]);
  }
}
