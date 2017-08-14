# WordPress Image Crate
Connecting to external image apis to display and download images via the core WordPress media modal.

Version 3 of the plugin has been completely rewritten to replicate core behavior within the modal.

## Adding a Provider
Two things need to happen to add a provider. First, a javascript controller needs to be added to `assets/js/controllers` and a new state has to be added to `image-crate.manifest.js` in the `createStates()` function.

Next, a provider needs to extend the abstract provider class and supply body for the required methods. 

## Todo

### General
Scaffolding has been set up for multiple providers on both the backend and the frontend (admin page). 

#### Past Project requirements

##### Custom Directories
In the past has been to store providers in a custom directory. For getty images, the directory was located in `wp-content/uploads/getty-images/year/month`. Placing images in a custom directory will break image paths, so the images need to be filtered. Getty images are handled [here](https://github.com/fansided/fansided-vip/blob/master/includes/FS_Getty_Images.class.php#L83-L86) and USA Today Images(now deactivated) are handle [here](https://github.com/fansided/fansided-v5/blob/master/inc/post-functions.php#L918-L963). 
##### Tracking
As of 8/11/2017, Getty Images is only provider has image tracking implemented. That code is found [here](https://github.com/fansided/fansided-vip/blob/master/includes/FS_Getty_Images.class.php#L902). Image tracking is used to keep a tally of images used by FanSided that can be compared with the provider's numbers for accurate billing.   

As a quick overview of the current tracking method, an attachment post on blog id one (fansidedblogs.net) is created when an image is downloaded from a provider. When another site downloads that same image, the id of the post is tracked in the attachment post postmeta. A SQL query can then be ran to poll the usage numbers.

### PHP
- Finish/fine tune the provider selector in the get() method in class-admin-init.php
- Complete body for image providers, use classes in the `_reference` folder for structure
- Maybe add tracking

### JS
File: *app/assets/js/views/browser/attachments.js*
- Fix a bug where setting a custom search causes two ajax calls to fire on content render.
- Move no results to its own view and render if no results are in the response

File: *app/assets/js/views/browser/search.js*
- Todo: This is fixed in 4.8, but still needs tested with this plugin. To test, comment out deBounceSearch()

File: *app/assets/js/views/toolbars/provider.js*
- ajax call to download image here