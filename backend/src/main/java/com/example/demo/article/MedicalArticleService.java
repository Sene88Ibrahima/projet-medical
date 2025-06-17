package com.example.demo.article;

import com.example.demo.article.dto.ArticleDto;
import org.springframework.beans.factory.annotation.Value;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.article.ArticleShareRepository;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalArticleService {

    private final UserRepository userRepository;

    private final MedicalArticleRepository articleRepository;
    private final String uploadDir;
    private final com.example.demo.service.EmailService emailService;
    private final ArticleShareRepository shareRepository;

    public MedicalArticleService(MedicalArticleRepository articleRepository,
                                 UserRepository userRepository,
                                 ArticleShareRepository shareRepository,
                                 @Value("${app.upload.articles.dir:uploads/articles/pdf}") String uploadDir,
                                 com.example.demo.service.EmailService emailService) {
        this.emailService = emailService;
        this.articleRepository = articleRepository;
        this.uploadDir = uploadDir;
        this.userRepository = userRepository;
        this.shareRepository = shareRepository;
    }

    public ArticleDto create(String title, String content, Long authorId, List<String> imageIds, MultipartFile pdfFile) throws IOException {
        MedicalArticle article = new MedicalArticle();
        article.setTitle(title);
        article.setContent(content);
        if (authorId == null) {
            throw new IllegalArgumentException("Author id could not be resolved from authenticated user");
        }
        article.setAuthorId(authorId);
        article.setCreatedAt(LocalDateTime.now());

        // handle PDF upload if provided
        if (pdfFile != null && !pdfFile.isEmpty()) {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String filename = System.currentTimeMillis() + "_" + pdfFile.getOriginalFilename();
            Path filePath = dir.resolve(filename);
            Files.copy(pdfFile.getInputStream(), filePath);
            article.setPdfPath("/files/articles/pdf/" + filename);
        }

        // images
        if (imageIds != null) {
            List<ArticleImage> imgs = imageIds.stream()
                    .map(id -> ArticleImage.builder().orthancInstanceId(id).article(article).build())
                    .collect(Collectors.toList());
            article.setImages(imgs);
        }

        MedicalArticle saved = articleRepository.save(article);
        String name = userRepository.findById(saved.getAuthorId())
                .map(u -> (u.getLastName() != null ? u.getLastName() : "") + " " + (u.getFirstName() != null ? u.getFirstName() : ""))
                .orElse("Inconnu").trim();
        return MedicalArticleMapper.toDto(saved, name);
    }

    // like article
    public int likeArticle(Long id) {
        MedicalArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        article.setLikeCount(article.getLikeCount() + 1);
        articleRepository.save(article);
        return article.getLikeCount();
    }

    // share article with doctors
    public void shareArticle(Long id, Long fromDoctorId, List<Long> toDoctorIds) {
        MedicalArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        LocalDateTime now = LocalDateTime.now();
        toDoctorIds.forEach(toId -> {
            ArticleShare share = ArticleShare.builder()
                    .article(article)
                    .fromDoctorId(fromDoctorId)
                    .toDoctorId(toId)
                    .sharedAt(now)
                    .build();
            shareRepository.save(share);
            // Send email notification
            userRepository.findById(toId).ifPresent(u -> {
                userRepository.findById(fromDoctorId).ifPresent(s -> {
                    String senderName = (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "");
                    emailService.sendSimpleMessage(u.getEmail(), "Article partagé", senderName + " a partagé un article avec vous.");
                });
            });
        });
    }

    public List<ArticleDto> findAll() {
        return articleRepository.findAll().stream()
                .map(a -> {
                    String name = userRepository.findById(a.getAuthorId())
                        .map(u -> (u.getLastName() != null ? u.getLastName() : "") + " " + (u.getFirstName() != null ? u.getFirstName() : ""))
                        .orElse("Inconnu").trim();
                    return MedicalArticleMapper.toDto(a, name);
                })
                .collect(Collectors.toList());
    }

    public ArticleDto findById(Long id) {
        return articleRepository.findById(id)
                .map(a -> {
                    String name = userRepository.findById(a.getAuthorId())
                            .map(u -> (u.getLastName() != null ? u.getLastName() : "") + " " + (u.getFirstName() != null ? u.getFirstName() : ""))
                            .orElse("Inconnu").trim();
                    return MedicalArticleMapper.toDto(a, name);
                })
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }
}
