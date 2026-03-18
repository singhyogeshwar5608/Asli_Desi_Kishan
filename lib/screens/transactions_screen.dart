import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  static const routeName = '/transactions';

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedType = 'All';
  String _selectedDateRange = 'All';
  String _selectedStatus = 'All';
  final Set<String> _expandedTransactions = <String>{};

  final List<_TransactionRecord> _records = [
    _TransactionRecord(
      id: 'TXN-981245',
      description: 'Money added via UPI',
      dateTime: DateTime.now().subtract(const Duration(hours: 2)),
      type: 'Money Added',
      status: TransactionStatus.success,
      amount: 500.00,
      isCredit: true,
      previousBalance: 2810.40,
    ),
    _TransactionRecord(
      id: 'TXN-981112',
      description: 'Withdrawal to bank',
      dateTime: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      type: 'Withdrawals',
      status: TransactionStatus.pending,
      amount: 300.00,
      isCredit: false,
      previousBalance: 3310.40,
    ),
    _TransactionRecord(
      id: 'TXN-980930',
      description: 'Cashback earned on purchase',
      dateTime: DateTime.now().subtract(const Duration(days: 2, hours: 5)),
      type: 'Cashback Earned',
      status: TransactionStatus.success,
      amount: 42.75,
      isCredit: true,
      previousBalance: 3250.65,
    ),
    _TransactionRecord(
      id: 'TXN-980722',
      description: 'Refund processed',
      dateTime: DateTime.now().subtract(const Duration(days: 3, hours: 6)),
      type: 'Refunds',
      status: TransactionStatus.success,
      amount: 199.00,
      isCredit: true,
      previousBalance: 3051.65,
    ),
    _TransactionRecord(
      id: 'TXN-980468',
      description: 'Compliance charge',
      dateTime: DateTime.now().subtract(const Duration(days: 4, hours: 2)),
      type: 'Money Deducted',
      status: TransactionStatus.failed,
      amount: 50.00,
      isCredit: false,
      previousBalance: 3201.65,
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final background = isDark ? AppColors.backgroundDark : AppColors.backgroundLight;

    final filtered = _records.where((record) {
      final matchesType = _selectedType == 'All' || record.type == _selectedType;
      final matchesStatus = _selectedStatus == 'All' || record.status.label == _selectedStatus;

      final matchesSearch = _searchController.text.trim().isEmpty
          ? true
          : record.id.toLowerCase().contains(_searchController.text.trim().toLowerCase());

      final now = DateTime.now();
      bool matchesDate = true;
      if (_selectedDateRange == 'Today') {
        matchesDate = record.dateTime.year == now.year &&
            record.dateTime.month == now.month &&
            record.dateTime.day == now.day;
      } else if (_selectedDateRange == 'Last 7 days') {
        matchesDate = now.difference(record.dateTime).inDays <= 7;
      } else if (_selectedDateRange == 'Last 30 days') {
        matchesDate = now.difference(record.dateTime).inDays <= 30;
      }

      return matchesType && matchesStatus && matchesSearch && matchesDate;
    }).toList();

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = constraints.maxWidth >= 1024
                ? 72.0
                : constraints.maxWidth >= 768
                    ? 56.0
                    : constraints.maxWidth >= 540
                        ? 32.0
                        : 16.0;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _TransactionsHeader(theme: theme),
                Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(horizontalPadding, 20, horizontalPadding, 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _BalanceSnapshotCard(records: _records),
                        const SizedBox(height: 20),
                        _FilterPanel(
                          searchController: _searchController,
                          selectedType: _selectedType,
                          selectedStatus: _selectedStatus,
                          selectedDateRange: _selectedDateRange,
                          onTypeChanged: (value) => setState(() => _selectedType = value),
                          onStatusChanged: (value) => setState(() => _selectedStatus = value),
                          onDateRangeChanged: (value) => setState(() => _selectedDateRange = value),
                          onSearchChanged: (value) => setState(() {}),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Wallet history',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 12),
                        ..._buildHistoryList(filtered),
                        if (filtered.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.08)),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.receipt_long, size: 36, color: theme.colorScheme.primary),
                                const SizedBox(height: 12),
                                Text('No transactions match your filters', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text(
                                  'Try adjusting the date range, status, or search query to see wallet history.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.7)),
                                ),
                              ],
                            ),
                          ),
                      ],
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

  List<Widget> _buildHistoryList(List<_TransactionRecord> records) {
    if (records.isEmpty) {
      return const [];
    }

    final widgets = <Widget>[];
    for (var i = 0; i < records.length; i++) {
      final record = records[i];
      final expanded = _expandedTransactions.contains(record.id);
      widgets.add(
        _TransactionCard(
          record: record,
          expanded: expanded,
          onToggle: () {
            setState(() {
              if (expanded) {
                _expandedTransactions.remove(record.id);
              } else {
                _expandedTransactions.add(record.id);
              }
            });
          },
        ),
      );
      if (i != records.length - 1) {
        widgets.add(const SizedBox(height: 12));
      }
    }

    return widgets;
  }
}

class _TransactionsHeader extends StatelessWidget {
  const _TransactionsHeader({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _CircleIconButton(icon: Icons.arrow_back, onTap: () => Navigator.of(context).maybePop()),
          Expanded(
            child: Text(
              'Transaction history',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          _CircleIconButton(icon: Icons.download_outlined, onTap: () {}),
        ],
      ),
    );
  }
}

class _FilterPanel extends StatelessWidget {
  const _FilterPanel({
    required this.searchController,
    required this.selectedType,
    required this.selectedDateRange,
    required this.selectedStatus,
    required this.onTypeChanged,
    required this.onDateRangeChanged,
    required this.onStatusChanged,
    required this.onSearchChanged,
  });

  final TextEditingController searchController;
  final String selectedType;
  final String selectedDateRange;
  final String selectedStatus;
  final ValueChanged<String> onTypeChanged;
  final ValueChanged<String> onDateRangeChanged;
  final ValueChanged<String> onStatusChanged;
  final ValueChanged<String> onSearchChanged;

  static const _types = [
    'All',
    'Money Added',
    'Withdrawals',
    'Refunds',
    'Cashback Earned',
    'Money Deducted',
  ];

  static const _statuses = ['All', 'Success', 'Pending', 'Failed'];
  static const _dateRanges = ['All', 'Today', 'Last 7 days', 'Last 30 days'];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: searchController,
            decoration: InputDecoration(
              hintText: 'Search by transaction ID',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: searchController.text.isEmpty
                  ? null
                  : IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        searchController.clear();
                        onSearchChanged('');
                      },
                    ),
            ),
            onChanged: onSearchChanged,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _types
                .map(
                  (type) => FilterChip(
                    label: Text(type),
                    selected: selectedType == type,
                    onSelected: (_) => onTypeChanged(type),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              Widget buildFilterColumn({
                required String label,
                required String value,
                required List<String> options,
                required ValueChanged<String?> onChanged,
              }) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: value,
                      items: options.map((option) => DropdownMenuItem(value: option, child: Text(option))).toList(),
                      onChanged: onChanged,
                      decoration: const InputDecoration(),
                    ),
                  ],
                );
              }

              final dateColumn = buildFilterColumn(
                label: 'Date range',
                value: selectedDateRange,
                options: _dateRanges,
                onChanged: (value) => onDateRangeChanged(value ?? 'All'),
              );

              final statusColumn = buildFilterColumn(
                label: 'Status',
                value: selectedStatus,
                options: _statuses,
                onChanged: (value) => onStatusChanged(value ?? 'All'),
              );

              if (constraints.maxWidth < 360) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    dateColumn,
                    const SizedBox(height: 12),
                    statusColumn,
                  ],
                );
              }

              return Row(
                children: [
                  Expanded(child: dateColumn),
                  const SizedBox(width: 12),
                  Expanded(child: statusColumn),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _BalanceSnapshotCard extends StatelessWidget {
  const _BalanceSnapshotCard({required this.records});

  final List<_TransactionRecord> records;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final gradient = isDark
        ? const [Color(0xFF0B1220), Color(0xFF101A22)]
        : const [Color(0xFFE0F2FF), Colors.white];

    final latestBalance = records.first.resultingBalance;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Current balance', style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w700, letterSpacing: 0.8)),
          const SizedBox(height: 6),
          Text(
            '₹${latestBalance.toStringAsFixed(2)}',
            style: theme.textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _MiniStat(
                  label: 'Last transaction',
                  value: records.first.isCredit ? '+₹${records.first.amount.toStringAsFixed(2)}' : '-₹${records.first.amount.toStringAsFixed(2)}',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MiniStat(
                  label: 'Previous balance',
                  value: '₹${records.first.previousBalance.toStringAsFixed(2)}',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

class _TransactionCard extends StatelessWidget {
  const _TransactionCard({required this.record, required this.expanded, required this.onToggle});

  final _TransactionRecord record;
  final bool expanded;
  final VoidCallback onToggle;

  Color _statusColor(TransactionStatus status) {
    switch (status) {
      case TransactionStatus.success:
        return const Color(0xFF22C55E);
      case TransactionStatus.pending:
        return const Color(0xFFF97316);
      case TransactionStatus.failed:
        return const Color(0xFFEF4444);
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'Money Added':
        return Icons.download_done_rounded;
      case 'Withdrawals':
        return Icons.upload_rounded;
      case 'Refunds':
        return Icons.refresh_rounded;
      case 'Cashback Earned':
        return Icons.card_giftcard;
      case 'Money Deducted':
        return Icons.receipt_long;
      default:
        return Icons.swap_horiz_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final statusColor = _statusColor(record.status);
    final balanceChange = record.isCredit ? '+₹${record.amount.toStringAsFixed(2)}' : '-₹${record.amount.toStringAsFixed(2)}';

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.04)),
          boxShadow: [
            if (!isDark)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 18,
                offset: const Offset(0, 10),
              ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(_typeIcon(record.type), color: statusColor),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(record.type, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        record.description,
                        style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.65)),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    record.status.label,
                    style: theme.textTheme.labelSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            AnimatedCrossFade(
              firstChild: const SizedBox.shrink(),
              secondChild: Column(
                children: [
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _MiniStat(label: 'Amount', value: balanceChange),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MiniStat(label: 'Balance after', value: '₹${record.resultingBalance.toStringAsFixed(2)}'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Date', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                            const SizedBox(height: 4),
                            Text(record.formattedDate, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Time', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                            const SizedBox(height: 4),
                            Text(record.formattedTime, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Transaction ID', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                            const SizedBox(height: 4),
                            Text(record.id, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Previous balance', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.6))),
                            const SizedBox(height: 4),
                            Text('₹${record.previousBalance.toStringAsFixed(2)}',
                                style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              crossFadeState: expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
            ),
          ],
        ),
      ),
    );
  }
}

class _TransactionRecord {
  _TransactionRecord({
    required this.id,
    required this.description,
    required this.dateTime,
    required this.type,
    required this.status,
    required this.amount,
    required this.isCredit,
    required this.previousBalance,
  });

  final String id;
  final String description;
  final DateTime dateTime;
  final String type;
  final TransactionStatus status;
  final double amount;
  final bool isCredit;
  final double previousBalance;

  double get resultingBalance => isCredit ? previousBalance + amount : previousBalance - amount;

  String get formattedDate => '${_twoDigits(dateTime.day)} ${_monthName(dateTime.month)} ${dateTime.year}';
  String get formattedTime => '${_twoDigits(dateTime.hour)}:${_twoDigits(dateTime.minute)}';

  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  String _twoDigits(int value) => value.toString().padLeft(2, '0');
}

enum TransactionStatus { success, pending, failed }

extension on TransactionStatus {
  String get label {
    switch (this) {
      case TransactionStatus.success:
        return 'Success';
      case TransactionStatus.pending:
        return 'Pending';
      case TransactionStatus.failed:
        return 'Failed';
    }
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          height: 40,
          width: 40,
          child: Icon(icon),
        ),
      ),
    );
  }
}
