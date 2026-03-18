import 'dart:async';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'safe_network_image.dart';

class HeroBanner extends StatefulWidget {
  const HeroBanner({super.key});

  @override
  State<HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends State<HeroBanner> {
  final PageController _pageController = PageController();
  late Timer _timer;
  int _currentPage = 0;

  static const _autoPlayInterval = Duration(seconds: 5);
  static const _banners = [
    _BannerData(
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCNES-N6nAEUoiY4qmg7xA5FSsCiP_2kXiEL4lWvv6vQmda-H2TT7vfrwvGSdpHK9UdsTb3mnFLqb9oytZWIbAXOTIGuzxVqnDtzAAzx9bdCfOt1fD_jZi9eN8HcPfM1T4qUbHzNEBl7sd_IIRlZAMKZFCsBMbCvyYnkPckk7oMEV0wA1SUxEx-twDTQfJh9Rnk-gTZnliizbh5cyQhONi0fFqLIkpnAEzBkYEJ5VCT_-FBBcXcqvQw83t5wMWBvYID3Hetp3EEUiI',
      badge: 'Double BV Bonus',
      title: 'Fuel Your Business with New Wellness Range',
      subtitle: 'Earn 2x BV on all health supplements this week.',
    ),
    _BannerData(
      imageUrl:
          'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1400&q=80',
      badge: 'New Launch',
      title: 'Smart Tech Kits for Your Team',
      subtitle: 'Starter bundles curated for high-performing partners.',
    ),
    _BannerData(
      imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
      badge: 'Referral Reward',
      title: 'Invite Three Leaders & Earn Cash Bonus',
      subtitle: 'Unlock exclusive incentives before month end.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(_autoPlayInterval, (_) {
      if (!mounted) return;
      _currentPage = (_currentPage + 1) % _banners.length;
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final isCompact = width < 380;
        final requiresMinHeight = width < 560;
        final minHeight = isCompact ? 230.0 : 260.0;
        final padding = EdgeInsets.all(isCompact ? 16 : 24);
        final spacingSmall = isCompact ? 8.0 : 12.0;
        final spacingLarge = isCompact ? 12.0 : 16.0;

        Widget buildBanner(_BannerData data) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              fit: StackFit.expand,
              children: [
                SafeNetworkImage(src: data.imageUrl, fit: BoxFit.cover),
                DecoratedBox(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [Color(0xCC2B9DEE), Color(0x002B9DEE)],
                    ),
                  ),
                ),
                Padding(
                  padding: padding,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: isCompact ? 6 : 8,
                          vertical: isCompact ? 3 : 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          data.badge,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontSize: isCompact ? 9 : 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      SizedBox(height: spacingSmall),
                      Text(
                        data.title,
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: isCompact ? 18 : null,
                        ),
                      ),
                      SizedBox(height: spacingSmall * 0.75),
                      Text(
                        data.subtitle,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: isCompact ? 11 : null,
                        ),
                      ),
                      SizedBox(height: spacingLarge),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primary,
                          padding: EdgeInsets.symmetric(
                            horizontal: isCompact ? 16 : 20,
                            vertical: isCompact ? 10 : 12,
                          ),
                          textStyle: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: isCompact ? 11 : 12,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {},
                        child: const Text('Shop Now'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        final slider = Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              itemCount: _banners.length,
              onPageChanged: (index) => setState(() => _currentPage = index),
              itemBuilder: (_, index) => buildBanner(_banners[index]),
            ),
            Positioned(
              right: 16,
              bottom: 16,
              child: Row(
                children: [
                  for (int i = 0; i < _banners.length; i++)
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: i == _currentPage ? 14 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: i == _currentPage ? Colors.white : Colors.white.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                ],
              ),
            ),
          ],
        );

        if (requiresMinHeight) {
          return SizedBox(height: minHeight, child: slider);
        }

        return AspectRatio(aspectRatio: 21 / 9, child: slider);
      },
    );
  }
}

class _BannerData {
  const _BannerData({required this.imageUrl, required this.badge, required this.title, required this.subtitle});

  final String imageUrl;
  final String badge;
  final String title;
  final String subtitle;
}
