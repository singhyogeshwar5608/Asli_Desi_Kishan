import 'package:flutter/material.dart';

class CategorySlider extends StatelessWidget {
  const CategorySlider({
    super.key,
    required this.categories,
    required this.selectedCategory,
    required this.onCategorySelected,
    this.onViewAllTap,
  });

  final List<CategoryCardData> categories;
  final String selectedCategory;
  final ValueChanged<CategoryCardData> onCategorySelected;
  final VoidCallback? onViewAllTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Categories',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            TextButton(
              onPressed: onViewAllTap,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                minimumSize: Size.zero,
              ),
              child: Text(
                'View All',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 96,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              final category = categories[index];
              final bool isPrimary = category.label == selectedCategory;
              final accentColor = _categoryAccentColors[category.label] ?? Theme.of(context).colorScheme.primary;
              
              return Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(24),
                  onTap: () => onCategorySelected(category),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: accentColor.withAlpha(isPrimary ? 0x33 : 0x1F),
                          border: Border.all(
                            color: isPrimary ? accentColor.withAlpha(0x80) : Colors.transparent,
                          ),
                        ),
                        child: Icon(
                          category.icon,
                          size: 28,
                          color: accentColor,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        category.label,
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: isPrimary
                                  ? accentColor
                                  : Theme.of(context).colorScheme.onSurface.withAlpha(0x80),
                            ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

const Map<String, Color> _categoryAccentColors = {
  'Smart Tech': Color(0xFF3B82F6),
  'Health & Wellness': Color(0xFF10B981),
  'Beauty & Care': Color(0xFFEC4899),
  'Home & Decor': Color(0xFFF97316),
  'Accessories': Color(0xFF8B5CF6),
};

class CategoryCardData {
  const CategoryCardData({
    required this.label,
    required this.icon,
    required this.heroImage,
    required this.productCount,
  });

  final String label;
  final IconData icon;
  final String heroImage;
  final int productCount;

  CategoryCardData copyWith({
    String? label,
    IconData? icon,
    String? heroImage,
    int? productCount,
  }) {
    return CategoryCardData(
      label: label ?? this.label,
      icon: icon ?? this.icon,
      heroImage: heroImage ?? this.heroImage,
      productCount: productCount ?? this.productCount,
    );
  }
}
