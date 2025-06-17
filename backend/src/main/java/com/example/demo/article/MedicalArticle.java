package com.example.demo.article;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medical_articles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String pdfPath; // local path or URL

    private Long authorId; // id de l'utilisateur auteur (médecin)

    private LocalDateTime createdAt;

    @Builder.Default
    private int likeCount = 0;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ArticleImage> images = new ArrayList<>();

}
