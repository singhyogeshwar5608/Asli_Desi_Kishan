class Product {
  const Product({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.price,
    required this.totalPrice,
    required this.bv,
    required this.description,
    this.images = const [],
  }) : assert(price <= totalPrice, 'Actual price cannot exceed total price');

  final String id;
  final String title;
  final String imageUrl;
  final double price;
  final double totalPrice;
  final int bv;
  final String description;
  final List<ProductImage> images;

  factory Product.fromJson(Map<String, dynamic> json) {
    final priceValue = json['actualPrice'] ?? json['actual_price'] ?? json['price'] ?? 0;
    final totalPriceValue = json['totalPrice'] ?? json['total_price'] ?? priceValue;
    final parsedImages = (json['images'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map(ProductImage.fromJson)
            .where((image) => image.url.isNotEmpty)
            .toList(growable: false) ??
        const <ProductImage>[];
    final imageUrl = json['imageUrl'] as String? ?? (parsedImages.isNotEmpty ? parsedImages.first.url : '');
    return Product(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title'] as String? ?? json['name'] as String? ?? 'Untitled Product',
      imageUrl: imageUrl,
      price: _parseDouble(priceValue),
      totalPrice: _parseDouble(totalPriceValue),
      bv: _parseDouble(json['bv']).round(),
      description: json['description'] as String? ?? '',
      images: parsedImages,
    );
  }

  Product copyWith({
    String? id,
    String? title,
    String? imageUrl,
    double? price,
    double? totalPrice,
    int? bv,
    String? description,
    List<ProductImage>? images,
  }) {
    return Product(
      id: id ?? this.id,
      title: title ?? this.title,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      totalPrice: totalPrice ?? this.totalPrice,
      bv: bv ?? this.bv,
      description: description ?? this.description,
      images: images ?? this.images,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'imageUrl': imageUrl,
      'actualPrice': price,
      'totalPrice': totalPrice,
      'bv': bv,
      'description': description,
      'images': images.map((image) => image.toJson()).toList(),
    };
  }

  List<String> get galleryImages {
    final gallery = images
        .map((image) => image.url)
        .where((url) => url.isNotEmpty)
        .toList(growable: false);
    if (gallery.isNotEmpty) {
      return gallery;
    }
    return imageUrl.isNotEmpty ? [imageUrl] : const [];
  }

  double get commissionAmount {
    final difference = totalPrice - price;
    return difference > 0 ? difference : 0;
  }

  double get commissionPercent {
    if (totalPrice <= 0 || commissionAmount <= 0) return 0;
    return (commissionAmount / totalPrice) * 100;
  }

  static double _parseDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) {
      return double.tryParse(value) ?? 0;
    }
    return 0;
  }
}

class ProductImage {
  const ProductImage({required this.url, this.alt});

  final String url;
  final String? alt;

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      url: json['url'] as String? ?? '',
      alt: json['alt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url,
        if (alt != null && alt!.isNotEmpty) 'alt': alt,
      };
}
