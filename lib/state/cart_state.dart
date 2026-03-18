import 'dart:collection';

import 'package:flutter/widgets.dart';

import '../models/product.dart';

class CartItem {
  CartItem({required this.product, this.quantity = 1}) : assert(quantity > 0);

  final Product product;
  int quantity;

  double get totalPrice => product.price * quantity;
  int get totalBv => product.bv * quantity;
}

class CartState extends ChangeNotifier {
  static const double _taxRate = 0.08; // 8% tax

  final Map<String, CartItem> _items = {};

  UnmodifiableListView<CartItem> get items => UnmodifiableListView(_items.values);
  bool get isEmpty => _items.isEmpty;
  int get totalItems => _items.values.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => _items.values.fold(0, (sum, item) => sum + item.totalPrice);
  double get tax => subtotal * _taxRate;
  double get total => subtotal + tax;
  double get taxRate => _taxRate;
  int get totalBv => _items.values.fold(0, (sum, item) => sum + item.totalBv);

  void addProduct(Product product) {
    final existing = _items[product.id];
    if (existing != null) {
      existing.quantity += 1;
    } else {
      _items[product.id] = CartItem(product: product);
    }
    notifyListeners();
  }

  void increment(String productId) {
    final item = _items[productId];
    if (item == null) return;
    item.quantity += 1;
    notifyListeners();
  }

  void decrement(String productId) {
    final item = _items[productId];
    if (item == null) return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
      _items.remove(productId);
    }
    notifyListeners();
  }

  void clear() {
    if (_items.isEmpty) return;
    _items.clear();
    notifyListeners();
  }
}

class CartProvider extends InheritedNotifier<CartState> {
  const CartProvider({super.key, required CartState notifier, required super.child})
      : super(notifier: notifier);

  static CartState of(BuildContext context, {bool listen = true}) {
    if (listen) {
      final provider = context.dependOnInheritedWidgetOfExactType<CartProvider>();
      assert(provider != null, 'No CartProvider found in context');
      return provider!.notifier!;
    }
    final element = context.getElementForInheritedWidgetOfExactType<CartProvider>();
    assert(element != null, 'No CartProvider found in context');
    final provider = element!.widget as CartProvider;
    return provider.notifier!;
  }
}
