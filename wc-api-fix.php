<?php
/**
 * Plugin Name: WooCommerce API Fix for InfinityFree
 * Description: Enables WooCommerce REST API authentication on InfinityFree
 * Version: 1.0
 * Author: Custom
 */

add_filter('rest_authentication_errors', function($result) {
    // Si ya hay un error de autenticación, no hacer nada
    if (is_wp_error($result)) {
        return $result;
    }

    // Obtener headers de autorización
    $auth = isset($_SERVER['HTTP_AUTHORIZATION'])
        ? $_SERVER['HTTP_AUTHORIZATION']
        : (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])
            ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            : null);

    // Si no hay autorización, intentar con PHP_AUTH
    if (!$auth && isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
        $auth = 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . $_SERVER['PHP_AUTH_PW']);
    }

    if ($auth) {
        $_SERVER['HTTP_AUTHORIZATION'] = $auth;
    }

    return $result;
}, 10);