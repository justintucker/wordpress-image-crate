/**
 * wp.media.controller.GettyImagesController
 *
 * Custom Toolbar for downloading images
 *
 * @augments wp.media.controller.Library
 */
var ProviderToolbar = function (view) {
    var controller = this,
        state = controller.state();

    this.selectionStatusToolbar(view);

    view.set(state.get('id'), {
        style: 'primary',
        priority: 80,
        text: state.get('button'),
        requires: {selection: true},

        /**
         * @fires wp.media.controller.State#insert
         */
        click: function () {
            var selection = state.get('selection');

            // todo: ajax call to download image here
            // reference image-crate.manifest.js from v2 for execution here.

            controller.close();
            state.trigger('insert', selection).reset();
        }
    });
};

module.exports = ProviderToolbar;