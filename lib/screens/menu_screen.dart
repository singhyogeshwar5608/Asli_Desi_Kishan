import 'package:flutter/material.dart';

import '../screens/all_products_screen.dart';
import '../screens/notifications_screen.dart';
import '../screens/wishlist_screen.dart';
import '../theme/app_theme.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  static const routeName = '/menu';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final items = _menuItems(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: AppBar(
        title: const Text('Quick Menu', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        itemBuilder: (context, index) => _MenuCard(item: items[index]),
        separatorBuilder: (_, __) => const SizedBox(height: 14),
        itemCount: items.length,
      ),
    );
  }

  List<_MenuItem> _menuItems(BuildContext context) => [
        _MenuItem(
          title: 'Media Gallery',
          subtitle: 'Upload & manage event visuals',
          icon: Icons.collections_bookmark,
          color: AppColors.primary,
          onTap: () => _showSoon(context),
        ),
        _MenuItem(
          title: 'Product Catalogue',
          subtitle: 'Browse every product line',
          icon: Icons.inventory_2,
          color: const Color(0xFF6366F1),
          onTap: () => Navigator.of(context).pushNamed(AllProductsScreen.routeName),
        ),
        _MenuItem(
          title: 'Contact Us',
          subtitle: 'Reach support & success team',
          icon: Icons.support_agent,
          color: const Color(0xFF0EA5E9),
          onTap: () => _showSoon(context),
        ),
        _MenuItem(
          title: 'APC Events',
          subtitle: 'Upcoming meetups & webinars',
          icon: Icons.event_available,
          color: const Color(0xFFF97316),
          onTap: () => _showSoon(context),
        ),
        _MenuItem(
          title: 'Delivery Center',
          subtitle: 'Track and manage shipments',
          icon: Icons.local_shipping,
          color: const Color(0xFF10B981),
          onTap: () => _showSoon(context),
        ),
        _MenuItem(
          title: 'Wishlist',
          subtitle: 'Saved products & bundles',
          icon: Icons.favorite_border,
          color: const Color(0xFFE11D48),
          onTap: () => Navigator.of(context).pushNamed(WishlistScreen.routeName),
        ),
        _MenuItem(
          title: 'Notifications',
          subtitle: 'Latest updates & alerts',
          icon: Icons.notifications_active_outlined,
          color: const Color(0xFF14B8A6),
          onTap: () => Navigator.of(context).pushNamed(NotificationsScreen.routeName),
        ),
      ];

  void _showSoon(BuildContext context) {
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        const SnackBar(content: Text('Feature coming soon'), duration: Duration(seconds: 2)),
      );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.item});

  final _MenuItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: item.onTap,
      borderRadius: BorderRadius.circular(18),
      splashColor: item.color.withOpacity(0.15),
      child: Ink(
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: theme.dividerColor.withOpacity(isDark ? 0.3 : 0.5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.35 : 0.08),
              blurRadius: 20,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: item.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(item.icon, color: item.color, size: 26),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: theme.hintColor),
          ],
        ),
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
}
