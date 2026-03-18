import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:pusher_client/pusher_client.dart';

import '../models/product_entry.dart';
import '../services/api_client.dart';

const _productEventNames = <String>{
  'products.created',
  'products.updated',
  'products.deleted',
  'products.stock_adjusted',
};

class ProductCatalogState extends ChangeNotifier {
  ProductCatalogState() {
    _init();
  }

  final ApiClient _apiClient = ApiClient.instance;
  PusherClient? _pusher;
  Channel? _channel;
  List<ProductCatalogEntry> _entries = const [];
  bool _isLoading = false;
  String? _error;
  Timer? _refreshDebounce;
  bool _initialized = false;
  bool _realtimeReady = false;

  List<ProductCatalogEntry> get entries => _entries;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> _init() async {
    if (_initialized) return;
    _initialized = true;
    await refresh();
    _setupRealtime();
  }

  Future<void> refresh() async {
    _isLoading = true;
    notifyListeners();
    try {
      final remoteEntries = await _apiClient.fetchPublicProducts(limit: 100);
      _entries = remoteEntries;
      _error = null;
    } catch (error, stack) {
      _error = error.toString();
      debugPrint('Failed to refresh product catalog: $error');
      debugPrintStack(stackTrace: stack);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _setupRealtime() async {
    if (_realtimeReady) return;
    try {
      if (kIsWeb) {
        debugPrint('Realtime disabled on Flutter web (pusher_client not supported).');
        return;
      }
      final appKey = dotenv.env['REVERB_APP_KEY'];
      if (appKey == null || appKey.isEmpty) {
        debugPrint('REVERB_APP_KEY missing; realtime disabled.');
        return;
      }

      final host = dotenv.env['REVERB_HOST'] ?? '127.0.0.1';
      final port = int.tryParse(dotenv.env['REVERB_PORT'] ?? '80') ?? 80;
      final scheme = dotenv.env['REVERB_SCHEME'] ?? 'http';
      final encrypted = scheme == 'https';
      final options = PusherOptions(
        host: host,
        wsPort: port,
        wssPort: port,
        encrypted: encrypted,
        cluster: 'mt1',
      );

      final pusher = PusherClient(
        appKey,
        options,
        autoConnect: false,
        enableLogging: false,
      );

      pusher.onConnectionStateChange((state) {
        debugPrint('Pusher state: ${state?.currentState}');
      });

      pusher.onConnectionError((error) {
        debugPrint('Pusher connection error: $error');
      });

      pusher.connect();

      final channel = pusher.subscribe('members.products');
      for (final eventName in _productEventNames) {
        channel.bind(eventName, _handlePusherEvent);
      }

      _pusher = pusher;
      _channel = channel;
      _realtimeReady = true;
    } catch (error, stack) {
      debugPrint('Failed to initialize realtime updates: $error');
      debugPrintStack(stackTrace: stack);
    }
  }

  void _handlePusherEvent(PusherEvent? event) {
    final name = event?.eventName ?? '';
    if (name.startsWith('products.')) {
      _debouncedRefresh();
    }
  }

  void _debouncedRefresh() {
    _refreshDebounce?.cancel();
    _refreshDebounce = Timer(const Duration(milliseconds: 600), () {
      refresh();
    });
  }

  @override
  void dispose() {
    _refreshDebounce?.cancel();
    if (_realtimeReady) {
      for (final eventName in _productEventNames) {
        _channel?.unbind(eventName);
      }
      _pusher?.unsubscribe('members.products');
      _pusher?.disconnect();
    }
    super.dispose();
  }
}

class ProductCatalogProvider extends InheritedNotifier<ProductCatalogState> {
  const ProductCatalogProvider({super.key, required ProductCatalogState super.notifier, required super.child});

  static ProductCatalogState of(BuildContext context, {bool listen = true}) {
    if (listen) {
      final provider = context.dependOnInheritedWidgetOfExactType<ProductCatalogProvider>();
      assert(provider != null, 'No ProductCatalogProvider found in context');
      return provider!.notifier!;
    }
    final element = context.getElementForInheritedWidgetOfExactType<ProductCatalogProvider>();
    assert(element != null, 'No ProductCatalogProvider found in context');
    final provider = element!.widget as ProductCatalogProvider;
    return provider.notifier!;
  }
}
