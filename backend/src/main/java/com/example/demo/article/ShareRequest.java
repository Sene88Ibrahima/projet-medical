package com.example.demo.article;

import java.util.List;

public record ShareRequest(List<Long> doctorIds) {
}
