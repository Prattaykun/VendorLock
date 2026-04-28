import 'package:flutter/material.dart';
import '../services/api_service.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key});

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final _retailerIdController = TextEditingController();
  final _skuController = TextEditingController();
  final _quantityController = TextEditingController();
  bool _isLoading = false;

  Future<void> _submitOrder() async {
    setState(() => _isLoading = true);
    try {
      final orderData = {
        "retailer_id": _retailerIdController.text,
        "items": [
          {
            "sku_id": _skuController.text,
            "product_name": "Sample Product",
            "quantity": int.tryParse(_quantityController.text) ?? 1,
            "unit_price": 100.0,
          }
        ],
        "payment_type": "credit",
        "channel": "dashboard"
      };

      await ApiService.createOrder(orderData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order created successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Capture Order')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _retailerIdController,
              decoration: const InputDecoration(labelText: 'Retailer ID'),
            ),
            TextField(
              controller: _skuController,
              decoration: const InputDecoration(labelText: 'SKU ID'),
            ),
            TextField(
              controller: _quantityController,
              decoration: const InputDecoration(labelText: 'Quantity'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitOrder,
                child: _isLoading 
                    ? const CircularProgressIndicator()
                    : const Text('Submit Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
