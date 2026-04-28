import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Future<Map<String, dynamic>>? _reliabilityFuture;
  String? _email;

  @override
  void initState() {
    super.initState();
    _reliabilityFuture = ApiService.getReliabilityScore();
    _loadEmail();
  }

  Future<void> _loadEmail() async {
    final email = await ApiService.getUserId();
    if (mounted) {
      setState(() {
        _email = email;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _reliabilityFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error loading profile: ${snapshot.error}'));
          } else if (!snapshot.hasData) {
            return const Center(child: Text('No profile data available'));
          }

          final data = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 50,
                  child: Icon(Icons.person, size: 50),
                ),
                const SizedBox(height: 16),
                Text(
                  data['name'] ?? 'Unknown Salesman',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                if (_email != null) ...[
                  const SizedBox(height: 8),
                  Text(_email!, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                ],
                const SizedBox(height: 32),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Text(
                          'Reliability Score',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 16),
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              height: 100,
                              width: 100,
                              child: CircularProgressIndicator(
                                value: (data['overall_reliability_score'] ?? 0) / 100,
                                strokeWidth: 8,
                                backgroundColor: Colors.grey[300],
                                color: (data['overall_reliability_score'] ?? 0) >= 70 
                                    ? Colors.green 
                                    : Colors.orange,
                              ),
                            ),
                            Text(
                              '${data['overall_reliability_score'] ?? 0}',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.store),
                  title: const Text('Outlets Covered This Week'),
                  trailing: Text('${data['outlets_covered_this_week'] ?? 0} / ${data['outlets_target_this_week'] ?? 0}'),
                ),
                ListTile(
                  leading: const Icon(Icons.warning, color: Colors.redAccent),
                  title: const Text('Ghost Visit Rate'),
                  trailing: Text('${((data['ghost_visit_rate'] ?? 0) * 100).toStringAsFixed(1)}%'),
                ),
                ListTile(
                  leading: const Icon(Icons.check_circle, color: Colors.green),
                  title: const Text('Collection Confirmation'),
                  trailing: Text('${((data['collection_confirmation_rate'] ?? 0) * 100).toStringAsFixed(1)}%'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
