import 'package:flutter/material.dart';

import 'add_funds_screen.dart';
import 'all_products_screen.dart';
import 'profile_screen.dart';
import 'transactions_screen.dart';
import 'withdraw_screen.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  static const routeName = '/wallet';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final background = isDark ? const Color(0xFF101A22) : const Color(0xFFF6F7F8);

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: const _WalletFooter(),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = constraints.maxWidth >= 1024
                ? 72.0
                : constraints.maxWidth >= 768
                    ? 56.0
                    : constraints.maxWidth >= 540
                        ? 32.0
                        : 16.0;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _WalletHeader(),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                    child: const _WalletBody(),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _WalletFooter extends StatelessWidget {
  const _WalletFooter();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(top: BorderSide(color: theme.dividerColor.withValues(alpha: 0.6))),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _FooterNavItem(
              icon: Icons.home_filled,
              label: 'Home',
              onTap: () => Navigator.of(context).pushReplacementNamed('/'),
            ),
            _FooterNavItem(
              icon: Icons.grid_view,
              label: 'Shop',
              onTap: () => Navigator.of(context).pushNamed(AllProductsScreen.routeName),
            ),
            _FooterNavItem(
              icon: Icons.shopping_bag_outlined,
              label: 'Cart',
              onTap: () => Navigator.of(context).pushNamed('/cart'),
            ),
            _FooterNavItem(
              icon: Icons.person_outline,
              label: 'Profile',
              onTap: () => Navigator.of(context).pushNamed(ProfileScreen.routeName),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterNavItem extends StatelessWidget {
  const _FooterNavItem({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: theme.colorScheme.onSurface),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WalletHeader extends StatelessWidget {
  const _WalletHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(bottom: BorderSide(color: border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _CircleIconButton(icon: Icons.arrow_back, onTap: () => Navigator.of(context).maybePop()),
          Expanded(
            child: Text(
              'Wallet',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(width: 40),
        ],
      ),
    );
  }
}

class _WalletBody extends StatelessWidget {
  const _WalletBody();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          _WalletHeroCard(),
          SizedBox(height: 20),
          _WalletStatsRow(),
          SizedBox(height: 20),
          _WalletActionsRow(),
          SizedBox(height: 24),
          _TransactionSection(),
        ],
      ),
    );
  }
}

class _WalletHeroCard extends StatelessWidget {
  const _WalletHeroCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2B9DEE), Color(0xFF1A85D1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B9DEE).withValues(alpha: 0.25),
            blurRadius: 32,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Available Balance',
            style: theme.textTheme.labelSmall?.copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '₹3,210.40',
            style: theme.textTheme.displaySmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final isTight = constraints.maxWidth < 360;
              final chips = const [
                _WalletMetaChip(icon: Icons.timeline, label: '+12.5% this month'),
                _WalletMetaChip(icon: Icons.lock_clock, label: 'Next payout in 4 days'),
              ];

              if (isTight) {
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: chips,
                );
              }

              return Row(
                children: const [
                  _WalletMetaChip(icon: Icons.timeline, label: '+12.5% this month'),
                  SizedBox(width: 12),
                  _WalletMetaChip(icon: Icons.lock_clock, label: 'Next payout in 4 days'),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _WalletMetaChip extends StatelessWidget {
  const _WalletMetaChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _WalletStatsRow extends StatelessWidget {
  const _WalletStatsRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 412) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: const [
              _WalletStatTile(
                title: 'Total Earnings',
                amount: '₹12,450',
                subtitle: '+4.8% vs last month',
              ),
              SizedBox(height: 12),
              _WalletStatTile(
                title: 'Withdrawals',
                amount: '₹8,200',
                subtitle: '3 pending cash-outs',
              ),
            ],
          );
        }
        return Row(
          children: const [
            Expanded(
              child: _WalletStatTile(
                title: 'Total Earnings',
                amount: '₹12,450',
                subtitle: '+4.8% vs last month',
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: _WalletStatTile(
                title: 'Withdrawals',
                amount: '₹8,200',
                subtitle: '3 pending cash-outs',
              ),
            ),
          ],
        );
      },
    );
  }
}

class _WalletStatTile extends StatelessWidget {
  const _WalletStatTile({required this.title, required this.amount, required this.subtitle});

  final String title;
  final String amount;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1F2937) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            amount,
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _WalletActionsRow extends StatelessWidget {
  const _WalletActionsRow();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Expanded(
          child: _WalletActionButton(
            icon: Icons.download_rounded,
            label: 'Add Funds',
            background: theme.colorScheme.primary.withValues(alpha: 0.1),
            iconColor: theme.colorScheme.primary,
            onTap: () => Navigator.of(context).pushNamed(AddFundsScreen.routeName),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _WalletActionButton(
            icon: Icons.upload_rounded,
            label: 'Withdraw',
            background: const Color(0xFFFEE2E2),
            iconColor: const Color(0xFFDC2626),
            onTap: () => Navigator.of(context).pushNamed(WithdrawScreen.routeName),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _WalletActionButton(
            icon: Icons.history,
            label: 'History',
            background: const Color(0xFFE0E7FF),
            iconColor: const Color(0xFF6366F1),
            onTap: () => Navigator.of(context).pushNamed(TransactionsScreen.routeName),
          ),
        ),
      ],
    );
  }
}

class _WalletActionButton extends StatelessWidget {
  const _WalletActionButton({
    required this.icon,
    required this.label,
    required this.background,
    required this.iconColor,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final Color background;
  final Color iconColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final card = Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: theme.brightness == Brightness.dark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );

    if (onTap == null) return card;
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: card,
    );
  }
}

class _TransactionSection extends StatelessWidget {
  const _TransactionSection();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const transactions = [
      _TransactionItemData(
        title: 'Binary Bonus Payout',
        subtitle: 'Today, 08:45 AM',
        amount: '+₹420.00',
        icon: Icons.trending_up,
        color: Color(0xFF22C55E),
      ),
      _TransactionItemData(
        title: 'Withdrawal - Bank Transfer',
        subtitle: 'Yesterday, 05:10 PM',
        amount: '-₹300.00',
        icon: Icons.south_west,
        color: Color(0xFFF97316),
      ),
      _TransactionItemData(
        title: 'Level Upgrade Bonus',
        subtitle: 'Feb 20, 11:32 AM',
        amount: '+₹250.00',
        icon: Icons.workspace_premium,
        color: Color(0xFF8B5CF6),
      ),
      _TransactionItemData(
        title: 'Withdrawal Processing',
        subtitle: 'Feb 18, 04:12 PM',
        amount: '-₹180.00',
        icon: Icons.hourglass_top,
        color: Color(0xFF0EA5E9),
      ),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Recent Activity',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              InkWell(
                onTap: () => Navigator.of(context).pushNamed(TransactionsScreen.routeName),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  child: Text(
                    'View All',
                    style: theme.textTheme.labelMedium?.copyWith(color: theme.colorScheme.primary, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          for (final transaction in transactions) ...[
            _TransactionItem(data: transaction),
            if (transaction != transactions.last)
              Divider(color: theme.colorScheme.onSurface.withValues(alpha: 0.08)),
          ],
        ],
      ),
    );
  }
}

class _TransactionItemData {
  const _TransactionItemData({
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.icon,
    required this.color,
  });

  final String title;
  final String subtitle;
  final String amount;
  final IconData icon;
  final Color color;
}

class _TransactionItem extends StatelessWidget {
  const _TransactionItem({required this.data});

  final _TransactionItemData data;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isPositive = data.amount.startsWith('+');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: data.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(data.icon, color: data.color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  data.subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          Text(
            data.amount,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: isPositive ? const Color(0xFF10B981) : const Color(0xFFF97316),
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Material(
      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(icon, color: theme.colorScheme.onSurface.withValues(alpha: 0.7)),
        ),
      ),
    );
  }
}
