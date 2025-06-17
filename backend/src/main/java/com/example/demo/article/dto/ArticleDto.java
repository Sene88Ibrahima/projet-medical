package com.example.demo.article.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ArticleDto {
    private Long id;
    private String title;
    private String content;
    private String pdfUrl;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private int likeCount;
    private List<String> imageIds; // orthanc ids
}
