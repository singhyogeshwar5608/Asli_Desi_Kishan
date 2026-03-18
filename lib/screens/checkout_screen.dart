import 'package:flutter/material.dart';

import '../navigation/checkout_arguments.dart';
import '../state/cart_state.dart';
import 'customer_details_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _PaymentMethodTile extends StatelessWidget {
  const _PaymentMethodTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
    this.badge,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final cardColor = theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white;
    final baseBorder = theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final borderColor = isSelected ? colorScheme.primary : baseBorder;

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: theme.brightness == Brightness.dark
                    ? const Color(0xFF1F2330)
                    : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: baseBorder),
              ),
              child: Icon(icon, color: theme.colorScheme.onSurface.withValues(alpha: 0.7)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ),
                      if (badge != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            badge!,
                            style: const TextStyle(
                              color: Color(0xFF047857),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? colorScheme.primary : theme.colorScheme.onSurface.withValues(alpha: 0.4),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  bool _useWallet = true;
  int _selectedPayment = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final background = isDark ? const Color(0xFF101A22) : const Color(0xFFF6F7F8);
    final cart = CartProvider.of(context);
    final args = ModalRoute.of(context)?.settings.arguments;
    CheckoutArguments? directPurchase;
    ShippingDetailsPayload? shippingDetails;
    if (args is CheckoutArguments) {
      directPurchase = args;
    } else if (args is ShippingDetailsPayload) {
      shippingDetails = args;
    }

    final subtotal = directPurchase != null
        ? directPurchase.product.price * directPurchase.quantity
        : cart.subtotal;
    final tax = directPurchase != null ? subtotal * cart.taxRate : cart.tax;
    final total = subtotal + tax;

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Container(
              color: isDark ? const Color(0xFF0F172A) : background,
              child: Column(
                children: [
                  _CheckoutHeader(onBack: () => Navigator.of(context).maybePop()),
                  Expanded(
                    child: _CheckoutBody(
                      cart: cart,
                      directPurchase: directPurchase,
                      shippingDetails: shippingDetails,
                      useWallet: _useWallet,
                      onToggleWallet: (value) => setState(() => _useWallet = value),
                      selectedPayment: _selectedPayment,
                      onSelectPayment: (value) => setState(() => _selectedPayment = value),
                    ),
                  ),
                  _CheckoutFooter(
                    total: total,
                    onPayNow: () {},
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CheckoutHeader extends StatelessWidget {
  const _CheckoutHeader({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final divider = theme.brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : const Color(0xFFE2E8F0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: (theme.brightness == Brightness.dark
                ? const Color(0xFF0F172A)
                : Colors.white)
            .withValues(alpha: 0.85),
        border: Border(bottom: BorderSide(color: divider)),
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
          _CircleIconButton(icon: Icons.arrow_back, onTap: onBack),
          Expanded(
            child: Text(
              'Checkout',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(width: 40),
        ],
      ),
    );
  }
}

class _CheckoutBody extends StatelessWidget {
  const _CheckoutBody({
    required this.cart,
    this.directPurchase,
    this.shippingDetails,
    required this.useWallet,
    required this.onToggleWallet,
    required this.selectedPayment,
    required this.onSelectPayment,
  });

  final CartState cart;
  final CheckoutArguments? directPurchase;
  final ShippingDetailsPayload? shippingDetails;
  final bool useWallet;
  final ValueChanged<bool> onToggleWallet;
  final int selectedPayment;
  final ValueChanged<int> onSelectPayment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ShippingSection(theme: theme, shippingDetails: shippingDetails),
          const SizedBox(height: 16),
          _OrderSummaryCard(cart: cart, directPurchase: directPurchase),
          const SizedBox(height: 16),
          _WalletCard(useWallet: useWallet, onToggleWallet: onToggleWallet),
          const SizedBox(height: 16),
          const _ImpactReminder(),
          const SizedBox(height: 16),
          _PaymentMethodsSection(
            selectedPayment: selectedPayment,
            onSelectPayment: onSelectPayment,
          ),
        ],
      ),
    );
  }
}

class _ShippingSection extends StatelessWidget {
  const _ShippingSection({required this.theme, this.shippingDetails});

  final ThemeData theme;
  final ShippingDetailsPayload? shippingDetails;

  @override
  Widget build(BuildContext context) {
    final colorScheme = theme.colorScheme;
    final cardColor = theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white;
    final border = theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    final hasDetails = shippingDetails != null;
    final addressLines = hasDetails
        ? [
            shippingDetails!.shippingAddress,
            '${shippingDetails!.city}, ${shippingDetails!.state} ${shippingDetails!.zipCode}',
            'Phone: ${shippingDetails!.primaryPhone}',
            if (shippingDetails!.secondaryPhone != null)
              'Alt: ${shippingDetails!.secondaryPhone}',
          ]
        : ['123 Innovation Drive, Tech City, Suite 400, CA 94103'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Shipping Address',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pushReplacementNamed(CustomerDetailsScreen.routeName),
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 0)),
              child: Text(
                'Edit',
                style: theme.textTheme.labelLarge?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: theme.brightness == Brightness.dark ? 0.15 : 0.04),
                blurRadius: 18,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: colorScheme.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.location_on, color: colorScheme.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hasDetails ? shippingDetails!.fullName : 'Home',
                      style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      addressLines.join('\n'),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OrderSummaryCard extends StatelessWidget {
  const _OrderSummaryCard({required this.cart, this.directPurchase});

  final CartState cart;
  final CheckoutArguments? directPurchase;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardColor = theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white;
    final border = theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final isDirect = directPurchase != null;
    final quantity = isDirect ? directPurchase!.quantity : cart.items.length;
    final itemLabel = '$quantity ${quantity == 1 ? 'Item' : 'Items'}';
    final subtotal = isDirect
        ? directPurchase!.product.price * directPurchase!.quantity
        : cart.subtotal;
    final totalBv = isDirect
        ? directPurchase!.product.bv * directPurchase!.quantity
        : cart.totalBv;
    final tax = isDirect ? subtotal * cart.taxRate : cart.tax;
    final total = subtotal + tax;

    Widget row(String label, String value, {Color? valueColor, FontWeight? weight}) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withValues(alpha: 0.7)),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: valueColor ?? theme.colorScheme.onSurface,
              fontWeight: weight ?? FontWeight.w600,
            ),
          ),
        ],
      );
    }

    String format(double value) => '\$${value.toStringAsFixed(2)}';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: theme.brightness == Brightness.dark ? 0.15 : 0.05),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Order Summary',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: theme.brightness == Brightness.dark
                      ? const Color(0xFF1E293B)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  itemLabel,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          row('Total Business Volume (BV)', '$totalBv BV', valueColor: theme.colorScheme.primary),
          const SizedBox(height: 12),
          row('Subtotal', format(subtotal)),
          const SizedBox(height: 12),
          row('Shipping', 'Free', valueColor: const Color(0xFF10B981)),
          const SizedBox(height: 12),
          row('Tax', format(tax)),
          const SizedBox(height: 12),
          Divider(color: border),
          const SizedBox(height: 12),
          row('Total Price', format(total), valueColor: theme.colorScheme.primary, weight: FontWeight.w700),
        ],
      ),
    );
  }
}

class _WalletCard extends StatelessWidget {
  const _WalletCard({required this.useWallet, required this.onToggleWallet});

  final bool useWallet;
  final ValueChanged<bool> onToggleWallet;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: primary,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.25),
            blurRadius: 30,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Available Wallet Balance',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white.withValues(alpha: 0.8),
                            letterSpacing: 0.4,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '\$3,210.40',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.account_balance_wallet, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Divider(color: Colors.white.withValues(alpha: 0.3)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Use wallet for this payment',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Switch.adaptive(
                    value: useWallet,
                    onChanged: onToggleWallet,
                    thumbColor: WidgetStateProperty.all(primary),
                    trackColor: WidgetStateProperty.all(Colors.white.withValues(alpha: 0.6)),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            right: -40,
            bottom: -40,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ImpactReminder extends StatelessWidget {
  const _ImpactReminder();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: primary.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.trending_up, color: primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text.rich(
              TextSpan(
                text: 'This order will generate ',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: primary,
                  fontWeight: FontWeight.w600,
                  height: 1.5,
                ),
                children: [
                  TextSpan(
                    text: '65 BV ',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  TextSpan(
                    text: 'for your weak leg.',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentMethodsSection extends StatelessWidget {
  const _PaymentMethodsSection({required this.selectedPayment, required this.onSelectPayment});

  final int selectedPayment;
  final ValueChanged<int> onSelectPayment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Other Payment Methods',
          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        Column(
          children: [
            _PaymentMethodTile(
              icon: Icons.credit_card,
              title: 'Credit / Debit Card',
              subtitle: 'Visa, Mastercard, Amex',
              isSelected: selectedPayment == 0,
              onTap: () => onSelectPayment(0),
            ),
            const SizedBox(height: 10),
            _PaymentMethodTile(
              icon: Icons.account_balance,
              title: 'Bank Transfer',
              subtitle: 'Direct deposit',
              isSelected: selectedPayment == 1,
              onTap: () => onSelectPayment(1),
            ),
            const SizedBox(height: 10),
            _PaymentMethodTile(
              icon: Icons.currency_bitcoin,
              title: 'Cryptocurrency',
              subtitle: 'BTC, USDT (TRC20)',
              badge: 'FAST',
              isSelected: selectedPayment == 2,
              onTap: () => onSelectPayment(2),
            ),
          ],
        ),
      ],
    );
  }
}

class _CheckoutFooter extends StatelessWidget {
  const _CheckoutFooter({required this.total, required this.onPayNow});

  final double total;
  final VoidCallback onPayNow;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final divider = theme.brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : const Color(0xFFE2E8F0);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      decoration: BoxDecoration(
        color: theme.brightness == Brightness.dark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(top: BorderSide(color: divider)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Amount',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${total.toStringAsFixed(2)}',
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                    shadowColor: theme.colorScheme.primary.withValues(alpha: 0.35),
                  ),
                  onPressed: onPayNow,
                  child: const Text(
                    'Pay',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock, size: 16),
              const SizedBox(width: 6),
              Text(
                'Secure encrypted checkout'.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
            ],
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

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: theme.brightness == Brightness.dark
              ? Colors.white.withValues(alpha: 0.1)
              : Colors.grey.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon),
      ),
    );
  }
}
