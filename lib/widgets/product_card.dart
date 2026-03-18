import 'package:flutter/material.dart';

import '../models/product.dart';
import '../screens/customer_details_screen.dart';
import '../state/cart_state.dart';
import '../state/wishlist_state.dart';
import '../theme/app_theme.dart';
import 'safe_network_image.dart';

class ProductCard extends StatefulWidget {
  const ProductCard({super.key, required this.product, required this.rating});

  final Product product;
  final double rating;

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  late final PageController _pageController;
  int _currentIndex = 0;

  List<String> get _images {
    final gallery = widget.product.galleryImages;
    return gallery.isNotEmpty ? gallery : [widget.product.imageUrl];
  }

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompactCard = constraints.maxWidth <= 220;

        final wishlistState = WishlistProvider.of(context);
        final isWishlisted = wishlistState.contains(widget.product.id);
        final wishlistIconSize = isCompactCard ? 15.0 : 18.0;
        final wishlistButtonSize = isCompactCard ? 28.0 : 38.0;

        Widget buildImageSection() {
          final commissionPercent = widget.product.commissionPercent;
          final commissionLabel = commissionPercent > 0
              ? '${commissionPercent.round()}% OFF'
              : null;
          final images = _images;
          final imageStack = Stack(
            children: [
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                  child: Container(
                    color: theme.colorScheme.surface,
                    child: PageView.builder(
                      controller: _pageController,
                      itemCount: images.length,
                      onPageChanged: (index) => setState(() => _currentIndex = index),
                      itemBuilder: (context, index) => SafeNetworkImage(
                        src: images[index],
                        fit: BoxFit.cover,
                        alignment: Alignment.center,
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          widget.rating.toStringAsFixed(1),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  width: wishlistButtonSize,
                  height: wishlistButtonSize,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: isDark ? 0.18 : 0.85),
                    borderRadius: BorderRadius.circular(wishlistButtonSize / 2),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x24000000),
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: IconButton(
                    tooltip: isWishlisted ? 'Remove from wishlist' : 'Save to wishlist',
                    visualDensity: VisualDensity.compact,
                    iconSize: wishlistIconSize,
                    padding: EdgeInsets.zero,
                    constraints: BoxConstraints.tightFor(
                      width: wishlistButtonSize,
                      height: wishlistButtonSize,
                    ),
                    onPressed: () {
                      final wishlist = WishlistProvider.of(context, listen: false);
                      if (wishlist.contains(widget.product.id)) {
                        wishlist.remove(widget.product.id);
                      } else {
                        wishlist.add(widget.product);
                      }
                    },
                    icon: Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(Icons.favorite_border, color: Colors.white, size: wishlistIconSize),
                        AnimatedScale(
                          scale: isWishlisted ? 1 : 0.6,
                          duration: const Duration(milliseconds: 200),
                          curve: isWishlisted ? Curves.easeOutBack : Curves.easeIn,
                          child: AnimatedOpacity(
                            duration: const Duration(milliseconds: 200),
                            opacity: isWishlisted ? 1 : 0,
                            curve: Curves.easeInOut,
                            child: Icon(
                              Icons.favorite,
                              size: wishlistIconSize,
                              color: const Color(0xFFFF3B3B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (images.length > 1)
                Positioned(
                  bottom: 8,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (index) {
                      final isActive = index == _currentIndex;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        height: 4,
                        width: isActive ? 16 : 6,
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.primary
                              : Colors.white.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      );
                    }),
                  ),
                ),
              if (commissionLabel != null)
                Positioned(
                  left: 12,
                  bottom: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.mlmGreen.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      commissionLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 10,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ),
                ),
            ],
          );

          return AspectRatio(
            aspectRatio: isCompactCard ? 1 : 4 / 3,
            child: imageStack,
          );
        }

        final double? originalPrice =
            widget.product.totalPrice > widget.product.price ? widget.product.totalPrice : null;
        final bodyPadding = EdgeInsets.all(isCompactCard ? 10 : 16);
        final titleStyle = theme.textTheme.labelLarge?.copyWith(
          fontWeight: FontWeight.w700,
          fontSize: isCompactCard ? 13 : null,
        );
        final priceStyle = theme.textTheme.titleSmall?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w700,
          fontSize: isCompactCard ? 14 : null,
        );
        final bvStyle = theme.textTheme.labelSmall?.copyWith(
          color: AppColors.mlmGreen,
          fontWeight: FontWeight.w700,
          fontSize: isCompactCard ? 11 : null,
        );
        final smallGap = isCompactCard ? 4.0 : 6.0;
        final buttonsSpacing = isCompactCard ? 6.0 : 8.0;

        return Container(
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.06 : 0.08),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              buildImageSection(),
              Padding(
                padding: bodyPadding,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.product.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: titleStyle,
                    ),
                    SizedBox(height: smallGap),
                    if (originalPrice != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          '₹${originalPrice.toStringAsFixed(2)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                            decoration: TextDecoration.lineThrough,
                            fontSize: isCompactCard ? 11 : 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${widget.product.price.toStringAsFixed(2)}',
                          style: priceStyle,
                        ),
                        Row(
                          children: [
                            const Icon(
                              Icons.token,
                              size: 16,
                              color: AppColors.mlmGreen,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.product.bv} BV',
                              style: bvStyle,
                            ),
                          ],
                        ),
                      ],
                    ),
                SizedBox(height: buttonsSpacing),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final isWideLayout = constraints.maxWidth >= 240;

                    Widget buildAddToCartButton() {
                      return OutlinedButton.icon(
                        icon: Icon(Icons.shopping_cart, size: 18, color: theme.colorScheme.primary),
                        label: Text(
                          'Add to Cart',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          backgroundColor: Colors.white,
                          side: BorderSide(color: theme.colorScheme.primary, width: 1.2),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          foregroundColor: theme.colorScheme.primary,
                        ),
                        onPressed: () {
                          CartProvider.of(context, listen: false).addProduct(widget.product);
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
                        },
                      );
                    }

                    Widget buildBuyNowButton() {
                      return FilledButton.icon(
                        icon: const Icon(Icons.bolt, size: 18),
                        label: const Text(
                          'Buy Now',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          CartProvider.of(context, listen: false).addProduct(widget.product);
                          Navigator.of(context).pushNamed(CustomerDetailsScreen.routeName);
                        },
                      );
                    }

                    if (isWideLayout) {
                      return Row(
                        children: [
                          Expanded(child: buildAddToCartButton()),
                          const SizedBox(width: 10),
                          Expanded(child: buildBuyNowButton()),
                        ],
                      );
                    }

                    return Column(
                      children: [
                        SizedBox(width: double.infinity, child: buildAddToCartButton()),
                        SizedBox(height: buttonsSpacing),
                        SizedBox(width: double.infinity, child: buildBuyNowButton()),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
            ],
          ),
        );
      },
    );
  }
}
