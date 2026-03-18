import 'dart:ui';
import 'package:flutter/material.dart';

import '../data/product_catalog.dart' as local_data;
import '../models/product.dart';
import '../models/product_entry.dart';
import 'customer_details_screen.dart';

import '../state/cart_state.dart';
import '../state/product_catalog_state.dart';
import '../state/wishlist_state.dart';
import '../theme/app_theme.dart';
import '../widgets/product_card.dart';
import '../widgets/safe_network_image.dart';

class ProductDetailsScreen extends StatelessWidget {
  const ProductDetailsScreen({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final catalogState = ProductCatalogProvider.of(context);
    final sourceEntries = catalogState.entries;
    final relatedEntries = (sourceEntries.isNotEmpty ? sourceEntries : local_data.productCatalog)
        .where((entry) => entry.product.id != product.id)
        .take(6)
        .toList();

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: Align(
                alignment: Alignment.topCenter,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 430),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 96, 16, 160),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ImageCarousel(images: product.galleryImages),

                        const SizedBox(height: 20),
                        _TitleSection(product: product),

                        const SizedBox(height: 16),
                        PriceSection(price: product.price, bv: product.bv),
                        const SizedBox(height: 20),
                        const AffiliateBox(),
                        const SizedBox(height: 20),
                        _DescriptionSection(description: product.description),
                        const SizedBox(height: 16),
                        const _FeatureGrid(),
                        const SizedBox(height: 24),
                        const _AccordionSection(),
                        const SizedBox(height: 24),
                        RelatedProductsSection(entries: relatedEntries),

                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const _StickyHeader(),
            BottomActionBar(product: product),
          ],
        ),
      ),
    );
  }
}

/* ---------------------- STICKY HEADER ---------------------- */

class _StickyHeader extends StatelessWidget {
  const _StickyHeader();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = theme.colorScheme.surface;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 430),
          child: ClipRRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(
                height: 64,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.8),
                  border: Border(
                    bottom: BorderSide(
                      color: theme.brightness == Brightness.dark
                          ? const Color(0xFF1F2933)
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    _CircleIconButton(
                      icon: Icons.arrow_back,
                      onPressed: () => Navigator.of(context).maybePop(),
                    ),
                    const Expanded(
                      child: Center(
                        child: Text(
                          'Product Details',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    _CircleIconButton(
                      icon: Icons.share,
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.onPressed});

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      height: 40,
      width: 40,
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Icon(icon, color: theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}

/* ---------------------- IMAGE CAROUSEL ---------------------- */

class ImageCarousel extends StatefulWidget {
  const ImageCarousel({super.key, required this.images});

  final List<String> images;

  @override
  State<ImageCarousel> createState() => _ImageCarouselState();
}

class _ImageCarouselState extends State<ImageCarousel> {
  late final PageController _controller;
  int _current = 0;

  List<String> get _images => widget.images.isNotEmpty ? widget.images : const [];

  @override
  void initState() {
    super.initState();
    _controller = PageController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final images = _images.isNotEmpty ? _images : [''];

    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.08),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              PageView.builder(
                controller: _controller,
                itemCount: images.length,
                onPageChanged: (index) => setState(() => _current = index),
                itemBuilder: (context, index) => SafeNetworkImage(
                  src: images[index],
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'BEST SELLER',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              if (images.length > 1)
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (index) {
                      final isActive = index == _current;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: isActive ? 18 : 6,
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.primary
                              : (isDark ? const Color(0xFF475569) : const Color(0xFFD1D5DB)),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      );
                    }),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ---------------------- TITLE SECTION ---------------------- */

class _TitleSection extends StatelessWidget {
  const _TitleSection({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            product.title,
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        _WishlistHeartButton(product: product),
      ],
    );
  }
}

class _WishlistHeartButton extends StatelessWidget {
  const _WishlistHeartButton({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final wishlist = WishlistProvider.of(context);
    final isWishlisted = wishlist.contains(product.id);

    return IconButton(
      tooltip: isWishlisted ? 'Remove from wishlist' : 'Save to wishlist',
      onPressed: () {
        final notifier = WishlistProvider.of(context, listen: false);
        if (notifier.contains(product.id)) {
          notifier.remove(product.id);
        } else {
          notifier.add(product);
        }
      },
      icon: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.favorite_border,
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4),
            size: 26,
          ),
          AnimatedScale(
            scale: isWishlisted ? 1 : 0.4,
            duration: const Duration(milliseconds: 200),
            curve: isWishlisted ? Curves.easeOutBack : Curves.easeIn,
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 200),
              opacity: isWishlisted ? 1 : 0,
              curve: Curves.easeInOut,
              child: const Icon(
                Icons.favorite,
                size: 22,
                color: Color(0xFFFF3B3B),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/* ---------------------- PRICE SECTION ---------------------- */

class PriceSection extends StatelessWidget {
  const PriceSection({super.key, required this.price, required this.bv});

  final double price;
  final int bv;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              '₹${price.toStringAsFixed(2)}',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontSize: 30,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '$bv BV',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.info_outline,
                      size: 16, color: AppColors.primary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          'Inclusive of all taxes',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontSize: 14,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }
}

/* ---------------------- AFFILIATE BOX ---------------------- */

class AffiliateBox extends StatelessWidget {
  const AffiliateBox({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.payments, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Earn commission on this product',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color:
                        theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '15% Affiliate Commission',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.primary),
        ],
      ),
    );
  }
}

/* ---------------------- DESCRIPTION SECTION ---------------------- */

class _DescriptionSection extends StatelessWidget {
  const _DescriptionSection({required this.description});

  final String description;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Description',
          style: theme.textTheme.titleMedium?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontSize: 14,
            height: 1.6,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }
}

/* ---------------------- FEATURE GRID ---------------------- */

class _FeatureGrid extends StatelessWidget {
  const _FeatureGrid();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const spacing = 12.0;
        const runSpacing = 12.0;
        final isTwoColumn = constraints.maxWidth >= 420;
        final columnCount = isTwoColumn ? 2 : 1;
        final totalSpacing = spacing * (columnCount - 1);
        final cardWidth =
            columnCount == 0 ? constraints.maxWidth : (constraints.maxWidth - totalSpacing) / columnCount;

        return Wrap(
          spacing: spacing,
          runSpacing: runSpacing,
          children: [
            for (final item in _featureItems)
              SizedBox(
                width: cardWidth,
                child: FeatureCard(
                  icon: item.icon,
                  title: item.title,
                  subtitle: item.subtitle,
                ),
              ),
          ],
        );
      },
    );
  }
}

class FeatureCard extends StatelessWidget {
  const FeatureCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = theme.brightness == Brightness.dark
        ? const Color(0xFF1F2A37)
        : const Color(0xFFE2E8F0);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontSize: 12,
                    color:
                        theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

const List<_FeatureItem> _featureItems = [
  _FeatureItem(
    icon: Icons.local_shipping,
    title: 'Free Delivery',
    subtitle: 'Orders over \$50',
  ),
  _FeatureItem(
    icon: Icons.verified_user,
    title: 'Original',
    subtitle: '100% Authentic',
  ),
];

class _FeatureItem {
  const _FeatureItem({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;
}

/* ---------------------- ACCORDION SECTION ---------------------- */

class _AccordionSection extends StatelessWidget {
  const _AccordionSection();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dividerColor = theme.brightness == Brightness.dark
        ? const Color(0xFF1F2933)
        : const Color(0xFFE2E8F0);

    return Container(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: dividerColor)),
      ),
      child: Column(
        children: const [
          AccordionTile(title: 'Key Ingredients'),
          AccordionTile(title: 'How to Use'),
          AccordionTile.reviews(),
        ],
      ),
    );
  }
}

class AccordionTile extends StatelessWidget {
  const AccordionTile({
    super.key,
    required this.title,
    this.trailing,
  });

  const AccordionTile.reviews({super.key})
      : title = 'Customer Reviews (128)',
        trailing = const _ReviewTrailing();

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dividerColor = theme.brightness == Brightness.dark
        ? const Color(0xFF1F2933)
        : const Color(0xFFE2E8F0);

    return Container(
      height: 56,
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: dividerColor)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
          trailing ?? const Icon(Icons.add, size: 20),
        ],
      ),
    );
  }
}

class _ReviewTrailing extends StatelessWidget {
  const _ReviewTrailing();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: const [
        Text(
          '4.8',
          style: TextStyle(
            color: Color(0xFFF59E0B),
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(width: 2),
        Icon(Icons.star, size: 18, color: Color(0xFFF59E0B)),
        SizedBox(width: 4),
        Icon(Icons.chevron_right, size: 20),
      ],
    );
  }
}

/* ---------------------- BOTTOM ACTION BAR (FIXED _showSnackBar) ---------------------- */

class BottomActionBar extends StatelessWidget {
  const BottomActionBar({super.key, required this.product});

  final Product product;

  void _showSnackBar(BuildContext context) {
    final theme = Theme.of(context);
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('Added to cart'),
          backgroundColor: theme.colorScheme.primary,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dividerColor = theme.brightness == Brightness.dark
        ? const Color(0xFF1F2933)
        : const Color(0xFFE2E8F0);

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: Align(
        alignment: Alignment.bottomCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 430),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(top: BorderSide(color: dividerColor)),
            ),
            child: Row(
              children: [
                Container(
                  height: 56,
                  width: 56,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: dividerColor, width: 2),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.add_shopping_cart),
                    onPressed: () {
                      CartProvider.of(context, listen: false)
                          .addProduct(product);
                      _showSnackBar(context);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ScaleOnPress(
                    onPressed: () {
                      CartProvider.of(context, listen: false).addProduct(product);
                      Navigator.of(context).pushNamed(CustomerDetailsScreen.routeName);
                    },
                    child: Container(
                      height: 56,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color:
                                AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Center(
  child: Text(
    'Buy Now',
    style: theme.textTheme.titleMedium?.copyWith(
      fontWeight: FontWeight.w700,
      color: Colors.white, // visible on primary background
    ),
  ),
),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/* ---------------------- SCALE ON PRESS ---------------------- */

class _ScaleOnPress extends StatefulWidget {
  const _ScaleOnPress({required this.child, required this.onPressed});

  final Widget child;
  final VoidCallback onPressed;

  @override
  State<_ScaleOnPress> createState() => _ScaleOnPressState();
}

class _ScaleOnPressState extends State<_ScaleOnPress> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed == value) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onPressed,
      onTapDown: (_) => _setPressed(true),
      onTapUp: (_) => _setPressed(false),
      onTapCancel: () => _setPressed(false),
      child: AnimatedScale(
        scale: _pressed ? 0.95 : 1,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}

class RelatedProductsSection extends StatelessWidget {
  const RelatedProductsSection({
    super.key,
    required this.entries,
  });

  final List<ProductCatalogEntry> entries;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (entries.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Related Products",
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 16),

        SizedBox(
          height: 360,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.zero,
            itemCount: entries.length,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              final entry = entries[index];
              return SizedBox(
                width: 230,
                child: ProductCard(product: entry.product, rating: entry.rating),
              );
            },
          ),
        ),
      ],
    );
  }
}