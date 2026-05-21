package com.example.backend;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface VisitRepository extends MongoRepository<Visit, String> {
    List<Visit> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
