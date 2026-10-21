import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppDialog, AppField, AppIcon, HlmButton, HlmInput } from '@workspace/ui';
import { CENTER_MODULE } from '../module';
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
  template: ` <div class="grid min-h-svh lg:grid-cols-[42%_58%]">
      <aside
        class="relative isolate flex min-h-52 items-center justify-center overflow-hidden bg-sidebar p-7 text-sidebar-foreground lg:min-h-svh lg:p-14"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10"
        >
          @if (center.patternKind === 'circuit') {
            <img
              [src]="center.loginPattern"
              alt=""
              class="h-full w-full object-contain"
              data-login-pattern
            />
          } @else {
            <div class="flex h-full flex-col">
              @for (n of patternRows; track n) {
                <img
                  [src]="center.loginPattern"
                  alt=""
                  data-login-pattern
                  class="w-full shrink-0"
                />
              }
            </div>
          }
        </div>
        <div class="flex flex-col items-center gap-5 text-center">
          <img
            [ngSrc]="center.logo"
            alt=""
            [width]="center.loginLogoSize === 'wide' ? 400 : 96"
            [height]="center.loginLogoSize === 'wide' ? 200 : 96"
            priority
            [class]="
              center.loginLogoSize === 'wide'
                ? 'aspect-2/1 w-100 max-w-full object-contain'
                : 'size-20 object-contain lg:size-24'
            "
          />
          <p class="text-page-title leading-relaxed font-semibold">{{ center.name }}</p>
        </div>
      </aside>
      <main class="flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md">
          <p class="mb-2 text-sm font-medium text-primary">أهلاً بعودتك</p>
          <h1 class="text-page-title font-semibold">تسجيل الدخول</h1>
          <p class="mt-2 text-sm text-muted-foreground">تابع معاملاتك من مساحة عمل واحدة.</p>
          <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="enter()" novalidate>
            <app-field
              label="اسم المستخدم أو البريد الإلكتروني"
              placeholder="مثال: ليلى أحمد"
              formControlName="username"
            />
            <label class="flex min-w-0 flex-col gap-2 text-sm font-medium"
              ><span>كلمة المرور</span
              ><span class="relative"
                ><input
                  hlmInput
                  autocomplete="current-password"
                  placeholder="كلمة المرور للعرض المحلي"
                  [type]="visible() ? 'text' : 'password'"
                  formControlName="password"
                  class="pe-12" /><button
                  hlmBtn
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute end-0 top-0"
                  [attr.aria-label]="visible() ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                  [attr.aria-pressed]="visible()"
                  (click)="visible.set(!visible())"
                >
                  <app-icon
                    [name]="visible() ? 'phosphorEyeSlash' : 'phosphorEye'"
                  /></button></span
            ></label>
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label class="flex items-center gap-2"
                ><input
                  type="checkbox"
                  formControlName="remember"
                  class="size-4 accent-primary"
                />تذكّر الجهاز</label
              ><button hlmBtn type="button" variant="link" (click)="help.set(true)">
                نسيت كلمة المرور؟
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              يتذكر المركز المختار فقط، دون بيانات الدخول.
            </p>
            <button hlmBtn class="h-11 w-full" type="submit">
              تسجيل الدخول<app-icon name="phosphorArrowLeft" />
            </button>
          </form>
          <p class="mt-4 text-center text-xs text-muted-foreground">
            نسخة تجريبية ببيانات توضيحية. لا توجد مصادقة فعلية.
          </p>
          <p class="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <app-icon name="phosphorShieldCheck" size="16px" />بيانات الدخول لا تُرسل ولا تُحفظ.
          </p>
        </div>
      </main>
    </div>
    <app-dialog [open]="help()" (closed)="help.set(false)" title="المساعدة في تسجيل الدخول"
      ><p class="text-sm">
        في هذه النسخة لا يوجد حساب إنتاجي. اضغط تسجيل الدخول لمراجعة واجهة المركز؛ يمكنك ترك الحقول
        فارغة.
      </p>
      <button hlmBtn type="button" class="mt-5" (click)="help.set(false)">فهمت</button></app-dialog
    >`,
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
