import 'dart:async';

import 'package:flutter/material.dart';

import '../models/event_media_item.dart';
import '../services/api_client.dart';

class MediaListingScreen extends StatefulWidget {
  const MediaListingScreen({super.key});

  static const routeName = '/media';

  @override
  State<MediaListingScreen> createState() => _MediaListingScreenState();
}

class _MediaListingScreenState extends State<MediaListingScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ApiClient _apiClient = ApiClient.instance;

  List<EventMediaItem> _rawItems = const [];
  PaginationMeta? _meta;
  String _searchQuery = '';
  Set<String> _selectedCategories = {};
  Timer? _searchDebounce;
  bool _isLoading = true;
  bool _isError = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _loadMedia(initial: true);
  }

  @override
  void dispose() {
    _searchController
      ..removeListener(_onSearchChanged)
      ..dispose();
    _searchDebounce?.cancel();
    super.dispose();
  }

  List<EventMediaItem> get _filteredItems {
    final query = _searchQuery.toLowerCase();
    return _rawItems.where((item) {
      final matchesSearch = query.isEmpty || item.title.toLowerCase().contains(query);
      final matchesCategory = _selectedCategories.isEmpty || _selectedCategories.contains(item.categoryLabel);
      return matchesSearch && matchesCategory;
    }).toList();
  }

  Set<String> get _availableCategories {
    final derived = _rawItems.map((item) => item.categoryLabel.trim()).where((value) => value.isNotEmpty).toSet();
    if (derived.isNotEmpty) return derived;
    return {
      'Agriculture',
      'CSR',
      'Footwear',
      'Home Delivery',
      'KeySoul',
      'Product Insider',
    };
  }

  void _onSearchChanged() {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 320), () {
      if (!mounted) return;
      setState(() => _searchQuery = _searchController.text.trim());
      _loadMedia();
    });
  }

  Future<void> _loadMedia({bool initial = false}) async {
    if (initial) {
      setState(() {
        _isLoading = true;
        _isError = false;
        _errorMessage = null;
      });
    } else {
      setState(() {
        _isError = false;
        _errorMessage = null;
      });
    }

    try {
      final response = await _apiClient.fetchEventMedia(
        page: 1,
        limit: 50,
        search: _searchQuery.isEmpty ? null : _searchQuery,
        sort: 'recent',
      );
      if (!mounted) return;
      setState(() {
        _rawItems = response.items;
        _meta = response.meta;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _isError = true;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _openFilters() async {
    final categories = _availableCategories.toList()..sort();
    final result = await showModalBottomSheet<Set<String>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final tempSelection = {..._selectedCategories};
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return SafeArea(
              child: Padding(
                padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 20, 24, 12),
                      child: Row(
                        children: [
                          const Expanded(
                            child: Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    SizedBox(
                      height: 320,
                      child: Row(
                        children: [
                          Container(
                            width: 120,
                            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.06),
                              borderRadius: const BorderRadius.only(topLeft: Radius.circular(24)),
                            ),
                            child: const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Categories', style: TextStyle(fontWeight: FontWeight.w700)),
                                SizedBox(height: 8),
                                Text('Choose segments', style: TextStyle(fontSize: 12, color: Colors.black54)),
                              ],
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              itemCount: categories.length,
                              itemBuilder: (context, index) {
                                final category = categories[index];
                                final checked = tempSelection.contains(category);
                                return CheckboxListTile(
                                  value: checked,
                                  title: Text(category),
                                  onChanged: (value) {
                                    setSheetState(() {
                                      if (value == true) {
                                        tempSelection.add(category);
                                      } else {
                                        tempSelection.remove(category);
                                      }
                                    });
                                  },
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
                      child: Row(
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              setSheetState(() => tempSelection.clear());
                            },
                            icon: const Icon(Icons.restart_alt),
                            label: const Text('Reset'),
                          ),
                          const Spacer(),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              shape: const StadiumBorder(),
                              backgroundColor: const Color(0xFF2563EB),
                              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                            ),
                            onPressed: () => Navigator.of(context).pop(tempSelection),
                            child: const Text('Apply'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );

    if (result != null) {
      setState(() => _selectedCategories = result);
    }
  }

  void _resetFilters() {
    setState(() => _selectedCategories.clear());
  }

  void _openMediaPreview(EventMediaItem item) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          insetPadding: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(item.thumbOrFile ?? item.fileUrl, fit: BoxFit.cover),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(item.title, style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = _filteredItems;
    final totalCount = _meta?.total ?? _rawItems.length;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).maybePop(),
                        icon: const Icon(Icons.arrow_back_ios_new_rounded),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Media', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text('$totalCount Items found', style: const TextStyle(color: Colors.black54)),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _openFilters,
                        icon: const Icon(Icons.filter_list_rounded),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search by name',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _isLoading
                  ? ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: 4,
                      itemBuilder: (_, index) => Container(
                            height: 220,
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                    )
                  : _isError
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.wifi_off, size: 42, color: Colors.redAccent),
                                const SizedBox(height: 12),
                                Text(
                                  'Unable to load media',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _errorMessage ?? 'Please check your connection and try again.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: Colors.black54),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: () => _loadMedia(initial: true),
                                  child: const Text('Retry'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: () => _loadMedia(initial: true),
                          child: ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                            itemCount: items.length,
                            itemBuilder: (context, index) {
                              final item = items[index];
                              return GestureDetector(
                                onTap: () => _openMediaPreview(item),
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(18),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Color(0x14000000),
                                        blurRadius: 16,
                                        offset: Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Stack(
                                        children: [
                                          ClipRRect(
                                            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                                            child: AspectRatio(
                                              aspectRatio: 16 / 9,
                                              child: Image.network(item.thumbOrFile ?? item.fileUrl, fit: BoxFit.cover),
                                            ),
                                          ),
                                          if (item.isVideo)
                                            Positioned.fill(
                                              child: Center(
                                                child: Container(
                                                  width: 52,
                                                  height: 52,
                                                  decoration: const BoxDecoration(
                                                    color: Colors.white,
                                                    shape: BoxShape.circle,
                                                    boxShadow: [
                                                      BoxShadow(
                                                        color: Color(0x22000000),
                                                        blurRadius: 12,
                                                      ),
                                                    ],
                                                  ),
                                                  child: const Icon(Icons.play_arrow_rounded, size: 32),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              item.title,
                                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                                            ),
                                            if (item.categoryLabel.isNotEmpty)
                                              Padding(
                                                padding: const EdgeInsets.only(top: 4),
                                                child: Text(
                                                  item.categoryLabel,
                                                  style: const TextStyle(fontSize: 12, color: Colors.black54),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: _selectedCategories.isEmpty
          ? null
          : Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        shape: const StadiumBorder(),
                        backgroundColor: Colors.grey.shade200,
                        foregroundColor: Colors.black87,
                      ),
                      onPressed: _resetFilters,
                      icon: const Icon(Icons.restart_alt),
                      label: const Text('Reset filters'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
