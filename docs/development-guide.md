# دليل تطوير المراكز والمكتبات المشتركة

هذا الدليل يشرح الوضع الحالي، ويميّز عنه التغييرات المعمارية المقترحة. لا يفترض أن خصوصية مركز معيّن هي قاعدة لكل المراكز. الشاشات والبيانات الحالية نقطة بداية تجريبية؛ قواعد العمل الإنتاجية تُحدد وتُبنى لاحقاً.

## 1. من يملك ماذا؟

| المكان                     | المسؤولية                                                    | مثال                           |
| -------------------------- | ------------------------------------------------------------ | ------------------------------ |
| `apps/<center>/src`        | الصفحات والتخصيصات والتكاملات الخاصة بمركز                   | صفحة محلية أو نموذج خاص        |
| `packages/ui/src`          | أدوات العرض العامة وSpartan وpipes/directives العامة للواجهة | Button، Dialog، بطاقة عامة     |
| `packages/core/src`        | ميزات وصفحات ومكونات المنتج المشتركة                         | صفحة عملاء مشتركة              |
| `packages/data-access/src` | الاتصال بمصادر البيانات وstate والـadapters المشتركة         | خدمة API ومخزن بيانات          |
| `packages/domain/src`      | الأنواع وقواعد العمل الخالصة من Angular                      | نوع Customer ودالة تحقق مشتركة |

كون الكود مشتركاً لا يعني استخدامه إجبارياً في كل تطبيق. يمكن بناء ميزة مشتركة وتجربتها أولاً من تطبيق واحد، ثم استيرادها من بقية التطبيقات لاحقاً. مشاركة الشيفرة لا تشارك حالة الذاكرة بين التطبيقات المستقلة.

اسم `core` هنا يعني مكتبة ميزات المنتج المشترك، وليس فقط services كما في بعض مشاريع Angular.

## 2. ترتيب ميزة جديدة

الهيكل التالي اقتراح للمجلدات الجديدة؛ لا يتطلب نقل الملفات القديمة:

```text
apps/<center>/src/features/customers/
  pages/
  components/
  services/
  pipes/
  directives/

packages/core/src/features/customers/
  pages/
  components/

packages/data-access/src/customers/
packages/domain/src/customers/

packages/ui/src/
  helm/
  components/
  pipes/
  directives/
```

كل ما يتعلق بميزة واحدة يبقى قربها. أدوات العرض العامة فقط توضع في `ui`. مكوّن يعرف Customer أو Transaction أو صلاحيات المنتج مكانه `core` أو التطبيق، حتى لو كان قابلاً لإعادة الاستخدام.

## 3. كيف تُقرأ أوامر التوليد؟

نفذ الأوامر من جذر المستودع. `ecsc` في الأمثلة اسم مشروع اختير للتوضيح فقط؛ استبدله باسم أي تطبيق موجود في `angular.json`.

```powershell
npm.cmd run ng -- g c customer-card --project=ecsc --path=apps/ecsc/src/features/customers/components --style=none --skip-tests --dry-run
```

- `g c`: اختصار generate component.
- `--project`: مشروع Angular المالك للملف، وليس اسم مجلد اعتباطياً.
- `--path`: مكان الإنشاء من جذر workspace. تحديده يتجنب إنشاء `src/app` غير الموجود في التنظيم الحالي.
- `--style=none`: استخدام Tailwind دون ملف CSS إضافي.
- `--skip-tests`: يتجنب اختبار القالب الافتراضي فقط؛ أضف اختبارات السلوك الفعلي عند الحاجة ضمن تنظيم الاختبارات الحالي.
- `--dry-run`: يعرض الملفات دون كتابتها. احذفه عندما تقرر الإنشاء.
- `--flat`: يلغي المجلد الإضافي باسم العنصر.

نستخدم `npm.cmd` لتفادي تفسير npm.ps1 لبعض الخيارات في Windows PowerShell. إذا كان `ng` متاحاً مباشرة يمكنك تنفيذ نفس الأمر ابتداءً من `ng g`.

## 4. مكوّن خاص بمركز

```powershell
npm.cmd run ng -- g c customer-card --project=ecsc --path=apps/ecsc/src/features/customers/components --style=none --skip-tests
npm.cmd run ng -- g c customers-page --project=ecsc --path=apps/ecsc/src/features/customers/pages --flat --style=none --skip-tests
```

الملفات:

```text
apps/ecsc/src/features/customers/components/customer-card/customer-card.ts
apps/ecsc/src/features/customers/components/customer-card/customer-card.html
apps/ecsc/src/features/customers/pages/customers-page.ts
apps/ecsc/src/features/customers/pages/customers-page.html
```

مثال `customer-card.ts`:

```ts
import { Component, input } from '@angular/core';
import { HlmButton } from '@workspace/ui';

@Component({
  selector: 'app-customer-card',
  imports: [HlmButton],
  templateUrl: './customer-card.html',
})
export class CustomerCard {
  readonly name = input.required<string>();
}
```

```html
<article class="rounded-panel border bg-card p-4">
  <p>{{ name() }}</p>
  <button hlmBtn type="button">عرض</button>
</article>
```

زر العرض هنا مثال تركيبي يحتاج ربطه بحدث/رابط عند بناء السلوك الحقيقي. الأفضل حذف الزر إلى أن يصبح له إجراء.

في `customers-page.ts`:

```ts
import { Component } from '@angular/core';
import { CustomerCard } from '../components/customer-card/customer-card';

@Component({
  selector: 'app-customers-page',
  imports: [CustomerCard],
  templateUrl: './customers-page.html',
})
export class CustomersPage {}
```

```html
<h1>العملاء</h1>
<app-customer-card name="اسم تجريبي" />
```

الـcomponent الصغير يُستورد في `imports` ويستخدم بالـselector. لا يحتاج route أو تسجيل ضمن `centerModule`. الصفحة مكوّن Angular أيضاً؛ تسمية Page تعني أنها عادةً مرتبطة بمسار.

## 5. إظهار صفحة محلية بالـrouting الحالي

في `apps/ecsc/src/routes.ts`، أضف إلى `extensions` مع الحفاظ على التسجيلات الموجودة:

```ts
import type { CenterPages, CenterRoute } from '@workspace/core';
import { CustomersPage } from './features/customers/pages/customers-page';

export const extensions: CenterRoute[] = [
  { path: 'customers', label: 'العملاء', component: CustomersPage },
];
export const pages: CenterPages = {};
```

ملف `config/module.ts` الحالي يمرر `routes: extensions` و`pages` بالفعل. النتيجة هي `/centers/ecsc/customers`، و`label` يضيف رابطاً في التنقل الحالي. مجرد إنشاء صفحة لا يضيف route تلقائياً.

`pages` مخصص لاستبدال صفحة افتراضية مع الاحتفاظ بمسارها؛ مثلاً `pages.dashboard` يستبدل محتوى الرئيسية ولا ينشئ URL جديداً.

## 6. حدود نظام الروابط الحالي وملكية الروابط مستقبلاً

حالياً `packages/core/src/bootstrap.ts` ينشئ المسارات الرئيسية عبر `centerRoutes()` ثم يستدعي `provideRouter()` داخل `startCenter()`. ملفات `apps/*/src/routes.ts` ليست بعدُ ملفات Angular `Routes` مستقلة كاملة.

نوع `CenterRoute` الحالي يحتوي `path`, `label`, `icon`, `component` فقط. لا يمرر `children`, `loadChildren`, `loadComponent`, guards أو route providers. التنقل الافتراضي ومقدمة `/centers/<id>` ثابتان أيضاً.

لهدف اختلاف المراكز جذرياً، التصميم المقترح هو:

- كل تطبيق يملك `app.routes.ts` من نوع Angular `Routes`.
- مكتبة `core` تصدر الصفحات المشتركة ومصانع المسارات الاختيارية.
- bootstrap يقبل routes التطبيق أو يفصل إعداد providers المشتركة عن التسجيل الفعلي للـRouter.
- كل تطبيق يحدد التنقل المناسب لمساراته، مع توافق login/logout والروابط الداخلية.
- الصفحات المشتركة تستقبل سياسة الروابط عند الحاجة بدل افتراض مقدمة URL ثابتة.

مثال على شكل routes بعد تنفيذ هذا الفصل، وليس وصفاً لواجهة `startCenter` الحالية:

```ts
import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'customers' },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/pages/customers-page').then((m) => m.CustomersPage),
  },
];
```

تطبيق آخر يستطيع اختيار `/clients` أو بنية متداخلة مختلفة، واستيراد نفس صفحة العملاء المشتركة. لا يستدعي التطبيق `provideRouter()` ثانية فوق `startCenter()` الحالي؛ يجب تعديل نقطة التهيئة المشتركة أولاً. لا يحتاج اختلاف routes إلى نسخ مكتبة UI.

## 7. مكوّن عام تصنعه بنفسك

```powershell
npm.cmd run ng -- g c status-card --project=ui --path=packages/ui/src/components --style=none --skip-tests
```

مثال مكوّن عام لا يعرف قواعد المنتج:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  template: `<section class="rounded-panel border bg-card p-4">
    <h2 class="font-semibold">{{ title() }}</h2>
    <p class="text-muted-foreground">{{ description() }}</p>
    <ng-content />
  </section>`,
})
export class StatusCard {
  readonly title = input.required<string>();
  readonly description = input('');
}
```

عند استخدام template inline بهذا الشكل، يمكن حذف ملف HTML المولد غير المستخدم.

أضف إلى `packages/ui/src/index.ts`:

```ts
export * from './components/status-card/status-card';
```

ثم بأي مركز أو مكوّن ضمن core:

```ts
import { StatusCard } from '@workspace/ui';
```

أضفه إلى `imports` واستخدمه في القالب. هذا مكوّن مشترك حتى لو لم يُختبر إلا من مركز واحد في البداية. داخل نفس المكتبة استعمل استيراداً نسبياً، وبين المكتبات استعمل اسم الحزمة العام.

## 8. صفحة أو مكوّن منتج مشترك

```powershell
npm.cmd run ng -- g c customers-page --project=core --path=packages/core/src/features/customers/pages --flat --style=none --skip-tests
npm.cmd run ng -- g c customer-card --project=core --path=packages/core/src/features/customers/components --style=none --skip-tests
```

صدّر الصفحة التي تحتاجها التطبيقات من `packages/core/src/index.ts`:

```ts
export { CustomersPage } from './features/customers/pages/customers-page';
```

يمكن لكل تطبيق أن يستورد `CustomersPage` من `@workspace/core` ويسجلها في مساراته. المكونات الداخلية التي لا تستعملها التطبيقات مباشرة لا تحتاج تصديراً عاماً. لا يوجد route لمكتبة `core` لمجرد وجود صفحة فيها؛ التطبيق يجب أن يستخدم الصفحة أو مسارات الميزة.

## 9. Services المشتركة والمحلية

خدمة بيانات مشتركة:

```powershell
npm.cmd run ng -- g s customers-api --project=data-access --path=packages/data-access/src/customers --injectable --type=service --skip-tests
```

سيُنشئ `packages/data-access/src/customers/customers-api.service.ts`. صدّرها من `packages/data-access/src/index.ts` ثم استخدم `inject(CustomersApiService)` عند الحاجة. `--injectable` ينتج `@Injectable` صراحةً وفق نسخة CLI المثبتة.

خدمة خاصة بميزة داخل مركز:

```powershell
npm.cmd run ng -- g s customer-draft --project=ecsc --path=apps/ecsc/src/features/customers/services --injectable --type=service --skip-tests
```

مثال حالتها:

```ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerDraftService {
  readonly search = signal('');
}
```

في الصفحة: `readonly draft = inject(CustomerDraftService)`. الخدمات تضاف إلى نظام DI؛ لا تضعها في مصفوفة `imports` الخاصة بالمكونات. `providedIn: 'root'` يعني نسخة لكل تطبيق Angular مشغّل، وليس نسخة واحدة لكل المستودع. لو أردت حالة جديدة لكل صفحة، قدم الخدمة في `providers` الخاصة بالصفحة بدلاً من الاعتماد على نسخة root.

خدمة HTTP تستورد `HttpClient` من `@angular/common/http` تحتاج إعلان `@angular/common` في حزمة المكتبة التي تستورده مباشرة، حتى لو كانت مثبتة في الجذر. bootstrap الحالي يوفر `provideHttpClient()` بالفعل. عند فصل bootstrap لاحقاً حافظ عليه لكل تطبيق يحتاج HTTP.

القواعد الخالصة المشتركة تكتب كدوال وأنواع في `domain`؛ لا تولّد Angular Service داخل `domain`. المنطق الخاص بمركز يبقى في تطبيقه أو adapter خاص به، ويُمرر للمشترك عبر عقد واضح بدلاً من فحص اسم المركز.

## 10. Custom pipes

Pipe عام للعرض:

```powershell
npm.cmd run ng -- g p display-name --project=ui --path=packages/ui/src/pipes --type-separator=. --skip-tests
```

```ts
import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value?.trim() || 'غير متوفر';
  }
}
```

صدّره من `packages/ui/src/index.ts`:

```ts
export * from './pipes/display-name.pipe';
```

ثم استورده من `@workspace/ui` وأضفه إلى `imports` الخاصة بالمكوّن:

```html
{{ customerName | displayName }}
```

Pipe خاص بمركز:

```powershell
npm.cmd run ng -- g p short-reference --project=ecsc --path=apps/ecsc/src/features/customers/pipes --type-separator=. --skip-tests
```

استورده نسبياً من مكونات نفس المركز. Pipe يعتمد على مفاهيم المنتج المشتركة مكانه `core` وليس `ui`. لا تستخدم pipe لقراءة API أو إخفاء قواعد تعديل البيانات.

## 11. Custom directives

Directive عامة للعرض:

```powershell
npm.cmd run ng -- g d busy --project=ui --path=packages/ui/src/directives --type=directive --skip-tests
```

```ts
import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appBusy]',
  host: { '[attr.aria-busy]': 'appBusy() ? "true" : null' },
})
export class BusyDirective {
  readonly appBusy = input(false);
}
```

صدّره من `packages/ui/src/index.ts`، ثم أضفه إلى `imports`:

```html
<section [appBusy]="loading()">محتوى الصفحة</section>
```

هذه directive تعلن حالة الانشغال فقط؛ لا تمنع النقر تلقائياً.

Directive خاصة بمركز:

```powershell
npm.cmd run ng -- g d read-only --project=ecsc --path=apps/ecsc/src/features/customers/directives --type=directive --skip-tests
```

المولد ينشئ الهيكل، وأنت تضيف السلوك. المكان واسم المشروع يحددان الملكية، ولا يضيفها المولد تلقائياً لكل الصفحات.

## 12. Spartan مشتركة على مستوى المستودع

السياسة المقصودة لهذا المشروع: Brain اعتماد مشترك، وكود Helm داخل `packages/ui/src/helm` فقط. التطبيقات تستخدم exports من `@workspace/ui` ولا تحتفظ بنسخ مستقلة من Spartan.

المكتبة مثبتة أصلاً: `@spartan-ng/brain@1.8.0`. هي معلنة في الجذر وضمن حزمة UI. لا تحتاج إعادة تثبيتها لكل مركز جديد.

`BrnButton` يوفّر السلوك، و`HlmButton` الموجود يوفّر التغليف والتنسيق. المستهلك يستخدم:

```ts
import { HlmButton } from '@workspace/ui';
```

ثم `imports: [HlmButton]` و`<button hlmBtn>حفظ</button>`. ألوان المركز تأتي من semantic tokens، فلا تحتاج نسخ زر لكل هوية.

لإضافة مكوّن Spartan غير موجود، راجع مصدر Helm المتوافق مع إصدار Brain، وأضف ملفاته تحت `packages/ui/src/helm` مع تكييف الاستيرادات الداخلية والتوكنات، ثم صدّر العنصر من `packages/ui/src/index.ts`. لو احتاج wrapper أعلى مستوى مكانه `packages/ui/src/components` بشرط أن يبقى عاماً.

الأمر الرسمي العام لـSpartan هو `ng g @spartan-ng/cli:ui`، لكن CLI غير مثبت هنا. حزمة CLI 1.8.0 نفسها تعلن اعتماديات Nx؛ لذلك لا نثبتها مباشرة في هذا المستودع المقصود أن يبقى Angular CLI + Turbo دون Nx. إضافة Helm يدوياً من المصدر أو بأدوات Spartan المتاحة تحافظ على الأدوات الحالية. لا تحتاج تشغيل مولد theme لمجرد إضافة عنصر، فالثيم مهيأ بالفعل.

## 13. الاعتماديات وحدود الاستيراد

- `apps` تستطيع استيراد `core`, `ui`, `data-access`, `domain`.
- `core` يستطيع استيراد الثلاثة الآخرين.
- `data-access` يستورد `domain`.
- `ui` لا يعرف خدمات المنتج وبياناته؛ الاستثناء الحالي من domain هو أدوات التاريخ العامة.
- `domain` لا يستورد Angular.
- لا تستورد مكتبة من تطبيق، ولا تجعل تطبيقاً يستورد ملفات تطبيق آخر.
- الربط بين الحزم يمر عبر `src/index.ts`، وليس مسار ملف داخلي.

عند إضافة مكتبة npm أعلنها في `package.json` الخاص بالـworkspace الذي يستوردها مباشرة، مع الحفاظ على ملف القفل الواحد. وجودها في `node_modules` بالجذر لا يعني أن واجهاتها متاحة تلقائياً في قوالب Angular.

`ng-package.json` يحدد نقطة تصدير المكتبة ومسار بنائها، وليس تسجيل المكونات أو DI أو routes. لا تعدله عند كل مكوّن جديد؛ حدّث `src/index.ts` عندما تريد تصدير العنصر للمستهلكين.

## 14. كيف نبدأ من مركز واحد ثم نعمم؟

1. اختر الميزة الأولى وعرّف ما هو تجريبي وما هو متطلب حقيقي.
2. اكتب الواجهة العامة القابلة لإعادة الاستخدام في `ui`.
3. اكتب الأنواع والقواعد المتفق على عموميتها في `domain`، والقراءة والتحديث والحالة المشتركة في `data-access`.
4. إذا كانت صفحة المنتج عامة فعلاً، ابنها في `core` وفعّلها من مركز واحد أولاً.
5. ما زال غير مؤكد العمومية؟ ابدأ به محلياً داخل feature المركز؛ عند ثبوت المشاركة انقل الجزء المشترك وعدّل imports بدل نسخه إلى تطبيق ثانٍ.
6. أبقِ المسارات والهوية والاختلافات الحقيقية في التطبيق. مرر الاختلافات كـinputs/إعدادات/عقود adapters أو providers حسب الحالة.
7. عند تشغيل المركز الثاني يستهلك التنفيذ المشترك نفسه، مع بياناته وتخصيصاته. لا يصبح ترتيب routes أو أسماء URLs ملزماً له لمجرد مشاركة الصفحة.

## 15. التحقق

أمثلة توليد Angular في هذا الدليل راجعت مساراتها باستخدام `--dry-run` على CLI المشروع. هي أمثلة تعليمية لم تُضف تلقائياً إلى التطبيقات. فصل ملكية routing المقترح لم يُنفذ في هذا الدليل.

عند تنفيذ ميزة فعلية:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

أضف فحوص المتصفح الملائمة للتغيير. تفاصيل التحقق الكاملة في [VALIDATION.md](VALIDATION.md).

مراجع: [Angular CLI](https://angular.dev/cli/generate)، [Angular Routes](https://angular.dev/guide/routing/define-routes)، [Spartan CLI](https://spartan.ng/documentation/cli).
