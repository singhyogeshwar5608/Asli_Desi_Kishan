import 'package:flutter/material.dart';
import '../screens/withdraw_screen.dart';
import '../theme/app_theme.dart';
import '../screens/all_products_screen.dart';
import '../screens/wallet_screen.dart';
import '../screens/menu_screen.dart';

class BottomNavBar extends StatelessWidget {
  const BottomNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BottomAppBar(
      height: 76,
      color: theme.colorScheme.surface,
      surfaceTintColor: Colors.transparent,
      shape: const CircularNotchedRectangle(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      notchMargin: 8,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const _NavItem(icon: Icons.home, label: 'Home', active: true),
          _NavItem(
            icon: Icons.inventory_2,
            label: 'Products',
            onTap: () =>
                Navigator.of(context).pushNamed(AllProductsScreen.routeName),
          ),
          const SizedBox(width: 56),
          _NavItem(
            icon: Icons.account_balance_wallet,
            label: 'Wallet',
            onTap: () => Navigator.of(context).pushNamed(WalletScreen.routeName),
          ),
          _NavItem(
            icon: Icons.menu,
            label: 'Menu',
            onTap: () => Navigator.of(context).pushNamed(MenuScreen.routeName),
          ),
        ],
      ),
    );
  }
}

class BottomActionButton extends StatelessWidget {
  const BottomActionButton({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isCompact = width < 500;
    final dimension = isCompact ? 56.0 : 70.0;

   return SizedBox.square(
  dimension: dimension,
  child: FloatingActionButton(
    shape: const CircleBorder(),
    backgroundColor: AppColors.primary,
    elevation: 8,
    mini: isCompact,
    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    onPressed: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const WithdrawScreen(),
        ),
      );
    },
    child: Icon(
      Icons.payments,
      size: isCompact ? 22 : 28,
      color: Colors.white,
    ),
  ),
);
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    this.active = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = active
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurface.withValues(alpha: 0.5);

    final content = Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            fontWeight: active ? FontWeight.w700 : FontWeight.w600,
            color: color,
            letterSpacing: active ? 0.5 : 0.2,
          ),
        ),
      ],
    );

    if (onTap == null) {
      return content;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: content,
      ),
    );
  }
}
