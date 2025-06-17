package com.example.demo.article;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "article_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orthancInstanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private MedicalArticle article;
}
