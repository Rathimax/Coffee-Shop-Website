package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

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
            // Try to fetch from real MongoDB
            List<CoffeeItem> menu = repository.findAll();
            if (menu.isEmpty()) {
                logger.info("Database is empty, serving fallback menu.");
                return FALLBACK_MENU;
            }
            return menu;
        } catch (Exception e) {
            // Handle DB connection failures gracefully
            logger.error("Database connection failed. Serving fallback menu. Error: {}", e.getMessage());
            return FALLBACK_MENU;
        }
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

