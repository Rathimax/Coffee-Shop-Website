package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class CoffeeMenuController {

    @Autowired
    private CoffeeItemRepository repository;

    @GetMapping
    public List<CoffeeItem> getMenu() {
        return repository.findAll();
    }

    @Bean
    public CommandLineRunner initData(CoffeeItemRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                        new CoffeeItem(null, "Classic Espresso", "Rich and bold single shot of espresso.", 3.50, "Hot",
                                "/menu/classic-espresso.jpg"),
                        new CoffeeItem(null, "Velvet Latte", "Smooth steamed milk with a double shot of espresso.",
                                4.50, "Hot", "/coffee.png"),
                        new CoffeeItem(null, "Iced Caramel Macchiato",
                                "Layers of espresso, milk, and caramel over ice.", 5.50, "Cold", "/coffee.png"),
                        new CoffeeItem(null, "Hazelnut Mocha", "A blend of chocolate, espresso, and hazelnut.", 4.75,
                                "Hot", "/coffee.png"),
                        new CoffeeItem(null, "Cold Brew", "Slow-steeped for 24 hours for a smooth finish.", 4.00,
                                "Cold", "/coffee.png")));
                System.out.println("MongoDB seeded with initial coffee menu.");
            }
        };
    }
}
