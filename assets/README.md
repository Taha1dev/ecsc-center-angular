# Shared assets

`branding/default-center/` contains the default identity used by the center generator when the developer answers `n` to the visual identity question. `brand.json` holds the colors and logo filename; `id.webp` is used for both the logo and favicon.

The generator copies the image unchanged into `apps/<center>/public/brands/<center>/logo.webp`. Each generated application then serves its own copy and can be built independently. Updating the shared source affects future centers, not existing ones.

`branding/default-center/stars-pattern.png` is the shared login pattern. Every new center receives an unchanged copy in its own public brand folder, whether it uses the default or a custom identity.

This folder is not served automatically as a global public directory. Files a particular center needs at runtime belong in that application's `public/` folder. Its Angular asset configuration determines the public URL.
