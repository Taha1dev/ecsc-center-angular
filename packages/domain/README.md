# Domain

This is where we describe the data the product works with and the rules that apply to it. The code here should work without Angular, a browser, or a running center.

A transaction type belongs here. So does a function that checks a command or calculates a total. A dialog that lets someone edit that transaction belongs elsewhere.

## What goes here

- Types and interfaces for transactions, people, services, commands, and results.
- Validation and rules that operate on those values.
- Pure calculations and date helpers.
- Contracts for service definitions and extension registries.

The current structure includes:

| Location               | Contents                                                           |
| ---------------------- | ------------------------------------------------------------------ |
| `src/domain/`          | Models, commands, validation, workflow helpers, and registry rules |
| `src/types/`           | Types exposed to the rest of the workspace                         |
| `src/lib/`             | Formatting and presentation helpers that do not depend on Angular  |
| `src/calendar-date.ts` | Calendar dates without timezone conversion                         |
| `src/index.ts`         | The public exports                                                 |

## Adding something

Create a TypeScript file by hand. You do not need `ng g` for an interface or a function.

For example, a future customer feature might start with:

```text
src/customers/
  customer.ts
  customer-rules.ts
```

Keep the rules specific to what has actually been agreed for the product. Demo data is not a source of production requirements.

Export anything other packages need through `src/index.ts`. Consumers then use the package name:

```ts
import type { Transaction } from '@workspace/domain';
```

## Keep outside this package

Angular components, injectable services, HTTP requests, storage, routing, and UI state do not belong here. Neither do imports from `apps`, `core`, `ui`, or `data-access`.

If a rule needs data from a server, let data-access fetch it and pass the relevant values into the rule. The rule itself should not make the request.

For the rest of the flow, see [data-access](../data-access/README.md) and [core](../core/README.md).
