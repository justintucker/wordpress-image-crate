<?php

namespace ImageCrate\Admin;

use ImageCrate\Admin\Providers\Provider_Getty_Images;

/**
 * Admin Class
 *
 * Loads setting settings and scripts.
 *
 * @version  2.0.0
 * @package  Image_Crate
 * @author   justintucker
 */
class Admin_Init {

	/**
	 * Run Hooks
	 */
	public static function run() {
		Scripts::setup();

		add_action( 'admin_init', array( get_called_class(), 'register_fields' ) );
		add_filter( 'plugin_action_links_wordpress-image-crate/image-crate.php', array( get_called_class(), 'add_action_links' ) );
		add_action( 'wp_ajax_image_crate_get', array( get_called_class(), 'get' ) );
	}

	public static function get() {
		check_ajax_referer( 'image_crate' );

		// This could be cleaner
		$provider = $_REQUEST['query']['provider'];
		$provider = str_replace( '-', ' ', $provider );
		$provider = ucwords( $provider );
		$provider = str_replace( ' ', '_', $provider );

		$provider = '\ImageCrate\Admin\Providers\Provider_' . $provider;
		$provider = new $provider;
		//$provider->fetch();

		$images = static::prepare_attachments();

		return wp_send_json_success( $images );
	}

	public static function prepare_attachments() {

		$images = [];

		/**
		 * Todo: Data here is just for testing. Actual data should pull from the designated provider class.
		 */
		if ( 'getty-images' === $_REQUEST['query']['provider'] ) {

			$images[] = [
				'id'           => 687131838,
				'title'        => 'Star Wars Commemorative Stamp Presentation',
				'filename'     => 'star-wars-commemorative-stamp-presentation',
				'caption'      => 'MADRID, SPAIN - MAY 23:  Presentation of the Star wars commemorative stamp at Correos Offices',
				'description'  => 'Presentation of the Star wars commemorative stamp at Correos Offices',
				'type'         => 'image',
				'sizes'        => array(
					'thumbnail' => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131838-star-wars-commemorative-stamp-presentation.jpg-150x150.jpg',
						'width'  => '150',
						'height' => '150',
					),
					'full'      => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131838-star-wars-commemorative-stamp-presentation.jpg-268x162.jpg',
						'width'  => '268',
						'height' => '162',
					),
					'large'     => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131838-star-wars-commemorative-stamp-presentation.jpg.jpg',
						'width'  => '3500',
						'height' => '2329',
					),
				),
				'download_uri' => 'http://google.com',
				'max_width'    => '3500',
				'max_height'   => '2329',
			];
		}

		if ( 'image-exchange' === $_REQUEST['query']['provider'] ) {
			$images[] = [
				'id'           => 687131814,
				'title'        => 'Some other presentation for star wars',
				'filename'     => 'star-wars-is-the-best',
				'caption'      => 'MADRID, SPAIN - MAY 23:  Presentation of the Star wars commemorative stamp at Correos Offices',
				'description'  => 'Presentation of the Star wars commemorative stamp at Correos Offices',
				'type'         => 'image',
				'sizes'        => array(
					'thumbnail' => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131814-star-wars-commemorative-stamp-presentation.jpg-150x150.jpg',
						'width'  => '150',
						'height' => '150',
					),
					'full'      => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131814-star-wars-commemorative-stamp-presentation.jpg-268x162.jpg',
						'width'  => '268',
						'height' => '162',
					),
					'large'     => array(
						'url'    => 'http://fansided.dev/wp-content/blogs.dir/229/wp-content/uploads/getty-images/2017/05/687131814-star-wars-commemorative-stamp-presentation.jpg.jpg',
						'width'  => '3500',
						'height' => '2329',
					),
				),
				'download_uri' => 'http://google.com',
				'max_width'    => '3500',
				'max_height'   => '2329',
			];
		}

		return $images;
	}


	/**
	 * Add settings link to plugin list page
	 *
	 * @param $links Current plugin links
	 *
	 * @return array Plugin menu data
	 */
	public static function add_action_links( $links ) {
		$links[] = '<a href="' . admin_url( 'options-general.php#image_crate_default_search_term' ) . '">Settings</a>';

		return $links;
	}

	/**
	 * Register and output field for setting a default search value
	 */
	public static function register_fields() {
		register_setting( 'general', 'image_crate_default_search', 'esc_attr' );

		add_settings_field(
			'image_crate_default_search_term',
			'<label for="image_crate_default_search_term">' . __( 'Image Crate Default Term', 'image_crate_default_search' ) . '</label>',
			array( get_called_class(), 'fields_html' ),
			'general'
		);
	}

	/**
	 * Output form field markup
	 */
	public static function fields_html() {
		$value = get_option( 'image_crate_default_search', '' );
		echo '<input type="text" id="image_crate_default_search_term" name="image_crate_default_search" value="' . esc_attr( $value ) . '" />';
	}
}