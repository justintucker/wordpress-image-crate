<?php
/**
 * Image_Crate_Import Class
 *
 * @version  0.1.1
 * @package  WP_Image_Crate
 * @author   justintucker
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Image_Crate_Import {

	/**
	 * Import image from an url
	 *
	 * @param $service_image_id
	 * @param $filename
	 *
	 * @return bool|int|object
	 */
	public function image( $service_image_id, $filename ) {

		$file_array = [];

		$post_name = strtolower( $filename );
		$id_exists = $this->check_attachment( $post_name );

		// filename will determine if download will occur
		if ( 0 > $id_exists  ) {
		    return $id_exists;
		}

		$file_array['tmp_name'] = $this->download( $service_image_id );

		if ( ! $file_array['tmp_name'] ) {
			return false;
		}

		preg_match( '/[^\?]+\.(jpe?g|jpe|gif|png)\b/i', $file_array['tmp_name'], $matches );

		if ( ! $matches ) {
			unlink( $file_array['tmp_name'] );
			return false;
		}

		$file_array['name'] = basename( $matches[0] );

		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		$api_image   = $file_array['name'];

		$image_type = pathinfo( $api_image );
		$file_name  = basename( $api_image, '.' . $image_type['extension'] );
		$post_name = sprintf( '%s-%s', $service_image_id, $post_name );
		$file_array['name'] = str_replace( $file_name, $post_name, $api_image );

		// Do the validation and storage stuff
		$id = media_handle_sideload( $file_array, 0 );

		$this->delete_file( $file_array['tmp_name'] );

		return is_wp_error( $id ) ? false : $id;

	}

	/**
	 * Download a file by its URL
	 *
	 * @param  string $id
	 *
	 * @return bool|string
	 */
	private function download( $id ) {

		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		$baseUrl              = 'http://api.usatodaysportsimages.com/api/download/';
		$consumerKey          = USAT_API_KEY;
		$consumerSecret       = USAT_API_SECRET;
		$oauthTimestamp       = time();
		$nonce                = md5( mt_rand() );
		$oauthSignatureMethod = "HMAC-SHA1";
		$oauthVersion         = "1.0";

		//generate signature
		$sigBase = "GET&" . rawurlencode( $baseUrl ) . "&"
		           . rawurlencode( "imageID=" . $id
		           . "&oauth_consumer_key=" . rawurlencode( $consumerKey )
                   . "&oauth_nonce=" . rawurlencode( $nonce )
                   . "&oauth_signature_method=" . rawurlencode( $oauthSignatureMethod )
                   . "&oauth_timestamp=" . $oauthTimestamp
                   . "&oauth_version=" . $oauthVersion
                    );

		$sigKey   = $consumerSecret . "&";
		$oauthSig = base64_encode( hash_hmac( "sha1", $sigBase, $sigKey, true ) );

		//generate full request URL
		$requestUrl = $baseUrl . "?"
		              . "imageID=" . $id
		              . "&oauth_consumer_key=" . rawurlencode( $consumerKey )
		              . "&oauth_nonce=" . rawurlencode( $nonce )
		              . "&oauth_signature_method=" . rawurlencode( $oauthSignatureMethod )
		              . "&oauth_timestamp=" . rawurlencode( $oauthTimestamp )
		              . "&oauth_version=" . rawurlencode( $oauthVersion )
		              . "&oauth_signature=" . rawurlencode( $oauthSig );

		$file = download_url( $requestUrl );

		if ( is_wp_error( $file ) ) {
			return false;
		}

		// Added functionality to deal with image without extension
		$tmp_ext = pathinfo( $file, PATHINFO_EXTENSION );

		// Get the real image extension
		$file_ext = image_type_to_extension( exif_imagetype( $file ) );

		// Replace extension of basename file
		$new_file = basename( $file, ".$tmp_ext" ) . $file_ext;

		// Replace old file with new file in complete path location
		$new_file = str_replace( basename( $file ), $new_file, $file );

		// Rename from .tpm to actual file format
		rename( $file, $new_file );

		$file = $new_file;

		return $file;

	}

	/**
	 * Delete a file
	 *
	 * @param  string $filepath
	 *
	 * @return bool
	 */
	private function delete_file( $filepath ) {

		return is_readable( $filepath ) ? @unlink( $filepath ) : false;

	}

	/**
	 * Check if attachment exists
	 *
	 * @param        $post_name
	 * @param string $call_type
	 *
	 * @return int Post attachment id
	 */
	public function check_attachment( $post_name, $call_type = 'remote' ) {

		// Switch to another blog to check post existence.
		if ( $call_type == 'remote' && is_multisite() ) {
			//$site = get_current_site();
			//$site_id = $site->id;
			// todo: hard coded number for testing, remove for production
			$site_id = '229';
			switch_to_blog( $site_id );
		}

		global $wpdb;
		$attachment_id = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_name='%s';", $post_name ) );

		if ( ! empty( $attachment_id ) ) {
			$attachment_id = $attachment_id[0];
		}

		if ( $call_type == 'remote' && is_multisite() ) {
			restore_current_blog();
		}

		return $attachment_id;
	}
}