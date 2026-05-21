package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private VisitRepository visitRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Visit> allVisits = visitRepository.findAll();
        
        // Count unique visits by Gmail email only (no anonymous sessions)
        long totalUniqueVisits = allVisits.stream()
            .map(Visit::getUserEmail)
            .filter(email -> email != null && !email.isEmpty())
            .distinct()
            .count();
        
        // Monthly unique Gmail logins (last 30 days)
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        long monthlyUniqueVisits = allVisits.stream()
            .filter(v -> v.getTimestamp().isAfter(monthAgo))
            .map(Visit::getUserEmail)
            .filter(email -> email != null && !email.isEmpty())
            .distinct()
            .count();
        
        List<Order> allOrders = orderRepository.findAll();
        long totalPurchases = allOrders.size();
        
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        double todayRevenue = allOrders.stream()
            .filter(o -> o.getTimestamp() != null && o.getTimestamp().isAfter(startOfDay))
            .mapToDouble(Order::getTotalAmount).sum();
            
        double thisWeekRevenue = allOrders.stream()
            .filter(o -> o.getTimestamp() != null && o.getTimestamp().isAfter(startOfWeek))
            .mapToDouble(Order::getTotalAmount).sum();
            
        double monthlyRevenue = allOrders.stream()
            .filter(o -> o.getTimestamp() != null && o.getTimestamp().isAfter(monthAgo))
            .mapToDouble(Order::getTotalAmount).sum();

        double totalRevenue = allOrders.stream().mapToDouble(Order::getTotalAmount).sum();

        stats.put("totalVisits", totalUniqueVisits);
        stats.put("monthlyVisits", monthlyUniqueVisits);
        stats.put("totalPurchases", totalPurchases);
        stats.put("todayRevenue", todayRevenue);
        stats.put("thisWeekRevenue", thisWeekRevenue);
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("totalRevenue", totalRevenue);
        
        return stats;
    }

    @PostMapping("/visit")
    public Visit logVisit(@RequestBody(required = false) Map<String, String> body) {
        String userEmail = body != null ? body.get("userEmail") : null;

        // Only count authenticated Gmail users — reject anonymous visits entirely
        if (userEmail == null || userEmail.isEmpty()) {
            return null;
        }

        // Prevent the same email from being counted more than once per 12 hours
        LocalDateTime twelveHoursAgo = LocalDateTime.now().minusHours(12);
        List<Visit> recentVisits = visitRepository.findByTimestampBetween(twelveHoursAgo, LocalDateTime.now());
        boolean alreadyLogged = recentVisits.stream().anyMatch(v -> userEmail.equals(v.getUserEmail()));
        if (alreadyLogged) return null;

        return visitRepository.save(new Visit(null, userEmail));
    }
}
