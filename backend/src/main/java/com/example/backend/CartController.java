package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartItemRepository repository;

    @GetMapping("/debug")
    public List<CartItem> getAllItems() {
        return repository.findAll();
    }

    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable String userId) {
        return repository.findByUserId(userId);
    }

    @PostMapping("/{userId}")
    public CartItem addToCart(@PathVariable String userId, @RequestBody CartItem item) {
        String productId = item.getProductId();
        
        if (productId == null || productId.equals("undefined") || productId.isEmpty()) {
            throw new IllegalArgumentException("Invalid productId: " + productId);
        }
        
        // Handle potential duplicates in DB by finding all and merging
        List<CartItem> existingItems = repository.findByUserId(userId).stream()
            .filter(i -> productId.equals(i.getProductId()))
            .toList();

        if (!existingItems.isEmpty()) {
            // Use the first one as primary
            CartItem primary = existingItems.get(0);
            
            // Sum up quantities if there are multiple (cleanup)
            int totalQuantity = existingItems.stream().mapToInt(CartItem::getQuantity).sum();
            
            if (item.getQuantity() > 0) {
                primary.setQuantity(item.getQuantity());
            } else {
                primary.setQuantity(totalQuantity + 1);
            }
            
            // Delete all except primary to clean up duplicates
            for (int i = 1; i < existingItems.size(); i++) {
                repository.delete(existingItems.get(i));
            }
            
            return repository.save(primary);
        }
        
        item.setUserId(userId);
        return repository.save(item);
    }

    @DeleteMapping("/{userId}/{productId}")
    public void removeFromCart(@PathVariable String userId, @PathVariable String productId) {
        if (productId == null || productId.equals("undefined") || productId.isEmpty()) {
            return;
        }
        // Delete all instances of this product for this user to be safe
        List<CartItem> itemsToDelete = repository.findByUserId(userId).stream()
            .filter(i -> productId.equals(i.getProductId()))
            .toList();
            
        if (!itemsToDelete.isEmpty()) {
            repository.deleteAll(itemsToDelete);
        }
    }

    @DeleteMapping("/{userId}/clear")
    public void clearCart(@PathVariable String userId) {
        // Find all and delete to ensure proper transaction if needed, 
        // or just use repository.deleteByUserId if configured.
        List<CartItem> items = repository.findByUserId(userId);
        repository.deleteAll(items);
    }
}
