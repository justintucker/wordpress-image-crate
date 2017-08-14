/**
 * wp.media.view.StockPhotosBrowser
 *
 * @class
 * @augments wp.media.view.AttachmentsBrowser
 */
var ImageCrateSearch = require('./search.js'),
    NoResults = require('./no-results.js'),
    VerticalsFilter = require('./verticals-filter.js'),
    coreAttachmentsInitialize  = wp.media.view.AttachmentsBrowser.prototype.initialize,
    ProviderPhotosBrowser;

ProviderPhotosBrowser = wp.media.view.AttachmentsBrowser.extend({

    initialize: function () {
        coreAttachmentsInitialize.apply(this, arguments);

        this.createToolBar();
        // this.createUploader();
    },

    /**
     * Override core toolbar view rendering.
     *
     * Change events are auto assigned to select fields and text inputs. Any form change will send
     * new values to the backend via an ajax call.
     */
    createToolBar: function() {
        // Labels are display visually, but they are rendered for accessibility.
        this.toolbar.set('VerticalsFilterLabel', new wp.media.view.Label({
            value: 'Verticals Label',
            attributes: {
                'for': 'media-attachment-vertical-filters'
            },
            priority: -75
        }).render());

        this.toolbar.set('VerticalsFilter', new VerticalsFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -75
        }).render());

        // todo: Fix a bug where setting a custom search causes two ajax calls to fire on content render.
        // this.toolbar.set('search', new ImageCrateSearch({
        //     controller: this.controller,
        //     model: this.collection.props,
        //     priority: 60
        // }).render());

        this.views.add(this.toolbar);
    },

    /**
     * Override core uploader method.
     *
     * In the previous version of the plugin the uploader was overridden to show no results if a term search
     * came up empty. In this version the upload tab is not rendered and not needed when interacting with
     * external image APIs.
     *
     * todo: Move no results to its own view and render if no results are in the response
     * Code is left here for reference.
     */
   // createUploader: function () {
        // this.noresults = new NoResults({
        //     controller: this.controller,
        //     status: false,
        //     message: 'Sorry, No images were found.'
        // });
        //
        // // this.noresults.hide();
        // this.views.add(this.noresults);
    //},
});

module.exports = ProviderPhotosBrowser;