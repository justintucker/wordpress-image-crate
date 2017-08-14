(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * wp.media.controller.GettyImagesController
 *
 * A state for downloading images from an external image source
 *
 * @augments wp.media.controller.Library
 */
var Library = wp.media.controller.Library,
    GettyImagesController;

GettyImagesController = Library.extend({

    /**
     * Extend the core defaults and add modify listener key values. These values are referenced when
     * the controller is triggered.
     */
    defaults: _.defaults({
        id: 'getty-images',
        title: 'Getty Images (IC)',
        priority: 300,
        content: 'provider',
        router: 'image-provider',
        toolbar: 'image-provider',
        button: 'Download Getty Image',

        /**
         * Any data that needs to be passed from this controller via ajax, should be passed with this object.
         *
         * The provider key is parsed on the backend to determine which object to use. The chosen object is then used
         * to retrieve images from a external service.
         */
        library: wp.media.query({ provider: 'getty-images'} )

    }, Library.prototype.defaults ),

    activate: function () {
        this.set('mode', this.id );
    }
});

module.exports = GettyImagesController;
},{}],2:[function(require,module,exports){
/**
 * wp.media.controller.ImageExchangeController
 *
 * A state for downloading images from an external image source
 *
 * @augments wp.media.controller.Library
 */
var Library = wp.media.controller.Library,
    ImageExchangeController;

ImageExchangeController = Library.extend({

    /**
     * Extend the core defaults and add modify listener key values. These values are referenced when
     * the controller is triggered.
     */
    defaults: _.defaults({
        id: 'image-exchange',
        title: 'Image Exchange',
        priority: 320,
        content: 'provider',
        router: 'image-provider',
        toolbar: 'image-provider',
        button: 'Download FanSided Image',

        /**
         * Any data that needs to be passed from this controller via ajax, should be passed with this object.
         *
         * The provider key is parsed on the backend to determine which object to use. The chosen object is then used
         * to retrieve images from a external service.
         */
        library: wp.media.query({ provider: 'image-exchange' })
    }, Library.prototype.defaults ),

    activate: function () {
        this.set( 'mode', this.id );
    }
});

module.exports = ImageExchangeController;
},{}],3:[function(require,module,exports){
(function ($) {
	$(function () {

        /**
         * Image Crate Manifest - Adding custom controllers to the WordPress media modal.
         *
         * The main effort of this project is to add multiple image providers in a native WordPress way. This is
         * executed by extending the Post MediaFrame {VVV/www/wordpress-develop/src/wp-includes/js/media/views/frame/post.js}
         *
         */
		var imagecrate = imagecrate || {};

        // Store the core post view.
		var corePost = wp.media.view.MediaFrame.Post;

		// Controllers
		imagecrate.ImageExchangeController = require('./controllers/image-exchange.js');
		imagecrate.GettyImagesController = require('./controllers/getty-images.js');

		// Attachment Models
        imagecrate.ProviderAttachments = require('./models/attachments.js');

		// Views
		imagecrate.ProviderToolbar = require('./views/toolbars/provider.js');
        imagecrate.ProviderPhotosBrowser = require('./views/browser/attachments.js');

		/**
		 * Add controllers to the media modal Post Frame
		 */
		wp.media.view.MediaFrame.Post = corePost.extend({

            /**
             * If you want to extend the function body from a parent object you need to call prototype.functionName.
             *
             * This is similar to using `parent::__construct();` in php.
             */
            createStates: function () {
				corePost.prototype.createStates.apply(this, arguments);

                /**
                 * Adding states adds menu items to the left menu on the media modal.
                 */
				this.states.add([
					new imagecrate.GettyImagesController,
					new imagecrate.ImageExchangeController
				]);
			},

            /**
             * Assign handlers to controllers.
             *
             * `content:create:provider` is a listener assignment for an event that is triggered when a provider
             * controller is clicked. When this event is triggered, the callback is fired and any listeners subscribed
             * to the event, will update their views.
             */
            bindHandlers: function () {
				corePost.prototype.bindHandlers.apply(this, arguments);

				this.on('toolbar:create:image-provider', this.createToolbar, this);
				this.on('toolbar:render:image-provider', imagecrate.ProviderToolbar, this);

                this.on('router:create:image-provider', this.createRouter, this);
                this.on('router:render:image-provider', this.providerRouter, this);

                this.on('content:create:provider', this.providerContent, this);
			},

            /**
             * Load images from an external source.
             *
             * @param contentRegion
             */
            providerContent: function( contentRegion ) {
                var state = this.state(),
                    id = state.get('id'),
                    collection = state.get('image_crate_photos'),
                    selection = state.get('selection');

                if (_.isUndefined(collection)) {
                    collection = new imagecrate.ProviderAttachments(
                        null,
                        {
                            /**
                             * Passing the props from the controller is important here. The provider type is set when
                             * the controller is instantiated. When the ajax call is sent, provider type passed as a
                             * request param. That value is then used to create new object to get images from the
                             * requested provider.
                             */
                            props: state.get('library').props.toJSON()
                        }
                    );

                    // Reference the state if needed later
                    state.set('image_crate_photos', collection);
                }

                /**
                 * Set main content view to display external images.
                 *
                 * @see /assets/js/views/browser/attachments.js
                 */
                contentRegion.view = new imagecrate.ProviderPhotosBrowser({
                    tagName: 'div',
                    className: id + ' image-crate attachments-browser',
                    controller: this,
                    collection: collection,
                    selection: selection,
                    model: state,
                    filters: true,
                    search: true,
                });
            },

            /**
             * When the router listener is fired, the view updates the tabs located above the image browser.
             *
             * If only one object is passed, the tab view will not display. Priority controls render order.
             */
            providerRouter: function (routerView) {
                routerView.set({

                    /*
                     * The naming of this object is important here. When this router is rendered,
                     * 'content:create:provider' is trigger and the content is updated.
                     */
                    provider: {
                        text: 'Provider',
                        priority: 20
                    }
                });
            }
		});
	});
})(jQuery);

},{"./controllers/getty-images.js":1,"./controllers/image-exchange.js":2,"./models/attachments.js":4,"./views/browser/attachments.js":6,"./views/toolbars/provider.js":10}],4:[function(require,module,exports){
/**
 * wp.media.model.StockPhotosQuery
 *
 * A collection of attachments.
 *
 * @class
 * @augments wp.media.model.Attachments
 */
var ProviderQuery = require('./query');

var ProviderAttachments = wp.media.model.Attachments.extend({
    /**
     * Override core _requery method to accept a custom query
     *
     * @param refresh
     * @private
     */
    _requery: function (refresh) {
        var props;

        if ( this.props.get('query') ) {
            props = this.props.toJSON();
            props.cache = ( true !== refresh );
            this.mirror( ProviderQuery.get( props ) );
        }
    }
});

module.exports = ProviderAttachments;

},{"./query":5}],5:[function(require,module,exports){
/**
 * wp.media.model.ProviderQuery
 *
 * A collection of attachments from the external data source.
 *
 * This file is nearly one to one replica of the core query file. Exceptions are where options.data is extended to
 * communicate with a custom method and where Query is updated to use the overridden core query.
 *
 * @augments wp.media.model.Query
 */
var ProviderQuery = wp.media.model.Query.extend({
        /**
         * Overrides wp.media.model.Query.sync
         * Overrides Backbone.Collection.sync
         * Overrides wp.media.model.Attachments.sync
         *
         * @param {String} method
         * @param {Backbone.Model} model
         * @param {Object} [options={}]
         * @returns {Promise}
         */
        sync: function (method, model, options) {
            var args;

            // Overload the read method so Attachment.fetch() functions correctly.
            if ('read' === method) {
                options = options || {};
                options.context = this;
                options.data = _.extend(options.data || {}, {
                    action: 'image_crate_get',
                    _ajax_nonce: imagecrate.nonce
                });

                // Clone the args so manipulation is non-destructive.
                args = _.clone(this.args);

                // Determine which page to query.
                if (-1 !== args.posts_per_page) {
                    args.paged = Math.round(this.length / args.posts_per_page) + 1;
                }

                options.data.query = args;
                return wp.media.ajax(options);

                // Otherwise, fall back to Backbone.sync()
            } else {
                /**
                 * Call wp.media.model.Attachments.sync or Backbone.sync
                 */
                fallback = Attachments.prototype.sync ? Attachments.prototype : Backbone;
                return fallback.sync.apply(this, arguments);
            }
        }
    },
    {
        /**
         * Overriding core behavior
         */
        get: (function () {
            /**
             * @static
             * @type Array
             */
            var queries = [];

            /**
             * @returns {Query}
             */
            return function (props, options) {
                var someprops = props;
                var Query = ProviderQuery,
                    args = {},
                    query,
                    cache = !!props.cache || _.isUndefined(props.cache);

                // Remove the `query` property. This isn't linked to a query,
                // this *is* the query.
                delete props.query;
                delete props.cache;

                // Generate the query `args` object.
                // Correct any differing property names.
                _.each(props, function (value, prop) {
                    if (_.isNull(value)) {
                        return;
                    }
                    args[prop] = value;
                });

                // Fill any other default query args.
                _.defaults(args, Query.defaultArgs);

                // Search the query cache for a matching query.
                if (cache) {
                    query = _.find(queries, function (query) {
                        return _.isEqual(query.args, args);
                    });
                } else {
                    queries = [];
                }

                // Otherwise, create a new query and add it to the cache.
                if (!query) {
                    query = new Query([], _.extend(options || {}, {
                        props: props,
                        args: args
                    }));
                    queries.push(query);
                }
                return query;
            };
        }())
    });

module.exports = ProviderQuery;

},{}],6:[function(require,module,exports){
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
     * todo: Move no results to it's own view and render if no results are in the response
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
},{"./no-results.js":7,"./search.js":8,"./verticals-filter.js":9}],7:[function(require,module,exports){
/**
 * wp.media.view.NoResults
 *
 * @augments wp.media.view.UploaderInline
 */
var UploaderInline = wp.media.view.UploaderInline,
    NoResults;

NoResults = UploaderInline.extend({
    tagName: 'div',
    className: 'image-crate-no-results uploader-inline',
    template: wp.template('image-crate-no-results'),

    ready: function () {
        var $browser = this.options.$browser,
            $placeholder;

        if (this.controller.uploader) {
            $placeholder = this.$('.browser');

            // Check if we've already replaced the placeholder.
            if ($placeholder[0] === $browser[0]) {
                return;
            }

            $browser.detach().text($placeholder.text());
            $browser[0].className = 'browser button button-hero';
            $placeholder.replaceWith($browser.show());
        }

        this.refresh();
        return this;
    }
});

module.exports = NoResults;

},{}],8:[function(require,module,exports){
/**
 * wp.media.view.ImageCrateSearch
 *
 * imagecrate.default_search is rendered on the page by using wp_localize_script on image-crate.js.
 *
 * @augments wp.media.view.Search
 */
var ImageCrateSearch = wp.media.View.extend({
    tagName: 'input',
    className: 'search ic-search',
    id: 'media-search-input',

    attributes: {
        type: 'search',
        placeholder: 'Search Images'
    },

    events: {
        'input': 'search',
        'keyup': 'search'
    },

    initialize: function() {
        if ( this.model.get( 'search' ) === undefined ) {
            this.model.set( 'search', imagecrate.default_search );
        }
    },

    /**
     * @returns {wp.media.view.Search} Returns itself to allow chaining
     */
    render: function () {
        this.el.value = this.model.get( 'search' ) === undefined ? imagecrate.default_search : this.model.escape( 'search' );
        return this;
    },

    search: function (event) {
        this.deBounceSearch(event);
    },

    /**
     * There's a bug in core where searches aren't de-bounced in the media library.
     * Normally, not a problem, but with external api calls or tons of image/users, ajax
     * calls could effect server performance. This fixes that for now.
     *
     * Todo: This is fixed in 4.8, but still needs tested with this plugin. To test, comment out deBounceSearch()
     */
    deBounceSearch: _.debounce(function (event) {
        if (event.target.value) {
            this.model.set('search', event.target.value);
        } else {
            this.model.unset('search');
        }
    }, 500)

});

module.exports = ImageCrateSearch;
},{}],9:[function(require,module,exports){
/**
 * wp.media.view.VerticalsFilter
 *
 * @augments wp.media.view.AttachmentFilters
 */
var VerticalsFilter = wp.media.view.AttachmentFilters.extend( {
    id: 'media-attachment-vertical-filters',

    createFilters: function () {
        var filters = {};
        var verticals = [
            { vertical: 'NFL', text: '- NFL' },
            { vertical: 'NBA', text: '- NBA' },
            { vertical: 'MLB', text: '- MLB' },
            { vertical: 'NHL', text: '- NHL' },
            { vertical: 'NCAA Basketball', text: '- NCAA: Basketball' },
            { vertical: 'NCAA Football', text: '- NCAA: Football' },
            { vertical: 'SOCCER', text: '- Soccer' },
            { vertical: 'ENT', text: 'Entertainment '}
        ];

        _.each(verticals || {}, function ( value, index ) {
            filters[ index ] = {
                text: value.text,
                props: {
                    vertical: value.vertical
                }
            };
        });

        filters.all = {
            text: 'All Sports',
            props: {
                vertical: false
            },
            priority: 10
        };
        this.filters = filters;
    }
});

module.exports = VerticalsFilter;
},{}],10:[function(require,module,exports){
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

            // todo: download image here
            // reference image-crate.manifest.js from v2 for execution here.

            controller.close();
            state.trigger('insert', selection).reset();
        }
    });
};

module.exports = ProviderToolbar;
},{}]},{},[3]);
