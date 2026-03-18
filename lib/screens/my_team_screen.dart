import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'member_detail_screen.dart';

class MyTeamScreen extends StatefulWidget {
  const MyTeamScreen({super.key});

  static const routeName = '/my-team';

  @override
  State<MyTeamScreen> createState() => _MyTeamScreenState();
}

enum TeamFilter { all, active, leaders, pending }

extension TeamFilterLabel on TeamFilter {
  String get label {
    switch (this) {
      case TeamFilter.all:
        return 'All';
      case TeamFilter.active:
        return 'Active';
      case TeamFilter.leaders:
        return 'Leaders';
      case TeamFilter.pending:
        return 'Pending';
    }
  }
}

class TeamMember {
  const TeamMember({
    required this.name,
    required this.role,
    required this.avatarUrl,
    required this.segment,
    required this.online,
    required this.joinedAgo,
    required this.salesVolume,
    required this.activeDays,
    required this.weakLeg,
  });

  final String name;
  final String role;
  final String avatarUrl;
  final TeamFilter segment;
  final bool online;
  final String joinedAgo;
  final double salesVolume;
  final int activeDays;
  final String weakLeg;
}

final List<TeamMember> _teamMembers = [
  const TeamMember(
    name: 'Isabella Flores',
    role: 'Diamond Leader',
    avatarUrl: 'https://i.pravatar.cc/150?img=60',
    segment: TeamFilter.leaders,
    online: true,
    joinedAgo: '5 min ago',
    salesVolume: 19540,
    activeDays: 142,
    weakLeg: 'Right',
  ),
  const TeamMember(
    name: 'Marcus Green',
    role: 'Senior Mentor',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    segment: TeamFilter.active,
    online: false,
    joinedAgo: '2h ago',
    salesVolume: 11280,
    activeDays: 96,
    weakLeg: 'Left',
  ),
  const TeamMember(
    name: 'Lena Park',
    role: 'Growth Strategist',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    segment: TeamFilter.active,
    online: true,
    joinedAgo: 'Just now',
    salesVolume: 8740,
    activeDays: 65,
    weakLeg: 'Right',
  ),
  const TeamMember(
    name: 'Devin Carter',
    role: 'Regional Captain',
    avatarUrl: 'https://i.pravatar.cc/150?img=28',
    segment: TeamFilter.leaders,
    online: false,
    joinedAgo: 'Yesterday',
    salesVolume: 15400,
    activeDays: 188,
    weakLeg: 'Left',
  ),
  const TeamMember(
    name: 'Amelia Stone',
    role: 'Onboarding Coach',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    segment: TeamFilter.pending,
    online: false,
    joinedAgo: 'Pending KYC',
    salesVolume: 0,
    activeDays: 3,
    weakLeg: 'Left',
  ),
  const TeamMember(
    name: 'Noah Patel',
    role: 'Activation Partner',
    avatarUrl: 'https://i.pravatar.cc/150?img=67',
    segment: TeamFilter.active,
    online: true,
    joinedAgo: 'Online now',
    salesVolume: 4320,
    activeDays: 44,
    weakLeg: 'Right',
  ),
];

MemberDetailArguments _mapMemberToDetailArgs(TeamMember member) {
  Color rankColor;
  List<String> focusAreas;
  int teamSize;
  switch (member.segment) {
    case TeamFilter.leaders:
      rankColor = const Color(0xFF8B5CF6);
      focusAreas = const ['Leadership Coaching', 'Network Expansion', 'Retention'];
      teamSize = 32;
      break;
    case TeamFilter.active:
      rankColor = AppColors.primary;
      focusAreas = const ['Product Training', 'Conversion Funnels'];
      teamSize = 18;
      break;
    case TeamFilter.pending:
      rankColor = const Color(0xFFF97316);
      focusAreas = const ['Onboarding', 'KYC Approvals'];
      teamSize = 6;
      break;
    case TeamFilter.all:
      rankColor = const Color(0xFF0EA5E9);
      focusAreas = const ['Community Building'];
      teamSize = 12;
      break;
  }

  final slug = member.name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '.');
  final email = '$slug@netshoppartners.com';
  final volumeString = member.salesVolume.toStringAsFixed(0).padLeft(4, '0');
  final phoneSuffix = volumeString.substring(volumeString.length - 4);
  final phone = '+1 555-${member.activeDays.toString().padLeft(3, '0')}-$phoneSuffix';
  final growth = (member.salesVolume / 20000).clamp(0.05, 0.95);

  return MemberDetailArguments(
    name: member.name,
    role: member.role,
    rankLabel: member.role,
    rankColor: rankColor,
    avatarUrl: member.avatarUrl,
    status: member.online ? 'Online now' : 'Last seen ${member.joinedAgo}',
    totalBv: member.salesVolume.round(),
    teamSize: teamSize,
    activeDays: member.activeDays,
    weakLeg: member.weakLeg,
    location: member.segment == TeamFilter.leaders ? 'Global HQ' : 'Remote · International',
    contactEmail: email,
    contactPhone: phone,
    joinedAgo: member.joinedAgo,
    growth: growth,
    focusAreas: focusAreas,
  );
}

class _TeamStatsGrid extends StatelessWidget {
  const _TeamStatsGrid({
    required this.activeMembers,
    required this.newThisWeek,
    required this.pendingKyc,
  });

  final int activeMembers;
  final int newThisWeek;
  final int pendingKyc;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    Widget tile({
      required String label,
      required String value,
      required IconData icon,
      Color? accent,
    }) {
      final color = accent ?? AppColors.primary;
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: border),
          color: theme.cardColor,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ],
        ),
      );
    }

    final tiles = [
      tile(label: 'Active this week', value: '$activeMembers', icon: Icons.verified_user),
      tile(
        label: 'New signups',
        value: '+$newThisWeek',
        icon: Icons.person_add_alt_1,
        accent: const Color(0xFF10B981),
      ),
      tile(
        label: 'Pending KYC',
        value: '$pendingKyc',
        icon: Icons.pending_outlined,
        accent: const Color(0xFFF97316),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 420) {
          return Column(
            children: [
              for (int i = 0; i < tiles.length; i++) ...[
                tiles[i],
                if (i != tiles.length - 1) const SizedBox(height: 12),
              ],
            ],
          );
        }

        return Row(
          children: [
            for (int i = 0; i < tiles.length; i++) ...[
              Expanded(child: tiles[i]),
              if (i != tiles.length - 1) const SizedBox(width: 12),
            ],
          ],
        );
      },
    );
  }
}

class _FilterWrap extends StatelessWidget {
  const _FilterWrap({required this.selected, required this.onSelected});

  final TeamFilter selected;
  final ValueChanged<TeamFilter> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isCompact = MediaQuery.of(context).size.width < 414;

    final chips = TeamFilter.values
        .map((filter) {
          final isSelected = selected == filter;
          return ChoiceChip(
            label: Text(filter.label),
            selected: isSelected,
            onSelected: (_) => onSelected(filter),
            selectedColor: theme.colorScheme.primary,
            backgroundColor: theme.colorScheme.surface,
            labelStyle: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: isSelected ? Colors.white : theme.colorScheme.onSurface,
            ),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          );
        })
        .toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.only(right: isCompact ? 0 : 4),
      child: Row(
        children: [
          for (int i = 0; i < chips.length; i++) ...[
            chips[i],
            if (i != chips.length - 1) SizedBox(width: isCompact ? 8 : 10),
          ],
        ],
      ),
    );
  }
}

class _TeamMemberTile extends StatelessWidget {
  const _TeamMemberTile({required this.member, this.onTap});

  final TeamMember member;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.06),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Theme(
          data: theme.copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            collapsedIconColor: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            iconColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            collapsedShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            leading: CircleAvatar(radius: 24, backgroundImage: NetworkImage(member.avatarUrl)),
            title: Text(
              member.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
            subtitle: Text(
              member.segment.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          member.role,
                          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 8),
                        Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: _StatBadge(
                                    icon: Icons.stacked_line_chart,
                                    label: '${member.salesVolume.toStringAsFixed(0)} BV',
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: _StatBadge(
                                    icon: Icons.timeline,
                                    label: '${member.activeDays} active days',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (onTap != null)
                          Align(
                            alignment: Alignment.centerLeft,
                            child: TextButton(
                              onPressed: onTap,
                              child: const Text('View member'),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Weak leg',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        member.weakLeg,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        member.online ? 'Online' : member.joinedAgo,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyMembersState extends StatelessWidget {
  const _EmptyMembersState({required this.selectedFilter});

  final TeamFilter selectedFilter;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: theme.colorScheme.surface,
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
          const SizedBox(height: 12),
          Text(
            'No members in ${selectedFilter.label}',
            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            'Invite partners or adjust filters to see more teammates.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }
}

class _OverviewChip extends StatelessWidget {
  const _OverviewChip({required this.icon, required this.label, this.dense = false});

  final IconData icon;
  final String label;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final padding = EdgeInsets.symmetric(horizontal: dense ? 10 : 12, vertical: dense ? 8 : 10);
    final iconSize = dense ? 18.0 : 20.0;
    final spacing = dense ? 4.0 : 6.0;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: iconSize, color: Colors.white),
          SizedBox(height: spacing),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  const _StatBadge({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: theme.colorScheme.primary),
          const SizedBox(width: 6),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              fontSize: 11,
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
class _MyTeamScreenState extends State<MyTeamScreen> {
  TeamFilter _selectedFilter = TeamFilter.all;

  List<TeamMember> get _filteredMembers {
    if (_selectedFilter == TeamFilter.all) return _teamMembers;
    return _teamMembers.where((member) => member.segment == _selectedFilter).toList();
  }

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
            final padding = constraints.maxWidth >= 1024
                ? 64.0
                : constraints.maxWidth >= 768
                    ? 48.0
                    : constraints.maxWidth >= 540
                        ? 32.0
                        : 16.0;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _MyTeamHeader(),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: padding),
                    child: _MyTeamBody(
                      selectedFilter: _selectedFilter,
                      onFilterChanged: (value) => setState(() => _selectedFilter = value),
                      members: _filteredMembers,
                    ),
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

class _MyTeamHeader extends StatelessWidget {
  const _MyTeamHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(bottom: BorderSide(color: border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back),
            color: theme.colorScheme.onSurface,
            splashRadius: 24,
            onPressed: () => Navigator.of(context).maybePop(),
          ),
          Expanded(
            child: Text(
              'My Team',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(width: 48),
        ],
      ),
    );
  }
}

class _MyTeamBody extends StatelessWidget {
  const _MyTeamBody({
    required this.selectedFilter,
    required this.onFilterChanged,
    required this.members,
  });

  final TeamFilter selectedFilter;
  final ValueChanged<TeamFilter> onFilterChanged;
  final List<TeamMember> members;

  static const double _monthlyGrowth = 0.128; // 12.8%
  static const int _activeMembers = 86;
  static const int _newThisWeek = 12;
  static const int _pendingKyc = 5;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TeamOverviewCard(
            monthlyGrowth: _monthlyGrowth,
            activeMembers: _activeMembers,
            newThisWeek: _newThisWeek,
          ),
          const SizedBox(height: 20),
          _TeamStatsGrid(
            activeMembers: _activeMembers,
            newThisWeek: _newThisWeek,
            pendingKyc: _pendingKyc,
          ),
          const SizedBox(height: 24),
          Text('Segments', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          _FilterWrap(selected: selectedFilter, onSelected: onFilterChanged),
          const SizedBox(height: 24),
          Text('Team Members', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          if (members.isEmpty)
            _EmptyMembersState(selectedFilter: selectedFilter)
          else
            ...[
              for (final member in members) ...[
                _TeamMemberTile(
                  member: member,
                  onTap: () => Navigator.of(context).pushNamed(
                    MemberDetailScreen.routeName,
                    arguments: _mapMemberToDetailArgs(member),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ],
        ],
      ),
    );
  }
}

class _TeamOverviewCard extends StatelessWidget {
  const _TeamOverviewCard({
    required this.monthlyGrowth,
    required this.activeMembers,
    required this.newThisWeek,
  });

  final double monthlyGrowth;
  final int activeMembers;
  final int newThisWeek;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final growthPercent = (monthlyGrowth * 100).toStringAsFixed(1);
    final leadersCount = _teamMembers.where((m) => m.segment == TeamFilter.leaders).length;

    final hasNewMembers = newThisWeek >= 0;
    final arrowIcon = hasNewMembers ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded;
    final arrowColor = hasNewMembers ? const Color(0xFF10B981) : const Color(0xFFE11D48);
    final newUsersLabel = '${newThisWeek.abs()} users';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: SizedBox(
          height: 190,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Total Team',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.85),
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  '${_teamMembers.length} members',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _OverviewStatCard(label: 'Active', value: '$activeMembers', dense: true)),
                  const SizedBox(width: 8),
                  Expanded(child: _OverviewStatCard(label: 'Leaders', value: '$leadersCount', dense: true)),
                ],
              ),
              const SizedBox(height: 6),
              Expanded(
                child: Row(
                  children: [
                    Expanded(child: _OverviewChip(icon: Icons.bolt, label: '$growthPercent% growth', dense: true)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _NewMembersTile(
                        arrowIcon: arrowIcon,
                        arrowColor: arrowColor,
                        label: newUsersLabel,
                        theme: theme,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NewMembersTile extends StatelessWidget {
  const _NewMembersTile({required this.arrowIcon, required this.arrowColor, required this.label, required this.theme});

  final IconData arrowIcon;
  final Color arrowColor;
  final String label;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(arrowIcon, size: 18, color: arrowColor),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'New members',
            style: theme.textTheme.labelSmall?.copyWith(color: Colors.white.withValues(alpha: 0.8)),
          ),
        ],
      ),
    );
  }
}

class _OverviewStatCard extends StatelessWidget {
  const _OverviewStatCard({required this.label, required this.value, this.dense = false});

  final String label;
  final String value;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: dense ? 10 : 14, vertical: dense ? 8 : 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withValues(alpha: 0.15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.75),
                  letterSpacing: 0.8,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: (dense ? Theme.of(context).textTheme.titleMedium : Theme.of(context).textTheme.titleLarge)
                ?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
