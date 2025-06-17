package com.example.demo.article;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "article_shares")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    private MedicalArticle article;

    private Long fromDoctorId;
    private Long toDoctorId;

    private LocalDateTime sharedAt;
}
