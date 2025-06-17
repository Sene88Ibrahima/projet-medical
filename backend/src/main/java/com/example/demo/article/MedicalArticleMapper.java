package com.example.demo.article;

import com.example.demo.article.dto.ArticleDto;


import java.util.stream.Collectors;

public class MedicalArticleMapper {
    public static ArticleDto toDto(MedicalArticle article, String authorName) {
        return ArticleDto.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .pdfUrl(article.getPdfPath())
                .authorId(article.getAuthorId())
                .authorName(authorName)
                .likeCount(article.getLikeCount())
                .createdAt(article.getCreatedAt())
                .imageIds(article.getImages().stream()
                        .map(ArticleImage::getOrthancInstanceId)
                        .collect(Collectors.toList()))
                .build();
    }
}
