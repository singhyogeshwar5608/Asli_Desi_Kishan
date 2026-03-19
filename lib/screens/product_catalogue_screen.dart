import 'dart:math' show pi;

import 'package:flutter/material.dart';

class ProductCatalogueScreen extends StatefulWidget {
  const ProductCatalogueScreen({super.key});

  static const routeName = '/product-catalogue';

  @override
  State<ProductCatalogueScreen> createState() => _ProductCatalogueScreenState();
}

class _ProductCatalogueScreenState extends State<ProductCatalogueScreen> {
  final PageController _pageController = PageController();
  final ValueNotifier<double> _pageNotifier = ValueNotifier<double>(0);

  final List<String> _catalogImages = const [
    'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  ];

  @override
  void initState() {
    super.initState();
    _pageController.addListener(_handlePageScroll);
  }

  @override
  void dispose() {
    _pageController
      ..removeListener(_handlePageScroll)
      ..dispose();
    _pageNotifier.dispose();
    super.dispose();
  }

  void _handlePageScroll() {
    _pageNotifier.value = _pageController.page ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Product Catalogue'),
        centerTitle: true,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 30,
                    offset: const Offset(0, 20),
                  ),
                ],
              ),
              child: ValueListenableBuilder<double>(
                valueListenable: _pageNotifier,
                builder: (_, value, __) {
                  return PageView.builder(
                    controller: _pageController,
                    itemCount: _catalogImages.length,
                    physics: const BouncingScrollPhysics(),
                    itemBuilder: (context, index) {
                      final delta = (index - value).clamp(-1.0, 1.0);
                      final rotation = delta * (pi / 6);
                      final isCurrentPage = (value - index).abs() < 0.5;

                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOut,
                        margin: EdgeInsets.symmetric(horizontal: isCurrentPage ? 0 : 12, vertical: isCurrentPage ? 0 : 12),
                        child: Transform(
                          alignment: delta > 0 ? Alignment.centerLeft : Alignment.centerRight,
                          transform: Matrix4.identity()
                            ..setEntry(3, 2, 0.001)
                            ..rotateY(rotation),
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              color: Colors.white,
                            ),
                            child: Stack(
                              children: [
                                Positioned.fill(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(24),
                                    child: Image.network(
                                      _catalogImages[index],
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                if (!isCurrentPage)
                                  Align(
                                    alignment: delta > 0 ? Alignment.centerLeft : Alignment.centerRight,
                                    child: Container(
                                      width: 40,
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: delta > 0 ? Alignment.centerLeft : Alignment.centerRight,
                                          end: delta > 0 ? Alignment.centerRight : Alignment.centerLeft,
                                          colors: [
                                            Colors.black.withOpacity(0.15),
                                            Colors.transparent,
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}
