# Domain

Shared TypeScript types, validation, calculations, registry rules, and commands that do not depend on Angular or a particular application's implementation.

## Public entry point

Import from `@workspace/domain` (`src/index.ts`). The public exports cover domain models, schema/workflow helpers, validation, and generic calendar-date utilities. Existing transaction types describe the current shared feature contract; they are not proof that every future center has the same business requirements.

Keep agreed rules here. If a rule is unique to one center, keep its implementation/application configuration local and supply any required variation through a typed contract. Do not choose behavior by enumerating known center IDs.

Domain files can be written as plain TypeScript; do not generate Angular services, components, pipes, or directives here. The package must not import Angular, UI, core, data-access, or application files. Validation may use the declared schema dependency.

Use existing local calendar helpers for calendar-only values so dates do not shift through UTC serialization. Keep mutation validation deterministic and separate business eligibility from display wording or icons.

See [architecture](../../docs/ARCHITECTURE.md) for boundaries and [development](../../docs/development-guide.md) for examples. Request coordination and integration implementations belong in [data-access](../data-access/README.md).
