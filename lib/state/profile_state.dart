import 'package:flutter/widgets.dart';

class ProfileData {
  const ProfileData({
    required this.name,
    required this.email,
    required this.phone,
    required this.address,
    required this.city,
    required this.state,
    required this.partnerId,
    required this.membershipTier,
    required this.photoUrl,
    required this.followers,
    required this.following,
    required this.level,
    required this.totalIncome,
    required this.incomeGoal,
    required this.monthlyGrowthPercent,
    this.photoPublicId,
  });

  final String name;
  final String email;
  final String phone;
  final String address;
  final String city;
  final String state;
  final String partnerId;
  final String membershipTier;
  final String photoUrl;
  final int followers;
  final int following;
  final String level;
  final double totalIncome;
  final double incomeGoal;
  final double monthlyGrowthPercent;
  final String? photoPublicId;

  ProfileData copyWith({
    String? name,
    String? email,
    String? phone,
    String? address,
    String? city,
    String? state,
    String? partnerId,
    String? membershipTier,
    String? photoUrl,
    int? followers,
    int? following,
    String? level,
    double? totalIncome,
    double? incomeGoal,
    double? monthlyGrowthPercent,
    String? photoPublicId,
  }) {
    return ProfileData(
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      partnerId: partnerId ?? this.partnerId,
      membershipTier: membershipTier ?? this.membershipTier,
      photoUrl: photoUrl ?? this.photoUrl,
      followers: followers ?? this.followers,
      following: following ?? this.following,
      level: level ?? this.level,
      totalIncome: totalIncome ?? this.totalIncome,
      incomeGoal: incomeGoal ?? this.incomeGoal,
      monthlyGrowthPercent: monthlyGrowthPercent ?? this.monthlyGrowthPercent,
      photoPublicId: photoPublicId ?? this.photoPublicId,
    );
  }
}

class ProfileState extends ChangeNotifier {
  ProfileData _data = const ProfileData(
    name: 'Arlene McCoy',
    email: 'arlene.mccoy@example.com',
    phone: '+1 555-012-3456',
    address: '1901 Thornridge Cir, Shiloh, Hawaii',
    city: 'Newark',
    state: 'New Jersey',
    partnerId: 'NP-482913',
    membershipTier: 'Elite Member',
    photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBkGg5hb6MSFFq_WMlPLhfreQ0dvqR4miXizxkvnruDwFGXSIBoGhVn93JSL55IqweqUeTowePDogpC9WRqPEfYRx4LmwcjWFD7BFb2tHkmwO0RwEtpqFJbDWKSnIVDYEO--avoyYYwgNNVZVL8hobUs6W21fNMGjWrW3ePK1ESmmyAq42-8EL09SeI_3A1fP8SXWhYKnzV1NkWWOiSnrsOGTnqs8QH656E585bK-NbnseGjKWC16jRzU-F0TERUnfbG59gTF4FlwA',
    followers: 1520,
    following: 980,
    level: 'Elite',
    totalIncome: 12450.00,
    incomeGoal: 15000.00,
    monthlyGrowthPercent: 12.5,
    photoPublicId: null,
  );

  ProfileData get data => _data;

  void update(ProfileData data) {
    _data = data;
    notifyListeners();
  }

  void updateFields({
    String? name,
    String? email,
    String? phone,
    String? address,
    String? city,
    String? state,
    String? partnerId,
    String? membershipTier,
    String? photoUrl,
    String? photoPublicId,
    int? followers,
    int? following,
    String? level,
    double? totalIncome,
    double? incomeGoal,
    double? monthlyGrowthPercent,
  }) {
    _data = _data.copyWith(
      name: name,
      email: email,
      phone: phone,
      address: address,
      city: city,
      state: state,
      partnerId: partnerId,
      membershipTier: membershipTier,
      photoUrl: photoUrl,
      photoPublicId: photoPublicId,
      followers: followers,
      following: following,
      level: level,
      totalIncome: totalIncome,
      incomeGoal: incomeGoal,
      monthlyGrowthPercent: monthlyGrowthPercent,
    );
    notifyListeners();
  }

  void updateFromMemberPayload(Map<String, dynamic> member) {
    double? toDouble(dynamic value) {
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value);
      return null;
    }

    final wallet = member['wallet'];
    final stats = member['stats'];
    updateFields(
      name: member['fullName'] as String?,
      email: member['email'] as String?,
      phone: member['phone'] as String?,
      partnerId: member['memberId'] as String?,
      membershipTier: member['role'] as String?,
      level: member['role'] as String?,
      totalIncome: wallet is Map<String, dynamic> ? toDouble(wallet['totalEarned']) : null,
      incomeGoal: wallet is Map<String, dynamic> ? toDouble(wallet['totalEarned']) : null,
      monthlyGrowthPercent: stats is Map<String, dynamic> ? toDouble(stats['teamSize']) : null,
    );
  }
}

class ProfileProvider extends InheritedNotifier<ProfileState> {
  const ProfileProvider({super.key, required ProfileState notifier, required super.child}) : super(notifier: notifier);

  static ProfileState of(BuildContext context, {bool listen = true}) {
    if (listen) {
      final provider = context.dependOnInheritedWidgetOfExactType<ProfileProvider>();
      assert(provider != null, 'No ProfileProvider found in context');
      return provider!.notifier!;
    }
    final element = context.getElementForInheritedWidgetOfExactType<ProfileProvider>();
    assert(element != null, 'No ProfileProvider found in context');
    final provider = element!.widget as ProfileProvider;
    return provider.notifier!;
  }
}
