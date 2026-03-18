import 'package:flutter/material.dart';

import '../state/cart_state.dart';
import 'all_products_screen.dart';
import 'customer_details_screen.dart';
import 'profile_screen.dart';
import 'wallet_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final cart = CartProvider.of(context);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF101A22) : const Color(0xFFF6F7F8),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Container(
              color: isDark ? const Color(0xFF0F172A) : Colors.white,
              child: Column(
                children: [
                  _Header(
                    colorScheme: colorScheme,
                    theme: theme,
                    onClear: cart.clear,
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _CartList(
                            isDark: isDark,
                            colorScheme: colorScheme,
                            items: cart.items,
                            onIncrement: cart.increment,
                            onDecrement: cart.decrement,
                          ),
                          const SizedBox(height: 24),
                          _ImpactSummary(
                            isDark: isDark,
                            theme: theme,
                            totalBv: cart.totalBv,
                          ),
                          const SizedBox(height: 24),
                          _PricingSummary(
                            theme: theme,
                            colorScheme: colorScheme,
                            subtotal: cart.subtotal,
                            tax: cart.tax,
                            total: cart.total,
                          ),
                        ],
                      ),
                    ),
                  ),
                  _Footer(colorScheme: colorScheme, theme: theme, total: cart.total),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.colorScheme, required this.theme, required this.onClear});

  final ColorScheme colorScheme;
  final ThemeData theme;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final divider = theme.brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : const Color(0xFFE2E8F0);

    return ClipRect(
      child: Container(
        decoration: BoxDecoration(
          color: (theme.brightness == Brightness.dark
                  ? const Color(0xFF0F172A)
                  : Colors.white)
              .withValues(alpha: 0.8),
          border: Border(bottom: BorderSide(color: divider)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            _CircleIconButton(
              icon: Icons.arrow_back,
              onTap: () => Navigator.of(context).maybePop(),
              color: theme.brightness == Brightness.dark ? Colors.white : Colors.black87,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Shopping Cart',
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            TextButton(
              onPressed: onClear,
              child: Text(
                'Clear All',
                style: theme.textTheme.labelLarge?.copyWith(
                  color: const Color(0xFF2B9DEE),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CartList extends StatelessWidget {
  const _CartList({
    required this.isDark,
    required this.colorScheme,
    required this.items,
    required this.onIncrement,
    required this.onDecrement,
  });

  final bool isDark;
  final ColorScheme colorScheme;
  final List<CartItem> items;
  final void Function(String productId) onIncrement;
  final void Function(String productId) onDecrement;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Column(
          children: [
            Icon(Icons.shopping_cart_outlined, size: 48, color: colorScheme.primary),
            const SizedBox(height: 12),
            Text(
              'Your cart is empty',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 6),
            Text(
              'Add items to see them here with BV impact and totals.',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.65)),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        for (final item in items) ...[
          _CartItemCard(
            item: item,
            isDark: isDark,
            colorScheme: colorScheme,
            onIncrement: onIncrement,
            onDecrement: onDecrement,
          ),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

class _CartItemCard extends StatelessWidget {
  const _CartItemCard({
    required this.item,
    required this.isDark,
    required this.colorScheme,
    required this.onIncrement,
    required this.onDecrement,
  });

  final CartItem item;
  final bool isDark;
  final ColorScheme colorScheme;
  final void Function(String productId) onIncrement;
  final void Function(String productId) onDecrement;

  @override
  Widget build(BuildContext context) {
    final borderColor = isDark ? const Color(0xFF1F2937) : const Color(0xFFF1F5F9);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.05),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 96,
              height: 96,
              color: const Color(0xFFE2E8F0),
              child: Image.network(item.product.imageUrl, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.product.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.trending_up, size: 18, color: Color(0xFF10B981)),
                      const SizedBox(width: 6),
                      Text(
                        '${item.product.bv} BV',
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: const Color(0xFF10B981),
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${item.product.price.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: isDark ? const Color(0xFF1F2933) : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Row(
                          children: [
                            _CounterButton(
                              icon: Icons.remove,
                              filled: false,
                              colorScheme: colorScheme,
                              onTap: () => onDecrement(item.product.id),
                            ),
                            SizedBox(
                              width: 32,
                              child: Text(
                                item.quantity.toString(),
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700),
                              ),
                            ),
                            _CounterButton(
                              icon: Icons.add,
                              filled: true,
                              colorScheme: colorScheme,
                              onTap: () => onIncrement(item.product.id),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CounterButton extends StatelessWidget {
  const _CounterButton({
    required this.icon,
    required this.filled,
    required this.colorScheme,
    required this.onTap,
  });

  final IconData icon;
  final bool filled;
  final ColorScheme colorScheme;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: filled ? const Color(0xFF2B9DEE) : Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          height: 28,
          width: 28,
          child: Icon(
            icon,
            size: 16,
            color: filled ? Colors.white : Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ),
    );
  }
}

class _ImpactSummary extends StatelessWidget {
  const _ImpactSummary({required this.isDark, required this.theme, required this.totalBv});

  final bool isDark;
  final ThemeData theme;
  final int totalBv;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF2B9DEE).withValues(alpha: isDark ? 0.15 : 0.08),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF2B9DEE).withValues(alpha: 0.3)),
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: Icon(Icons.account_tree, size: 64, color: const Color(0xFF2B9DEE).withValues(alpha: 0.15)),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'NETWORK IMPACT',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: const Color(0xFF2B9DEE),
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.info_outline, size: 16, color: Color(0xFF2B9DEE)),
                ],
              ),
              const SizedBox(height: 8),
              Text.rich(
                TextSpan(
                  text: 'Total BV Impact: ',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                  children: [
                    TextSpan(
                      text: '$totalBv BV',
                      style: const TextStyle(color: Color(0xFF2B9DEE)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'This volume will be added to your weak leg upon order completion to optimize your commission payout.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  height: 1.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PricingSummary extends StatelessWidget {
  const _PricingSummary({
    required this.theme,
    required this.colorScheme,
    required this.subtotal,
    required this.tax,
    required this.total,
  });

  final ThemeData theme;
  final ColorScheme colorScheme;
  final double subtotal;
  final double tax;
  final double total;

  @override
  Widget build(BuildContext context) {
    final divider = theme.brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : const Color(0xFFF1F5F9);

    Widget row(String label, String value, {Color? valueColor, bool bold = false}) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
            ),
          ),
          Text(
            value,
            style: (bold ? theme.textTheme.titleMedium : theme.textTheme.bodyMedium)?.copyWith(
              color: valueColor ?? theme.colorScheme.onSurface,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ],
      );
    }

    String format(double value) => '\$${value.toStringAsFixed(2)}';

    return Column(
      children: [
        row('Subtotal', format(subtotal)),
        const SizedBox(height: 8),
        row('Shipping', 'Free', valueColor: const Color(0xFF10B981)),
        const SizedBox(height: 8),
        row('Tax', format(tax)),
        const SizedBox(height: 12),
        Divider(color: divider),
        const SizedBox(height: 12),
        row('Total Price', format(total), valueColor: const Color(0xFF2B9DEE), bold: true),
      ],
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.colorScheme, required this.theme, required this.total});

  final ColorScheme colorScheme;
  final ThemeData theme;
  final double total;

  @override
  Widget build(BuildContext context) {
    final divider = theme.brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : const Color(0xFFF1F5F9);
    final cart = CartProvider.of(context);
    final hasItems = cart.items.isNotEmpty;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
          color: theme.scaffoldBackgroundColor,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Payable',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '\u0000${total.toStringAsFixed(2)}'.replaceFirst('\\u0000', r'$'),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF2B9DEE),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${CartProvider.of(context).totalItems} items',
                  style: theme.textTheme.labelSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colorScheme.primary,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            border: Border(top: BorderSide(color: divider)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: hasItems
              ? ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2B9DEE),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                    shadowColor: const Color(0xFF2B9DEE).withValues(alpha: 0.3),
                  ),
                  onPressed: () => Navigator.of(context).pushNamed(CustomerDetailsScreen.routeName),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text(
                        'Proceed to Checkout',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward, size: 20, color: Colors.white),
                    ],
                  ),
                )
              : ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2B9DEE),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                  onPressed: () => Navigator.of(context).pushNamed(AllProductsScreen.routeName),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.storefront_outlined, size: 18, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Start Shopping',
                        style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ],
                  ),
                ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 6, 24, 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _NavItem(
                icon: Icons.home,
                label: 'Home',
                active: true,
                onTap: () => Navigator.of(context).pushReplacementNamed('/'),
              ),
              _NavItem(
                icon: Icons.grid_view,
                label: 'Shop',
                onTap: () => Navigator.of(context).pushNamed(AllProductsScreen.routeName),
              ),
              _NavItem(
                icon: Icons.account_balance_wallet,
                label: 'Wallet',
                onTap: () => Navigator.of(context).pushNamed(WalletScreen.routeName),
              ),
              _NavItem(
                icon: Icons.person,
                label: 'Profile',
                onTap: () => Navigator.of(context).pushNamed(ProfileScreen.routeName),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.label, this.active = false, this.onTap});

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? const Color(0xFF2B9DEE) : Colors.grey;

    final content = Column(
      children: [
        Icon(icon, color: color, fill: active ? 1.0 : 0.0),
        const SizedBox(height: 4),
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: color,
              ),
        ),
      ],
    );

    if (onTap == null) {
      return content;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: content,
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.onTap, required this.color});

  final IconData icon;
  final VoidCallback onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          height: 40,
          width: 40,
          child: Icon(icon, color: color),
        ),
      ),
    );
  }
}
