# Spartan الرسمية في المشروع

CLI مثبت، وملف `components.json` في الجذر مضبوط على:

```json
{
  "componentsPath": "libs/ui",
  "importAlias": "@spartan-ng/helm",
  "style": "maia"
}
```

Maia يحدد نمط مكونات Helm المولّدة. ألوان المركز وخط Alexandria تبقى من التوكنات والثيم الموجودين. الملفات المولّدة مشتركة لكل المراكز، وليست مرتبطة بتطبيق معيّن.

## إضافة مكوّن

من جذر المشروع:

```sh
ng g @spartan-ng/cli:ui autocomplete
ng g @spartan-ng/cli:ui accordion
```

أو باستخدام CLI المحلي عبر السكربت الموجود:

```sh
npm run ng -- g @spartan-ng/cli:ui autocomplete
```

لا تحتاج تحديد مركز. الملفات تنزل في `libs/ui/autocomplete/src`، والاستيراد الرسمي هو `@spartan-ng/helm/autocomplete`. الاختيار التفاعلي لعدة عناصر متاح عبر `ng g @spartan-ng/cli:ui`.

الإضافة حسب الحاجة فقط. عناصر `button` و`input` و`textarea` و`popover` و`select` تستخدمها مكونات المشروع الحالية، لذلك مصدرها المشترك موجود في `libs/ui`. نزّل أي عنصر إضافي عند حاجته؛ لا تستخدم `all` إلا إذا كنت تقصد تثبيت كل المكونات.

تشغيل الأمر لعنصر موجود يجعله يتخطاه. المولّد يعتبر الـalias دليلاً على التثبيت، لذلك لا تحذف مجلد مكوّن مع إبقاء alias يشير لملف مفقود.

## الاستخدام داخل أي مركز

مثال Accordion في ملف المكوّن:

```ts
import { Component } from '@angular/core';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';

@Component({
  selector: 'app-example',
  imports: [HlmAccordionImports],
  templateUrl: './example.html',
})
export class Example {}
```

وفي `example.html`:

```html
<hlm-accordion>
  <hlm-accordion-item>
    <hlm-accordion-trigger>تفاصيل إضافية</hlm-accordion-trigger>
    <hlm-accordion-content>محتوى توضيحي.</hlm-accordion-content>
  </hlm-accordion-item>
</hlm-accordion>
```

Autocomplete يتبع نفس الفكرة:

```ts
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
```

أضف `HlmAutocompleteImports` إلى `imports` في المكوّن، ثم استخدم عناصره حسب مثال Spartan الرسمي.

## التنظيم والتحقق

- اترك ملفات `libs/ui` بهيكلها الرسمي، بما فيها المكونات ذات القوالب inline. قاعدة المجلد وملف HTML المنفصل تخص المكونات المملوكة داخل `packages`.
- `packages/ui` تملك مكونات المنتج مثل `AppField` و`AppSelect` التي تركّب عناصر Helm المشتركة. لا يوجد تنفيذ Helm مكرر داخلها. تصديرات الزر وحقول الإدخال القديمة من `@workspace/ui` تشير لنفس عناصر `libs/ui` للتوافق.
- `libs/ui` حزمة workspace خاصة باسم `@spartan-ng/helm`. تجهيز entrypoints وبناؤها يتم قبل `packages/ui` تلقائياً عند بناء مركز عبر Turbo؛ سكربت `prepare-helm-package.mjs` يجهّز metadata لأي مكوّن تضيفه لاحقاً دون نقل ملفات CLI.
- الاستيرادات داخل التطبيقات تكون من alias العام فقط. إعداد VS Code في `.vscode/settings.json` يفضّل الاستيرادات غير النسبية بدلاً من سلاسل `../../`.
- ملف `packages/ui/src/styles/globals.css` يربط preset ومصادر Tailwind لجميع المراكز، بما فيها المراكز الجديدة.
- تعديل `libs/ui` يؤثر في cache البناء عبر `globalDependencies` في Turbo.

فحص Spartan وحدها:

```sh
npm run typecheck:spartan
```

المراجع: [Spartan CLI](https://spartan.ng/documentation/cli)، [components.json](https://spartan.ng/documentation/components-json)، [Autocomplete](https://spartan.ng/components/autocomplete).

إذا لم تنزّل أي مكوّن بعد، أمر الفحص يطبع رسالة ويتخطى فحص Helm بدل أن يفشل بسبب عدم وجود ملفات TypeScript.
