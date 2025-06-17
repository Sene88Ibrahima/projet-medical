package com.example.demo.article;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleShareRepository extends JpaRepository<ArticleShare, Long> {
}
