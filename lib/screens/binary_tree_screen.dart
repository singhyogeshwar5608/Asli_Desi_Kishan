import 'package:flutter/material.dart';

import 'member_detail_screen.dart';
import 'register_member_screen.dart';
import '../widgets/safe_network_image.dart';

/// Binary tree screen converted from provided HTML layout.
class BinaryTreeScreen extends StatelessWidget {
  const BinaryTreeScreen({super.key});

  static const routeName = '/binary-tree';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final background = isDark ? const Color(0xFF101A22) : const Color(0xFFF6F7F8);

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: Column(
          children: const [
            _BinaryTreeHeader(),
            _TreeInfoBanner(),
            Expanded(child: _BinaryTreeScrollView()),
          ],
        ),
      ),
    );
  }
}

class _LegSummaryColumn extends StatelessWidget {
  const _LegSummaryColumn({
    required this.label,
    required this.gridTitle,
    required this.value,
    required this.color,
    required this.members,
    required this.alignEnd,
    required this.expanded,
    required this.onToggle,
  });

  final String label;
  final String gridTitle;
  final String value;
  final Color color;
  final List<_LegMember> members;
  final bool alignEnd;
  final bool expanded;
  final VoidCallback onToggle;

  static const _animationDuration = Duration(milliseconds: 220);

  @override
  Widget build(BuildContext context) {
    final alignment = alignEnd ? Alignment.topRight : Alignment.topLeft;
    final columnAlignment = alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start;

    Widget arrowIcon() {
      return AnimatedRotation(
        turns: expanded ? 0.5 : 0,
        duration: _animationDuration,
        curve: Curves.easeInOut,
        child: Icon(Icons.keyboard_arrow_down, color: color, size: 26),
      );
    }

    Widget summaryTile() => _SummaryTile(label: label, value: value, color: color);

    List<Widget> buildRowChildren() {
      final summaryWidget = Expanded(
        child: Align(
          alignment: alignEnd ? Alignment.centerRight : Alignment.centerLeft,
          child: summaryTile(),
        ),
      );
      const spacer = SizedBox(width: 8);
      if (alignEnd) {
        return [arrowIcon(), spacer, summaryWidget];
      }
      return [summaryWidget, spacer, arrowIcon()];
    }

    return Align(
      alignment: alignment,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 320),
        child: Column(
          crossAxisAlignment: columnAlignment,
          children: [
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: onToggle,
              child: Row(
                mainAxisAlignment: alignEnd ? MainAxisAlignment.end : MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: buildRowChildren(),
              ),
            ),
            AnimatedCrossFade(
              firstChild: const SizedBox.shrink(),
              secondChild: Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Align(
                  alignment: alignment,
                  child: _LegMemberGrid(title: gridTitle, color: color, members: members),
                ),
              ),
              crossFadeState: expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: _animationDuration,
              firstCurve: Curves.easeInOut,
              secondCurve: Curves.easeInOut,
            ),
          ],
        ),
      ),
    );
  }
}

MemberDetailArguments _buildMemberDetail({
  required String name,
  required String role,
  required String rankLabel,
  required Color rankColor,
  required String avatarUrl,
  String status = 'Active',
  int totalBv = 0,
  int teamSize = 0,
  int activeDays = 0,
  String weakLeg = 'Left',
  String location = 'Singapore',
  String contactEmail = 'partner@netshop.com',
  String contactPhone = '+1 555 010 1234',
  String joinedAgo = 'Joined recently',
  double growth = 0.18,
  List<String> focusAreas = const ['Onboarding', 'Leadership', 'Training'],
}) {
  return MemberDetailArguments(
    name: name,
    role: role,
    rankLabel: rankLabel,
    rankColor: rankColor,
    avatarUrl: avatarUrl,
    status: status,
    totalBv: totalBv,
    teamSize: teamSize,
    activeDays: activeDays,
    weakLeg: weakLeg,
    location: location,
    contactEmail: contactEmail,
    contactPhone: contactPhone,
    joinedAgo: joinedAgo,
    growth: growth,
    focusAreas: focusAreas,
  );
}

class _MemberData {
  const _MemberData({
    required this.name,
    required this.role,
    required this.rankLabel,
    required this.rankColor,
    required this.avatarUrl,
    this.status = 'Active',
    this.totalBv = 0,
    this.teamSize = 0,
    this.activeDays = 0,
    this.weakLeg = 'Left',
    this.location = 'Singapore',
    this.email = 'partner@netshop.com',
    this.phone = '+1 555 010 0000',
    this.joinedAgo = 'Joined recently',
    this.growth = 0.18,
    this.focusAreas = const ['Leadership'],
  });

  final String name;
  final String role;
  final String rankLabel;
  final Color rankColor;
  final String avatarUrl;
  final String status;
  final int totalBv;
  final int teamSize;
  final int activeDays;
  final String weakLeg;
  final String location;
  final String email;
  final String phone;
  final String joinedAgo;
  final double growth;
  final List<String> focusAreas;

  MemberDetailArguments toDetailArgs() => _buildMemberDetail(
        name: name,
        role: role,
        rankLabel: rankLabel,
        rankColor: rankColor,
        avatarUrl: avatarUrl,
        status: status,
        totalBv: totalBv,
        teamSize: teamSize,
        activeDays: activeDays,
        weakLeg: weakLeg,
        location: location,
        contactEmail: email,
        contactPhone: phone,
        joinedAgo: joinedAgo,
        growth: growth,
        focusAreas: focusAreas,
      );
}

void _openMemberDetail(BuildContext context, MemberDetailArguments args) {
  Navigator.of(context).pushNamed(MemberDetailScreen.routeName, arguments: args);
}

const _MemberData _rootMember = _MemberData(
  name: 'Alex Johnson',
  role: 'Platinum Founder',
  rankLabel: 'PLATINUM',
  rankColor: Color(0xFF2B9DEE),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAt_Ss1ak-qK9U6BN8V9MS3hlY18VnA0SFVmyv6GEwEHMyqPEHWy7VO5-FqGyykML0uxzrzaGBERnv9XY9gJtF0eZIUtWeEwNfx3PiutFegQE2RPiBqWV1o9UlG2MMbC9kku3gneg-BVYN1SRQtZ0WOXYf2gauFpn2EFpgBDrpgDlAHu9ynkQrHdoqEtQ7IdNKHoJGSEBFWAtHEqxwI5OXl9WAIjXBVp16nXDQbGI_Ff06n1Md7hR2NP2kw_BvzenJSSz5qzYUzHqY',
  status: 'Active',
  totalBv: 24560,
  teamSize: 128,
  activeDays: 365,
  weakLeg: 'Right',
  location: 'Singapore',
  email: 'alex.johnson@netshop.com',
  phone: '+65 6100 1234',
  joinedAgo: 'Joined 3y ago',
  growth: 0.24,
  focusAreas: ['Leadership', 'Mentorship', 'Scaling'],
);

const _MemberData _leftBranchMember = _MemberData(
  name: 'Sarah Chen',
  role: 'Regional Captain',
  rankLabel: 'GOLD',
  rankColor: Color(0xFFFBBF24),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYDyz6W1h5i9Yc8Nyu4jAMKCee2om0yV97sMs2-l-mcdcdwFRKaN5WynmBufdYFVFm5lNpA4tzezn9RCghiq3-rnXXceKDwNqxMAWz6PigkMCyoKH4aKvxAdOGsxoq0OJubjRV4dARCJbZ77ysmNRgMMFeide--Sue160ZiM-yKwq8qdU03AxefbsbODwxlWm8JFk_cvPkiiurwaP6oPtMapzQPBCLESMjmGDWg8o4zsZPU2AsZ_BRaX5kDTDA3s9S5HlQR3nReqY',
  status: 'Active',
  totalBv: 12450,
  teamSize: 64,
  activeDays: 210,
  weakLeg: 'Right',
  location: 'Manila, Philippines',
  email: 'sarah.chen@netshop.com',
  phone: '+63 945 210 7788',
  joinedAgo: 'Joined 14m ago',
  growth: 0.19,
  focusAreas: ['Onboarding', 'Coaching'],
);

const _MemberData _rightBranchMember = _MemberData(
  name: 'Michael Smith',
  role: 'Senior Mentor',
  rankLabel: 'SILVER',
  rankColor: Color(0xFF64748B),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBq2WRHpOcZdLkeLU6HtLY2dcM2YZjcsvk_kXqEOmuON_BbX7poLXD4yue7HQDCqEUb9-Ju84kXznzHdk1jelCzduU_EKW2uBFh3dIhl-TdEVbX3PcQ6ROdTfDtWMGa6VP9BUdWD-BYiHK58V3kBDLRugBSsMV9J_KlcIyMD3Otj9CbXynRZpZdYUXEtjJC8GNYayl8aggz_twAFLu6hQgcUbbmlxf9U8w58HRn-fjUWgBzr7g5siia5QdaZOUp5dglJ1JFcn7BW_c',
  status: 'Active',
  totalBv: 9820,
  teamSize: 52,
  activeDays: 188,
  weakLeg: 'Left',
  location: 'Austin, USA',
  email: 'michael.smith@netshop.com',
  phone: '+1 512 555 2211',
  joinedAgo: 'Joined 18m ago',
  growth: 0.16,
  focusAreas: ['Automation', 'Sales'],
);

const _MemberData _leafDavidMember = _MemberData(
  name: 'David Lee',
  role: 'Field Mentor',
  rankLabel: 'SILVER',
  rankColor: Color(0xFF9CA3AF),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBF3yfz6Fx1GL25w1nAxTPoCOAY9_rptWtCtSFPFAAdxJZOR8JiXEWo8iGAZaCwIRJZ4C7aEW81qKKXeWzXDk4acrWw021JD8nE7A2qkQ1xXKKfJGtAJlXFAzIWmRs_UP_CUXeVtDoae8YRf3H6tEW9PnAKTztYkn6syYXYvANQgvO81zHJl6S-nV5aP9vZsBV8rVpwdpkR9u7k7MLICUV18IikPx1kUfo4iHm14ceyO5y4tc_134vc_-rUBWzDMCowu2aZ_IcY9Vo',
  status: 'Active',
  totalBv: 4320,
  teamSize: 18,
  activeDays: 132,
  weakLeg: 'Left',
  location: 'Sydney, Australia',
  email: 'david.lee@netshop.com',
  phone: '+61 2 5550 4300',
  joinedAgo: 'Joined 9m ago',
  growth: 0.21,
  focusAreas: ['Product Training'],
);

const _MemberData _leafElenaMember = _MemberData(
  name: 'Elena R.',
  role: 'Brand Partner',
  rankLabel: 'BRONZE',
  rankColor: Color(0xFFB45309),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOCh2FaxrnI220lK5mQkqnOBemmYxOxf_STZGslH46_OcYIqMiXW_cqqJeY1q-UELUaMLoNnPzlDpsZB1z-70GDqp7lxy_77WsWxd2y755dWFbNkKu3uq6S8D21PADtZQqQx2H-nE9OYIgwp4Wl48DOSrmBmc2ayGBTlXMDN6Lo8ccRuadA49wuetw_YRq7X6yNlcApxx_bgvztNXycOKBVe9XaCImUWLb6OA5Ve7GdchOXBNWFXLyOfTWoo-QOthtJwM_6Jbr2ks',
  status: 'Active',
  totalBv: 2860,
  teamSize: 9,
  activeDays: 88,
  weakLeg: 'Right',
  location: 'Warsaw, Poland',
  email: 'elena.ross@netshop.com',
  phone: '+48 22 555 1212',
  joinedAgo: 'Joined 6m ago',
  growth: 0.14,
  focusAreas: ['Social Selling'],
);

const _MemberData _leafJamesMember = _MemberData(
  name: 'James W.',
  role: 'Associate',
  rankLabel: 'BRONZE',
  rankColor: Color(0xFFB45309),
  avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqpQpSvt3isgqrcAnbvYOovXqgEP_tnsCEeYBoZSG2Yt5nxvLbrBCWCTRs5T9KgslOQaB5nM73aWsHn1_RBELzj9zNb9IwVag-2PyCbWufRGW1NrTrlYrmHcRJC6hqIZ2jC2MeRqfkAyeXvAj2VVFpgYtSaaGMmGN0a-2cKy0jHNxdIE7TX5XEgtrt8T2kNT_GouJ1vJLgDZpVKs3JOTpSL8qMX8exeTAO22OyKhO029LXqxMg6sqC8OVlkpyzEugVuru1fX0sdPY',
  status: 'Active',
  totalBv: 2480,
  teamSize: 7,
  activeDays: 74,
  weakLeg: 'Left',
  location: 'Toronto, Canada',
  email: 'james.walker@netshop.com',
  phone: '+1 416 555 8844',
  joinedAgo: 'Joined 4m ago',
  growth: 0.12,
  focusAreas: ['Customer Retention'],
);

class _BinaryTreeHeader extends StatelessWidget {
  const _BinaryTreeHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Container(
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
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _CircleIconButton(
                  icon: Icons.arrow_back,
                  onTap: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Binary Tree',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 40),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by name or ID...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
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

class _TreeInfoBanner extends StatelessWidget {
  const _TreeInfoBanner();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      color: theme.colorScheme.primary.withValues(alpha: 0.1),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.info_outline, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Text(
            'Tap a member to view details'.toUpperCase(),
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.primary,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _BinaryTreeScrollView extends StatelessWidget {
  const _BinaryTreeScrollView();

  static const double _minScale = 0.4;
  static const double _maxScale = 4.0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return LayoutBuilder(
      builder: (context, constraints) {
        final maxWidth = constraints.maxWidth.clamp(360.0, 640.0);
        final treeContent = SizedBox(
          width: maxWidth,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 60),
            child: _buildTreeColumn(theme),
          ),
        );

        return ClipRect(
          child: InteractiveViewer(
            minScale: _minScale,
            maxScale: _maxScale,
            boundaryMargin: const EdgeInsets.all(300),
            constrained: false,
            clipBehavior: Clip.none,
            child: Align(alignment: Alignment.center, child: treeContent),
          ),
        );
      },
    );
  }

  Widget _buildTreeColumn(ThemeData theme) {
    return Column(
      children: [
        const _RootNodeCard(member: _rootMember),
        const SizedBox(height: 24),
        _TreeConnector(height: 24, color: theme.dividerColor.withValues(alpha: 0.8)),
        const SizedBox(height: 24),
        const _SecondLevelRow(),
        const SizedBox(height: 40),
        const _SummaryPanel(),
      ],
    );
  }
}

class _TreeConnector extends StatelessWidget {
  const _TreeConnector({required this.height, required this.color});

  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(width: 2, height: height, color: color);
  }
}

class _RootNodeCard extends StatelessWidget {
  const _RootNodeCard({required this.member});

  final _MemberData member;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final borderColor = member.rankColor;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => _openMemberDetail(context, member.toDetailArgs()),
        child: Container(
          width: 200,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor, width: 2),
            boxShadow: [
              BoxShadow(
                color: borderColor.withValues(alpha: 0.25),
                blurRadius: 20,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Column(
            children: [
              Align(
                alignment: Alignment.topCenter,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: borderColor,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'Root'.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              _AvatarImage(url: member.avatarUrl, radius: 32, ringColor: borderColor),
              const SizedBox(height: 8),
              Text(
                member.name,
                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 2),
              Text(
                member.role,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                ),
              ),
              const SizedBox(height: 6),
              _RankBadge(label: member.rankLabel, color: borderColor),
            ],
          ),
        ),
      ),
    );
  }
}

class _AvatarImage extends StatelessWidget {
  const _AvatarImage({required this.url, required this.radius, required this.ringColor});

  final String url;
  final double radius;
  final Color ringColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: ringColor.withValues(alpha: 0.2), width: 2),
      ),
      padding: const EdgeInsets.all(2),
      child: ClipOval(
        child: SafeNetworkImage(src: url, fit: BoxFit.cover),
      ),
    );
  }
}

class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
            ),
      ),
    );
  }
}

class _SecondLevelRow extends StatelessWidget {
  const _SecondLevelRow();

  @override
  Widget build(BuildContext context) {
    final dividerColor = Theme.of(context).dividerColor.withValues(alpha: 0.8);
    return Column(
      children: [
        Container(height: 2, margin: const EdgeInsets.symmetric(horizontal: 40), color: dividerColor),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Expanded(child: _BranchCard(side: _BranchSide.left)),
            SizedBox(width: 16),
            Expanded(child: _BranchCard(side: _BranchSide.right)),
          ],
        ),
      ],
    );
  }
}

enum _BranchSide { left, right }

class _BranchCard extends StatelessWidget {
  const _BranchCard({required this.side});

  final _BranchSide side;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dividerColor = theme.dividerColor.withValues(alpha: 0.8);

    final data = side == _BranchSide.left ? _leftBranchMember : _rightBranchMember;

    final children = side == _BranchSide.left
        ? const [_LeafNode.david, _LeafNode.register]
        : const [_LeafNode.elena, _LeafNode.james];

    return Column(
      children: [
        _TreeConnector(height: 24, color: dividerColor),
        _MemberCard(data: data),
        _TreeConnector(height: 24, color: dividerColor),
        _ThirdLevelRow(nodes: children),
      ],
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard({required this.data});

  final _MemberData data;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final border = Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0));

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => _openMemberDetail(context, data.toDetailArgs()),
        child: Container(
          width: 156,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: border,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            children: [
              ClipOval(
                child: SafeNetworkImage(src: data.avatarUrl, width: 40, height: 40, fit: BoxFit.cover),
              ),
              const SizedBox(height: 8),
              Text(
                data.name,
                style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 2),
              Text(
                data.role,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              _RankBadge(label: data.rankLabel, color: data.rankColor),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                  const SizedBox(width: 4),
                  Text(
                    data.status.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: const Color(0xFF10B981),
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
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

class _ThirdLevelRow extends StatelessWidget {
  const _ThirdLevelRow({required this.nodes});

  final List<_LeafNode> nodes;

  @override
  Widget build(BuildContext context) {
    final dividerColor = Theme.of(context).dividerColor.withValues(alpha: 0.8);
    return SizedBox(
      width: 280,
      child: Column(
        children: [
          Container(height: 2, color: dividerColor, margin: const EdgeInsets.symmetric(horizontal: 40)),
          const SizedBox(height: 12),
          Row(
            children: nodes
                .map(
                  (node) => Expanded(
                    child: Column(
                      children: [
                        _TreeConnector(height: 20, color: dividerColor),
                        const SizedBox(height: 8),
                        node.build(context),
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

enum _LeafNode { david, register, elena, james }

extension on _LeafNode {
  Widget build(BuildContext context) {
    switch (this) {
      case _LeafNode.david:
        return _MiniMemberCard(member: _leafDavidMember);
      case _LeafNode.register:
        return const _RegisterSlot();
      case _LeafNode.elena:
        return _MiniMemberCard(member: _leafElenaMember);
      case _LeafNode.james:
        return _MiniMemberCard(member: _leafJamesMember);
    }
  }
}

class _MiniMemberCard extends StatelessWidget {
  const _MiniMemberCard({required this.member});

  final _MemberData member;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openMemberDetail(context, member.toDetailArgs()),
        child: Container(
          padding: const EdgeInsets.all(10),
          width: 120,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              ClipOval(
                child: SafeNetworkImage(src: member.avatarUrl, width: 32, height: 32, fit: BoxFit.cover),
              ),
              const SizedBox(height: 6),
              Text(
                member.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 2),
              Text(
                member.rankLabel,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegisterSlot extends StatelessWidget {
  const _RegisterSlot();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final borderColor = theme.colorScheme.primary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.of(context).pushNamed(RegisterMemberScreen.routeName),
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.5) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor, width: 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.person_add_alt_1, color: borderColor, size: 30),
              const SizedBox(height: 8),
              Text(
                'Register'.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: borderColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'New Member',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: borderColor.withValues(alpha: 0.7),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryPanel extends StatefulWidget {
  const _SummaryPanel();

  @override
  State<_SummaryPanel> createState() => _SummaryPanelState();
}

class _SummaryPanelState extends State<_SummaryPanel> {
  bool _leftExpanded = false;
  bool _rightExpanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final dividerColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          const double twoColumnBreakpoint = 540;
          final useTwoColumnLayout = constraints.maxWidth >= twoColumnBreakpoint;

          if (!useTwoColumnLayout) {
            return Column(
              children: [
                const _LegDropdownTile(
                  label: 'Left Leg BV',
                  value: '12,450',
                  color: Color(0xFF2B9DEE),
                  members: _leftLegMembers,
                ),
                const SizedBox(height: 12),
                Divider(
                  color: Colors.grey.withValues(alpha: 0.5),
                  thickness: 1,
                  height: 1,
                ),
                const SizedBox(height: 12),
                const _LegDropdownTile(
                  label: 'Right Leg BV',
                  value: '8,920',
                  color: Color(0xFF10B981),
                  members: _rightLegMembers,
                ),
              ],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _LegSummaryColumn(
                  label: 'Left Leg BV',
                  gridTitle: 'Left Leg',
                  value: '12,450',
                  color: const Color(0xFF2B9DEE),
                  members: _leftLegMembers,
                  alignEnd: false,
                  expanded: _leftExpanded,
                  onToggle: () => setState(() => _leftExpanded = !_leftExpanded),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: _LegSummaryColumn(
                  label: 'Right Leg BV',
                  gridTitle: 'Right Leg',
                  value: '8,920',
                  color: const Color(0xFF10B981),
                  members: _rightLegMembers,
                  alignEnd: true,
                  expanded: _rightExpanded,
                  onToggle: () => setState(() => _rightExpanded = !_rightExpanded),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SummaryTile extends StatelessWidget {
  const _SummaryTile({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(
              label.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                letterSpacing: 1.2,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}

class _LegMemberGrid extends StatelessWidget {
  const _LegMemberGrid({required this.title, required this.color, required this.members});

  final String title;
  final Color color;
  final List<_LegMember> members;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 3,
          ),
          itemCount: members.length,
          itemBuilder: (context, index) {
            final member = members[index];
            return Container(
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: Colors.white,
                    child: Text(
                      member.initials,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      member.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _LegMember {
  const _LegMember(this.name);

  final String name;

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}

const List<_LegMember> _leftLegMembers = [
  _LegMember('Sarah Chen'),
  _LegMember('David Lee'),
  _LegMember('Pending Slot'),
];

const List<_LegMember> _rightLegMembers = [
  _LegMember('Michael Smith'),
  _LegMember('Elena R.'),
  _LegMember('James W.'),
];

class _LegDropdownTile extends StatefulWidget {
  const _LegDropdownTile({required this.label, required this.value, required this.color, required this.members});

  final String label;
  final String value;
  final Color color;
  final List<_LegMember> members;

  @override
  State<_LegDropdownTile> createState() => _LegDropdownTileState();
}

class _LegDropdownTileState extends State<_LegDropdownTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: _SummaryTile(
                label: widget.label,
                value: widget.value,
                color: widget.color,
              ),
            ),
            IconButton(
              onPressed: () => setState(() => _expanded = !_expanded),
              icon: Icon(
                _expanded ? Icons.expand_less : Icons.expand_more,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
        AnimatedCrossFade(
          firstChild: const SizedBox.shrink(),
          secondChild: Padding(
            padding: const EdgeInsets.only(top: 12),
            child: _LegMemberGrid(
              title: widget.label.split(' ').first,
              color: widget.color,
              members: widget.members,
            ),
          ),
          crossFadeState: _expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
          duration: const Duration(milliseconds: 220),
          firstCurve: Curves.easeInOut,
          secondCurve: Curves.easeInOut,
        ),
      ],
    );
  }
}

