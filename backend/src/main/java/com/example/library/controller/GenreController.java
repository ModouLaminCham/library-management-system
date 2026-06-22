package com.example.library.controller;

import com.example.library.model.Genre;
import com.example.library.repository.GenreRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreRepository genreRepository;

    @GetMapping
    public ResponseEntity<List<Genre>> getAllGenres() {
        List<Genre> genres = genreRepository.findAll();
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Genre> getGenreById(@PathVariable Long id) {
        return genreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Genre> createGenre(@Valid @RequestBody Genre genre) {
        Genre savedGenre = genreRepository.save(genre);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGenre);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Genre> updateGenre(@PathVariable Long id, @Valid @RequestBody Genre genreDetails) {
        return genreRepository.findById(id)
                .map(genre -> {
                    genre.setName(genreDetails.getName());
                    Genre updatedGenre = genreRepository.save(genre);
                    return ResponseEntity.ok(updatedGenre);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        genreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
