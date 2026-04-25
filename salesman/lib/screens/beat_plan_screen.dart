import 'package:flutter/material.dart';

class BeatPlanScreen extends StatelessWidget {
  const BeatPlanScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Today's Beat Plan")),
      body: const Center(child: Text('Beat Plan — TODO: load from API')),
    );
  }
}
