import 'dart:collection';

import 'package:flutter/widgets.dart';

import '../models/product.dart';

class WishlistState extends ChangeNotifier {
  final Map<String, Product> _items = {};

  UnmodifiableListView<Product> get items => UnmodifiableListView(_items.values.toList());
  bool get isEmpty => _items.isEmpty;

  bool contains(String productId) => _items.containsKey(productId);

  void add(Product product) {
    if (_items.containsKey(product.id)) return;
    _items[product.id] = product;
    notifyListeners();
  }

  void remove(String productId) {
    if (_items.remove(productId) != null) {
      notifyListeners();
    }
  }

  void toggle(Product product) {
    if (contains(product.id)) {
      _items.remove(product.id);
    } else {
      _items[product.id] = product;
    }
    notifyListeners();
  }

  void clear() {
    if (_items.isEmpty) return;
    _items.clear();
    notifyListeners();
  }
}

class WishlistProvider extends InheritedNotifier<WishlistState> {
  const WishlistProvider({super.key, required WishlistState notifier, required super.child})
      : super(notifier: notifier);

  static WishlistState of(BuildContext context, {bool listen = true}) {
    if (listen) {
      final provider = context.dependOnInheritedWidgetOfExactType<WishlistProvider>();
      assert(provider != null, 'No WishlistProvider found in context');
      return provider!.notifier!;
    }
    final element = context.getElementForInheritedWidgetOfExactType<WishlistProvider>();
    assert(element != null, 'No WishlistProvider found in context');
    final provider = element!.widget as WishlistProvider;
    return provider.notifier!;
  }
}
