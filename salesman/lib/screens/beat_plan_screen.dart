import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BeatPlanScreen extends StatefulWidget {
  const BeatPlanScreen({super.key});

  @override
  State<BeatPlanScreen> createState() => _BeatPlanScreenState();
}

class _BeatPlanScreenState extends State<BeatPlanScreen> {
  Future<Map<String, dynamic>>? _beatPlanFuture;

  @override
  void initState() {
    super.initState();
    _beatPlanFuture = ApiService.getBeatPlan();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Today's Beat Plan")),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _beatPlanFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData) {
            return const Center(child: Text('No beat plan available'));
          }

          final data = snapshot.data!;
          final stops = data['stops'] as List<dynamic>? ?? [];

          if (stops.isEmpty) {
            return const Center(
              child: Text(
                'No stores to visit today!',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            );
          }

          return ListView.builder(
            itemCount: stops.length,
            itemBuilder: (context, index) {
              final stop = stops[index];
              return ListTile(
                leading: CircleAvatar(child: Text(stop['priority'].toString())),
                title: Text(stop['outlet_name'] ?? 'Unknown Outlet'),
                subtitle: Text('ID: ${stop['outlet_id']}'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {
                  // Navigate to check-in or details
                },
              );
            },
          );
        },
      ),
    );
  }
}
