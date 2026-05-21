package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository repository;

    @Autowired
    private CartItemRepository cartRepository;

    @Autowired
    private CoffeeItemRepository coffeeItemRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return repository.findAll();
    }

    @PostMapping("/{userId}")
    public Order placeOrder(@PathVariable String userId, @RequestBody Order order) {
        // Validate and deduct stock for each item in the order
        if (order.getItems() != null) {
            for (CartItem item : order.getItems()) {
                String productId = item.getProductId();
                Optional<CoffeeItem> coffeeItemOpt = Optional.empty();
                if (productId != null) {
                    coffeeItemOpt = coffeeItemRepository.findById(productId);
                }
                if (coffeeItemOpt.isEmpty() && item.getName() != null) {
                    // Fallback search by name
                    List<CoffeeItem> itemsByName = coffeeItemRepository.findAll();
                    for (CoffeeItem ci : itemsByName) {
                        if (ci.getName().equalsIgnoreCase(item.getName())) {
                            coffeeItemOpt = Optional.of(ci);
                            break;
                        }
                    }
                }

                if (coffeeItemOpt.isPresent()) {
                    CoffeeItem coffeeItem = coffeeItemOpt.get();
                    int currentStock = coffeeItem.getStockQuantity() != null ? coffeeItem.getStockQuantity() : 0;
                    int requestedQty = item.getQuantity();
                    int newStock = Math.max(0, currentStock - requestedQty);
                    
                    coffeeItem.setStockQuantity(newStock);
                    if (newStock <= 0) {
                        coffeeItem.setAvailable(false);
                    }
                    coffeeItemRepository.save(coffeeItem);
                }
            }
        }

        order.setUserId(userId);
        Order savedOrder = repository.save(order);
        
        // Clear cart after successful order
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(cartItems);
        
        return savedOrder;
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable String userId) {
        return repository.findByUserId(userId);
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Optional<Order> orderOptional = repository.findById(id);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            order.setStatus(payload.get("status"));
            return repository.save(order);
        }
        throw new RuntimeException("Order not found with id: " + id);
    }
}
