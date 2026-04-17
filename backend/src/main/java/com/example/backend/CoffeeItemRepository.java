package com.example.backend;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoffeeItemRepository extends MongoRepository<CoffeeItem, String> {
}
