package com.example.demo.article;

import com.example.demo.article.dto.ArticleDto;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import com.example.demo.article.ShareRequest;

@RestController
@RequestMapping("/api/v1/articles")
public class MedicalArticleController {

    private final MedicalArticleService articleService;

    public MedicalArticleController(MedicalArticleService articleService) {
        this.articleService = articleService;
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArticleDto createArticle(
            @RequestParam @NotBlank String title,
            @RequestParam String content,
            @RequestParam(required = false) List<String> imageIds,
            @RequestPart(required = false) MultipartFile pdfFile,
            Authentication authentication) throws IOException {
        Long authorId = null;
        if (authentication != null && authentication.getPrincipal() instanceof com.example.demo.model.User user) {
            authorId = user.getId();
        }
        return articleService.create(title, content, authorId, imageIds, pdfFile);
    }

    @GetMapping
    public List<ArticleDto> allArticles() {
        return articleService.findAll();
    }

    @GetMapping("/{id}")
    public ArticleDto getArticle(@PathVariable Long id) {
        return articleService.findById(id);
    }

    // like endpoint
    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/{id}/like")
    public Map<String, Integer> likeArticle(@PathVariable Long id) {
        int count = articleService.likeArticle(id);
        return Map.of("count", count);
    }

    // share endpoint
    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/{id}/share")
    public void shareArticle(@PathVariable Long id, @RequestBody ShareRequest request, Authentication authentication) {
        Long fromDoctorId = null;
        if (authentication != null && authentication.getPrincipal() instanceof com.example.demo.model.User user) {
            fromDoctorId = user.getId();
        }
        articleService.shareArticle(id, fromDoctorId, request.doctorIds());
    }
}
