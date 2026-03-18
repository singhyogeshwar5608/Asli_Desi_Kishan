import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../models/product_entry.dart';

class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();

  final http.Client _httpClient = http.Client();
  String? _accessToken;

  String get _baseUrl {
    final url = dotenv.env['API_BASE_URL'] ?? 'http://127.0.0.1:8000/api/v1';
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  String get baseServerUrl {
    final apiUrl = _baseUrl;
    final match = RegExp(r'^(.*?)/api/v1$').firstMatch(apiUrl);
    return match?.group(1) ?? apiUrl;
  }

  String? get accessToken => _accessToken;

  String get _loginEmail => dotenv.env['API_MEMBER_EMAIL'] ?? 'admin@mlm.com';
  String get _loginPassword => dotenv.env['API_MEMBER_PASSWORD'] ?? 'Admin@123';

  Future<void> ensureAuthenticated() async {
    if (_accessToken != null) return;
    await _login();
  }

  Future<List<ProductCatalogEntry>> fetchProductEntries({int limit = 200, int page = 1}) async {
    await ensureAuthenticated();
    final uri = _buildUri('products', {'limit': '$limit', 'page': '$page'});
    final response = await _httpClient.get(uri, headers: _authorizedHeaders());
    return _parseProductList(response, context: 'Fetch products');
  }

  Future<List<ProductCatalogEntry>> fetchPublicProducts({int limit = 100, int page = 1}) async {
    final uri = _buildUri('products/public', {'limit': '$limit', 'page': '$page'});
    final response = await _httpClient.get(uri, headers: const {'Content-Type': 'application/json'});
    return _parseProductList(response, context: 'Fetch public products');
  }

  Map<String, String> _authorizedHeaders() {
    final token = _accessToken;
    if (token == null || token.isEmpty) {
      throw StateError('Not authenticated');
    }
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  Uri _buildUri(String pathSegment, [Map<String, String>? query]) {
    final uri = Uri.parse('$_baseUrl/$pathSegment');
    return uri.replace(queryParameters: query);
  }

  List<ProductCatalogEntry> _parseProductList(http.Response response, {required String context}) {
    _throwIfNeeded(response, context: context);

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final data = decoded['data'] as List<dynamic>? ?? const [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(ProductCatalogEntry.fromJson)
        .toList(growable: false);
  }

  Future<void> _login() async {
    final uri = _buildUri('auth/login');
    final response = await _httpClient.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'email': _loginEmail, 'password': _loginPassword}),
    );

    _throwIfNeeded(response, context: 'Login');

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    _accessToken = decoded['accessToken'] as String?;

    if (_accessToken == null) {
      throw Exception('Login succeeded but token missing');
    }
  }

  Future<void> loginWithCredentials(String email, String password) async {
    final uri = _buildUri('auth/login');
    final response = await _httpClient.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim().toLowerCase(),
        'password': password,
      }),
    );

    _throwIfNeeded(response, context: 'Login');

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final token = decoded['accessToken'] as String?;
    if (token == null || token.isEmpty) {
      throw Exception('Login response missing access token');
    }
    _accessToken = token;
  }

  Future<Map<String, dynamic>> fetchCurrentMember({bool autoAuthenticate = true}) async {
    if (_accessToken == null) {
      if (!autoAuthenticate) {
        throw StateError('Not authenticated');
      }
      await ensureAuthenticated();
    }

    final uri = _buildUri('auth/me');
    final response = await _httpClient.get(uri, headers: _authorizedHeaders());
    _throwIfNeeded(response, context: 'Fetch current user');

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final member = decoded['member'];
    if (member is Map<String, dynamic>) {
      return member;
    }
    throw Exception('Malformed user payload: missing member');
  }

  void _throwIfNeeded(http.Response response, {required String context}) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return;
    }
    if (response.statusCode == 401) {
      _accessToken = null;
    }
    throw Exception('$context failed (${response.statusCode}): ${response.body}');
  }

  @mustCallSuper
  void dispose() {
    _httpClient.close();
  }
}
