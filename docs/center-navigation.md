# Center navigation

Routes connect URLs to pages. Navigation controls the links and groups shown in the menu. Grouping links does not require a route for the group or change the pages' URLs.

Create or edit `apps/<center>/src/navigation.ts`:

```ts
import type { CenterNavItem } from '@workspace/core';

export const navigation: CenterNavItem[] = [
  { kind: 'link', id: 'home', label: 'Home', path: '' },
  { kind: 'link', id: 'aurora', label: 'Aurora', path: 'aurora' },
  {
    kind: 'group',
    id: 'transactions',
    label: 'Transactions',
    children: [
      {
        kind: 'link',
        id: 'personal-inbox',
        label: 'My transactions',
        path: 'inbox/personal',
        badge: 'personal',
      },
      {
        kind: 'link',
        id: 'group-inbox',
        label: 'Group transactions',
        path: 'inbox/group',
        badge: 'group',
      },
    ],
  },
];
```

In `config/module.ts`, import `navigation` and pass it to the existing `defineCenter` object alongside `routes` and `pages`:

```ts
import { navigation } from '../navigation';
```

The settings have different meanings:

- `navigation: undefined`: use the default menu, including extension routes that have a label.
- A navigation array: define the entire menu. Default links are not added automatically.
- `navigation: []`: show no links.

The center generator creates `navigation.ts` with an `undefined` value to preserve the default starting menu.

## Default icons

| Entry without an icon     | Default icon            |
| ------------------------- | ----------------------- |
| Top-level page link       | `phosphorFileText`      |
| Group at any depth        | `phosphorTreeStructure` |
| Child link inside a group | `phosphorArrowLeft`     |

Set `icon` on an entry to override its default. The name must be registered in the UI package's `AppIcon`. Navigation icons are independent of icons on route definitions.

## Display and behavior

- Expanded sidebar and mobile navigation: expandable groups with nested links.
- Navbar: CDK dropdown menus, including submenus for nested groups.
- Collapsed sidebar and compact transaction rail: popup menus next to the icons.
- Changing shells preserves the current page and uses the same navigation definition.
- The active link is highlighted and its sidebar groups open automatically. `exact: true` excludes child paths from matching; the home link matches exactly by default.
- CDK and Helm handle keyboard navigation, Escape, focus restoration, and RTL. In RTL, the left arrow opens a submenu.
- Choosing a link closes the mobile navigation sheet.
- `badge: 'personal'` shows the user's transaction count. `badge: 'group'` shows the current center's group count, without checking the center's name.

IDs must be unique across the full tree and use lowercase Latin letters, digits, and hyphens. Groups cannot be empty. Paths are relative to `/centers/<id>` and cannot start with `/`, contain parent-directory traversal, or point to an external URL. Configuration validation rejects duplicate IDs and paths outside the center.

Links must point to registered routes. Hiding a link does not block access to a page or replace authorization in a real system.

See `apps/layal-center/src/navigation.ts` for a working nested example. Centers without custom navigation keep the default menu.

## Layal demo pages

Each page has a folder under `apps/layal-center/src/pages` and a route in `routes.ts`. Its menu placement and icon come from `navigation.ts`:

| Page    | Relative path   | Menu placement                | Icon                               |
| ------- | --------------- | ----------------------------- | ---------------------------------- |
| About   | `about`         | Top-level link                | Default page icon                  |
| Team    | `team`          | Top-level link                | Custom: `phosphorUsers`            |
| FAQ     | `guide/faq`     | Inside the center guide group | Default child icon                 |
| Contact | `guide/contact` | Inside the center guide group | Custom: `phosphorUserCircleDashed` |

The center guide group has no explicit icon, so it receives the default group icon. It has no page or route of its own; clicking it opens the child links. The pages contain sample content that can be edited in their HTML files.

The labels in this guide are English explanations. They do not change the application's localized UI labels.
