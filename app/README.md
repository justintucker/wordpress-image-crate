# WordPress Image Crate
Connecting to external image apis to display and download images via the core WordPress media modal.

Version 3 of the plugin has been completely rewritten to replicate core behavior within the modal.

## Adding a Provider
Two things need to happen to add a provider. First, a javascript controller needs to be added to `assets/js/controllers` and a new state has to be added to `image-crate.manifest.js` in the `createStates()` function.

Next, a provider needs to extend the abstract provider class and supply body for the required methods. 