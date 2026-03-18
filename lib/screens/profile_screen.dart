import 'dart:io';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../theme/app_theme.dart';
import '../state/profile_state.dart';
import 'all_products_screen.dart';
import 'binary_tree_screen.dart';
import 'wallet_screen.dart';
import 'withdraw_screen.dart';
import 'transactions_screen.dart';
import 'profile_edit_screen.dart';
import 'my_team_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static const routeName = '/profile';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final background = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final sidePadding = _responsiveSidePadding(constraints.maxWidth);
            final contentWidth = (constraints.maxWidth - (sidePadding * 2)).clamp(320.0, constraints.maxWidth);
            const verticalGap = 4.0;
            const heroToSummaryGap = 2.0;

            return SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(sidePadding, 12, sidePadding, 18 + verticalGap),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _ProfileHeroSection(availableWidth: contentWidth),
                  SizedBox(height: heroToSummaryGap.toDouble()),
                  const _MlmSummarySection(),
                  SizedBox(height: verticalGap),
                  const _SupportCard(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

ImageProvider _buildImageProvider(String path) {
  if (path.startsWith('http')) {
    return NetworkImage(path);
  }
  return FileImage(File(path));
}

class _MlmSummarySection extends StatelessWidget {
  const _MlmSummarySection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: const [
        _MlmIncomeCard(),
        SizedBox(height: 24),
        _MlmSecondaryWallets(),
        SizedBox(height: 24),
        _MlmIncomeBreakdown(),
        SizedBox(height: 24),
        _MlmBusinessVolumeCard(),
        SizedBox(height: 24),
        _MlmQuickActionsGrid(),
      ],
    );
  }
}

class _MlmIncomeCard extends StatelessWidget {
  const _MlmIncomeCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    final borderColor = _cardBorderColor(context);
    final profile = ProfileProvider.of(context).data;
    final incomeText = _formatCurrency(profile.totalIncome);
    final goalText = _formatCurrency(profile.incomeGoal);
    final progress = profile.incomeGoal <= 0 ? 0.0 : (profile.totalIncome / profile.incomeGoal).clamp(0.0, 1.0);
    final growth = profile.monthlyGrowthPercent;
    final growthPrefix = growth >= 0 ? '+' : '';
    final enlargedIncomeStyle = theme.textTheme.displaySmall?.copyWith(
      fontSize: (theme.textTheme.displaySmall?.fontSize ?? 36) + 4,
      fontWeight: FontWeight.w800,
      letterSpacing: -1,
    );

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: borderColor),
        boxShadow: _softShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _SectionPill(label: 'Total lifetime income', color: AppColors.primary.withValues(alpha: 0.12)),
              const Spacer(),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.check_circle, color: AppColors.primary, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'verified',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            incomeText,
            style: enlargedIncomeStyle,
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.trending_up, color: AppColors.primary),
              const SizedBox(width: 6),
              Text(
                '$growthPrefix${_formatPercent(growth)}% vs last month',
                style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: progress,
              backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.15),
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Goal: $goalText', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
              Text('${(progress * 100).toStringAsFixed(0)}% complete', style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w700)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionPill extends StatelessWidget {
  const _SectionPill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700, letterSpacing: 1),
      ),
    );
  }
}

class _MlmSecondaryWallets extends StatelessWidget {
  const _MlmSecondaryWallets();

  @override
  Widget build(BuildContext context) {
    return _MlmResponsiveTwoColumn(
      children: const [
        _MlmInfoTile(
          label: 'Available balance',
          value: '\u20B93,210.40',
          valueColor: Color(0xFF2B9DEE),
        ),
        _MlmMatchingPairsTile(),
      ],
    );
  }
}

class _MlmInfoTile extends StatelessWidget {
  const _MlmInfoTile({required this.label, required this.value, this.valueColor});

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _cardBorderColor(context)),
        boxShadow: _softShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700, color: valueColor ?? theme.colorScheme.onSurface),
          ),
        ],
      ),
    );
  }
}

class _MlmMatchingPairsTile extends StatelessWidget {
  const _MlmMatchingPairsTile();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _cardBorderColor(context)),
        boxShadow: _softShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Matching pairs', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('124', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0x10078838), borderRadius: BorderRadius.circular(999)),
                child: Text('+12', style: theme.textTheme.labelSmall?.copyWith(color: const Color(0xFF078838), fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MlmIncomeBreakdown extends StatelessWidget {
  const _MlmIncomeBreakdown();

  @override
  Widget build(BuildContext context) {
    return _MlmResponsiveTwoColumn(
      children: const [
        _MlmIncomeStatTile(
          icon: Icons.person_add,
          iconColor: Color(0xFF2B9DEE),
          label: 'Direct income',
          amount: '\u20B94,500',
        ),
        _MlmIncomeStatTile(
          icon: Icons.account_tree,
          iconColor: Color(0xFF078838),
          label: 'Matching income',
          amount: '\u20B97,950',
        ),
      ],
    );
  }
}

class _MlmIncomeStatTile extends StatelessWidget {
  const _MlmIncomeStatTile({required this.icon, required this.iconColor, required this.label, required this.amount});

  final IconData icon;
  final Color iconColor;
  final String label;
  final String amount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _cardBorderColor(context)),
        boxShadow: _softShadow(context),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: iconColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: theme.textTheme.labelMedium?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.65))),
                const SizedBox(height: 4),
                Text(amount, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MlmBusinessVolumeCard extends StatelessWidget {
  const _MlmBusinessVolumeCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    final borderColor = _cardBorderColor(context);

    const double leftLegTotal = 45000;
    const double rightLegTotal = 32500;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Business Volume (BV) Status', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: borderColor),
            boxShadow: _softShadow(context),
          ),
          child: Column(
            children: const [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _MlmLegStat(label: 'Left Leg', value: '45,000'),
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: _MlmBalanceBar(
                        leftValue: leftLegTotal,
                        rightValue: rightLegTotal,
                      ),
                    ),
                  ),
                  _MlmLegStat(label: 'Right Leg', value: '32,500'),
                ],
              ),
              SizedBox(height: 16),
              _MlmBusinessVolumeFooter(),
            ],
          ),
        ),
      ],
    );
  }
}

class _MlmLegStat extends StatelessWidget {
  const _MlmLegStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            fontWeight: FontWeight.w700,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        Text(value, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
      ],
    );
  }
}

class _MlmBalanceBar extends StatelessWidget {
  const _MlmBalanceBar({required this.leftValue, required this.rightValue});

  final double leftValue;
  final double rightValue;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final total = (leftValue + rightValue).clamp(0.001, double.infinity);
    final leftRatio = leftValue / total;
    final borderColor = isDark ? Colors.white.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.08);
    final trackColor = isDark ? Colors.white.withValues(alpha: 0.15) : Colors.white;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: borderColor),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(999),
        child: SizedBox(
          height: 6,
          child: Stack(
            children: [
              ColoredBox(color: trackColor),
              FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: leftRatio,
                child: const ColoredBox(color: Color(0xFF2B9DEE)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MlmBusinessVolumeFooter extends StatelessWidget {
  const _MlmBusinessVolumeFooter();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final divider = theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    return Column(
      children: [
        Divider(color: divider.withValues(alpha: 0.6)),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Balance Status',
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            Row(
              children: [
                Text(
                  'Strong Left Leg',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(width: 6),
                Icon(Icons.info_outline, size: 16, color: theme.colorScheme.primary),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _MlmQuickActionsGrid extends StatelessWidget {
  const _MlmQuickActionsGrid();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final actions = [
      _MlmQuickActionData(
        icon: Icons.group,
        label: 'My Team',
        background: const Color(0xFFE0F2FF),
        iconColor: const Color(0xFF2B9DEE),
        onTap: () => Navigator.of(context).pushNamed(MyTeamScreen.routeName),
      ),
      _MlmQuickActionData(
        icon: Icons.account_tree,
        label: 'Binary Tree',
        background: const Color(0xFFE0E7FF),
        iconColor: const Color(0xFF6366F1),
        onTap: () => Navigator.of(context).pushNamed(BinaryTreeScreen.routeName),
      ),
      _MlmQuickActionData(
        icon: Icons.account_balance_wallet,
        label: 'Wallet',
        background: const Color(0xFFDCFCE7),
        iconColor: const Color(0xFF059669),
        onTap: () => Navigator.of(context).pushNamed(WalletScreen.routeName),
      ),
      _MlmQuickActionData(
        icon: Icons.payments,
        label: 'Withdraw',
        background: const Color(0xFFFFEDD5),
        iconColor: const Color(0xFFF97316),
        onTap: () => Navigator.of(context).pushNamed(WithdrawScreen.routeName),
      ),
      _MlmQuickActionData(
        icon: Icons.shopping_bag,
        label: 'Shop Products',
        background: const Color(0xFFF3E8FF),
        iconColor: const Color(0xFF8B5CF6),
        onTap: () => Navigator.of(context).pushNamed(AllProductsScreen.routeName),
      ),
      _MlmQuickActionData(
        icon: Icons.history,
        label: 'Transactions',
        background: const Color(0xFFFCE7F3),
        iconColor: const Color(0xFFEC4899),
        onTap: () => Navigator.of(context).pushNamed(TransactionsScreen.routeName),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Actions', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final crossAxisCount = width >= 640
                ? 4
                : width >= 420
                    ? 3
                    : 3;
            final childAspectRatio = 1.0;
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: actions.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: childAspectRatio,
              ),
              itemBuilder: (_, index) => _MlmQuickActionCard(data: actions[index]),
            );
          },
        ),
      ],
    );
  }
}

class _MlmQuickActionData {
  const _MlmQuickActionData({
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
}

class _MlmQuickActionCard extends StatelessWidget {
  const _MlmQuickActionCard({required this.data});

  final _MlmQuickActionData data;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderRadius = BorderRadius.circular(22);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: _surfaceColor(context),
        borderRadius: borderRadius,
        border: Border.all(color: _cardBorderColor(context)),
        boxShadow: _softShadow(context),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: borderRadius,
        child: InkWell(
          borderRadius: borderRadius,
          onTap: data.onTap,
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(data.icon, color: data.iconColor, size: 28),
                const SizedBox(height: 6),
                Text(
                  data.label,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MlmResponsiveTwoColumn extends StatelessWidget {
  const _MlmResponsiveTwoColumn({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 420) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < children.length; i++) ...[
                children[i],
                if (i != children.length - 1) const SizedBox(height: 12),
              ],
            ],
          );
        }
        return Row(
          children: [
            Expanded(child: children[0]),
            const SizedBox(width: 12),
            Expanded(child: children[1]),
          ],
        );
      },
    );
  }
}

class _ProfileHeroSection extends StatelessWidget {
  const _ProfileHeroSection({required this.availableWidth});

  final double availableWidth;

  @override
  Widget build(BuildContext context) {
    final isCompact = availableWidth < 420;
    final headerHeight = isCompact ? 260.0 : 320.0;
    final totalHeight = headerHeight;
    return SizedBox(
      height: totalHeight,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SizedBox(height: headerHeight, child: _ProfileHeader(isCompact: isCompact, height: headerHeight)),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.isCompact, required this.height});

  final bool isCompact;
  final double height;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profile = ProfileProvider.of(context).data;
    final avatarImage = _buildImageProvider(profile.photoUrl);

    final avatarRadius = isCompact ? 50.0 : 54.0;
    final pillPadding = EdgeInsets.symmetric(horizontal: isCompact ? 12 : 16, vertical: isCompact ? 6 : 8);

    return SizedBox(
      height: height,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: height - (isCompact ? 20 : 30),
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF148A7E), Color(0xFF0E6A60)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(40),
                bottomRight: Radius.circular(40),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _HeaderIconButton(
                        icon: Icons.arrow_back,
                        onPressed: () => Navigator.of(context).maybePop(),
                        foregroundColor: Colors.white,
                      ),
                      const Spacer(),
                      _HeaderIconButton(
                        icon: Icons.edit_outlined,
                        onPressed: () => Navigator.of(context).pushNamed(ProfileEditScreen.routeName),
                        foregroundColor: Colors.white,
                      ),
                    ],
                  ),
                  SizedBox(height: isCompact ? 16 : 24),
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        _ProfileAvatar(radius: avatarRadius, image: avatarImage),
                        const SizedBox(width: 18),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                profile.name,
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: isCompact ? 22 : null,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Partner ID · ${profile.partnerId}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white.withValues(alpha: 0.8),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: pillPadding,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.18),
                                  borderRadius: BorderRadius.circular(28),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 18),
                                    const SizedBox(width: 8),
                                    Text(
                                      profile.membershipTier,
                                      style: theme.textTheme.labelLarge?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
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

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({required this.radius, required this.image});

  final double radius;
  final ImageProvider image;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: theme.brightness == Brightness.dark ? 0.5 : 0.12),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: CircleAvatar(radius: radius, backgroundImage: image),
    );
  }
}


class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({required this.icon, required this.onPressed, required this.foregroundColor});

  final IconData icon;
  final VoidCallback onPressed;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed,
      style: IconButton.styleFrom(
        backgroundColor: Colors.white.withValues(alpha: 0.18),
        foregroundColor: foregroundColor,
        minimumSize: const Size(40, 40),
        padding: EdgeInsets.zero,
      ),
      icon: Icon(icon, size: 20),
    );
  }
}

double _responsiveSidePadding(double width) {
  if (width >= 1400) return (width - 960) / 2;
  if (width >= 1100) return 96;
  if (width >= 900) return 72;
  if (width >= 720) return 56;
  if (width >= 520) return 32;
  return 16;
}

Color _surfaceColor(BuildContext context) {
  final theme = Theme.of(context);
  return theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white;
}

Color _cardBorderColor(BuildContext context) {
  final theme = Theme.of(context);
  return theme.brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.12) : const Color(0xFFE2E8F0);
}

List<BoxShadow> _softShadow(BuildContext context) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  return [
    BoxShadow(
      color: isDark ? Colors.black.withValues(alpha: 0.45) : Colors.black.withValues(alpha: 0.08),
      blurRadius: 26,
      offset: const Offset(0, 16),
    ),
  ];
}

final NumberFormat _currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

String _formatCurrency(double value) => _currencyFormatter.format(value);

String _formatPercent(double value) {
  final decimals = value % 1 == 0 ? 0 : 1;
  return value.toStringAsFixed(decimals);
}

class _SupportCard extends StatelessWidget {
  const _SupportCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = _surfaceColor(context);
    final borderColor = _cardBorderColor(context);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: borderColor),
        boxShadow: _softShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.headset_mic_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Need assistance?', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text("We're online 24/7 to help with payouts, teams or compliance questions.",
                        style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.7))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  icon: const Icon(Icons.chat_outlined),
                  label: const Text('Live chat'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {},
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  icon: const Icon(Icons.phone_forwarded_outlined),
                  label: const Text('Request a call'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
