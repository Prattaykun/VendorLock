import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  final Widget child;
  const HomeScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.map), label: 'Beat Plan'),
          NavigationDestination(icon: Icon(Icons.location_on), label: 'Check-In'),
          NavigationDestination(icon: Icon(Icons.shopping_cart), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.payments), label: 'Collections'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/beat-plan');
            case 1: context.go('/checkin');
            case 2: context.go('/order');
            case 3: context.go('/collections');
            case 4: context.go('/profile');
          }
        },
      ),
    );
  }
}
