package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class CoffeeMenuController {

    private static final Logger logger = LoggerFactory.getLogger(CoffeeMenuController.class);

    @Autowired
    private CoffeeItemRepository repository;

    // Hardcoded fallback menu for immediate display when DB is unreachable
    private static final List<CoffeeItem> FALLBACK_MENU = List.of(
            new CoffeeItem("f1", "Classic Espresso", "Rich and bold single shot of espresso roasted to perfection.", 3.50, "Hot", "/menu/classic-espresso.jpg"),
            new CoffeeItem("f2", "Velvet Latte", "Smooth steamed milk with a double shot of espresso and silky foam.", 4.50, "Hot", "/menu/velvet-latte.jpg"),
            new CoffeeItem("f3", "Iced Caramel Macchiato", "Layers of espresso, cold milk, and artisan caramel over ice.", 5.50, "Cold", "/menu/classic-espresso.jpg"),
            new CoffeeItem("f4", "Hazelnut Mocha", "A premium blend of dark chocolate, espresso, and roasted hazelnut.", 4.75, "Hot", "/menu/velvet-latte.jpg"),
            new CoffeeItem("f5", "Cold Brew", "Slow-steeped for 24 hours for an incredibly smooth, low-acid finish.", 4.00, "Cold", "/menu/classic-espresso.jpg")
    );

    @GetMapping
    public List<CoffeeItem> getMenu() {
        try {
            List<CoffeeItem> menu = repository.findAll();
            if (menu.isEmpty()) {
                logger.info("Database is empty, serving fallback menu.");
                return FALLBACK_MENU;
            }
            return menu;
        } catch (Exception e) {
            logger.error("Database connection failed. Serving fallback menu. Error: {}", e.getMessage());
            return FALLBACK_MENU;
        }
    }

    @PostMapping
    public CoffeeItem addMenuItem(@RequestBody CoffeeItem item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public CoffeeItem updateMenuItem(@PathVariable String id, @RequestBody CoffeeItem item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable String id) {
        repository.deleteById(id);
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<?> reconcileStock(@PathVariable String id, @RequestBody Map<String, Integer> payload) {
        Optional<CoffeeItem> itemOpt = repository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CoffeeItem item = itemOpt.get();
        int actualCount = payload.getOrDefault("actualCount", 0);
        int currentStock = item.getStockQuantity() != null ? item.getStockQuantity() : 0;
        int initialEst = item.getInitialEstimate() != null ? item.getInitialEstimate() : currentStock;
        int ordersDeducted = initialEst - currentStock;
        int expectedStock = currentStock; // after deductions
        int variance = expectedStock - actualCount; // positive = loss, negative = gain

        // Reset to exact mode with actual count
        item.setStockQuantity(actualCount);
        item.setStockType("exact");
        item.setInitialEstimate(actualCount);
        item.setStockSetAt(Instant.now().toString());
        if (actualCount <= 0) {
            item.setAvailable(false);
        }
        repository.save(item);

        Map<String, Object> result = new HashMap<>();
        result.put("item", item);
        result.put("initialEstimate", initialEst);
        result.put("ordersDeducted", ordersDeducted);
        result.put("expectedStock", expectedStock);
        result.put("actualCount", actualCount);
        result.put("variance", variance);

        return ResponseEntity.ok(result);
    }

    @Bean
    public CommandLineRunner initData(CoffeeItemRepository repository) {
        return args -> {
            try {
                if (repository.count() == 0) {
                    repository.saveAll(FALLBACK_MENU);
                    System.out.println("MongoDB seeded with initial coffee menu.");
                }
            } catch (Exception e) {
                System.err.println("Could not seed MongoDB: " + e.getMessage());
            }
        };
    }
}

