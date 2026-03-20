import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'screens/add_funds_screen.dart';
import 'screens/binary_tree_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/customer_details_screen.dart';
import 'screens/home_screen.dart';
import 'screens/all_products_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/profile_edit_screen.dart';
import 'screens/my_team_screen.dart';
import 'screens/member_detail_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/wallet_screen.dart';
import 'screens/withdraw_screen.dart';
import 'screens/transactions_screen.dart';
import 'screens/wishlist_screen.dart';
import 'screens/register_member_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/menu_screen.dart';
import 'screens/media_listing_screen.dart';
import 'screens/adk_events_screen.dart';
import 'screens/product_catalogue_screen.dart';
import 'state/product_catalog_state.dart';
import 'state/theme_controller.dart';
import 'state/cart_state.dart';
import 'state/profile_state.dart';
import 'state/wishlist_state.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  runApp(const NetShopApp());
}

class NetShopApp extends StatefulWidget {
  const NetShopApp({super.key});

  @override
  State<NetShopApp> createState() => _NetShopAppState();
}

class _NetShopAppState extends State<NetShopApp> {
  late final CartState _cartState;
  late final ProfileState _profileState;
  late final WishlistState _wishlistState;
  late final ThemeController _themeController;
  late final ProductCatalogState _productCatalogState;

  @override
  void initState() {
    super.initState();
    _cartState = CartState();
    _profileState = ProfileState();
    _wishlistState = WishlistState();
    _themeController = ThemeController();
    _productCatalogState = ProductCatalogState();
  }

  @override
  void dispose() {
    _cartState.dispose();
    _profileState.dispose();
    _wishlistState.dispose();
    _themeController.dispose();
    _productCatalogState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CartProvider(
      notifier: _cartState,
      child: ProfileProvider(
        notifier: _profileState,
        child: WishlistProvider(
          notifier: _wishlistState,
          child: ProductCatalogProvider(
            notifier: _productCatalogState,
            child: ThemeControllerProvider(
              notifier: _themeController,
              child: AnimatedBuilder(
                animation: _themeController,
                builder: (context, _) => MaterialApp(
                  title: 'NetShop Partner Portal',
                  debugShowCheckedModeBanner: false,
                  theme: AppTheme.lightTheme,
                  darkTheme: AppTheme.darkTheme,
                  themeMode: _themeController.mode,
                  home: const HomeScreen(),
                  routes: {
                    '/cart': (_) => const CartScreen(),
                    '/checkout': (_) => const CheckoutScreen(),
                    BinaryTreeScreen.routeName: (_) => const BinaryTreeScreen(),
                    WalletScreen.routeName: (_) => const WalletScreen(),
                    AddFundsScreen.routeName: (_) => const AddFundsScreen(),
                    WithdrawScreen.routeName: (_) => const WithdrawScreen(),
                    ProfileScreen.routeName: (_) => const ProfileScreen(),
                    ProfileEditScreen.routeName: (_) => const ProfileEditScreen(),
                    TransactionsScreen.routeName: (_) => const TransactionsScreen(),
                    WishlistScreen.routeName: (_) => const WishlistScreen(),
                    AllProductsScreen.routeName: (_) => const AllProductsScreen(),
                    CustomerDetailsScreen.routeName: (_) => const CustomerDetailsScreen(),
                    NotificationsScreen.routeName: (_) => const NotificationsScreen(),
                    MyTeamScreen.routeName: (_) => const MyTeamScreen(),
                    RegisterMemberScreen.routeName: (_) => const RegisterMemberScreen(),
                    MemberDetailScreen.routeName: (_) => const MemberDetailScreen(),
                    SettingsScreen.routeName: (_) => const SettingsScreen(),
                    MenuScreen.routeName: (_) => const MenuScreen(),
                    MediaListingScreen.routeName: (_) => const MediaListingScreen(),
                    AdkEventsScreen.routeName: (_) => const AdkEventsScreen(),
                    ProductCatalogueScreen.routeName: (_) => const ProductCatalogueScreen(),
                    LoginScreen.routeName: (_) => const LoginScreen(),
                    SignupScreen.routeName: (_) => const SignupScreen(),
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
