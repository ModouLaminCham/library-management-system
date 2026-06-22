package com.example.library.controller;

import com.example.library.model.Book;
import com.example.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<Page<Book>> getAllBooks(@PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/available")
    public ResponseEntity<Page<Book>> getAvailableBooks(@PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.getAvailableBooks(pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        Book savedBook = bookService.saveBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBook);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @Valid @RequestBody Book bookDetails) {
        try {
            Book updatedBook = bookService.updateBook(id, bookDetails);
            return ResponseEntity.ok(updatedBook);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Book>> searchBooks(@RequestParam String title, @PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.searchBooksByTitle(title, pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search/available")
    public ResponseEntity<Page<Book>> searchAvailableBooks(@RequestParam String title, @PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.searchAvailableBooksByTitle(title, pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<Page<Book>> getBooksByAuthor(@PathVariable String author, @PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.getBooksByAuthor(author, pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<Page<Book>> getBooksByGenre(@PathVariable String genre, @PageableDefault(size = 20) Pageable pageable) {
        Page<Book> books = bookService.getBooksByGenre(genre, pageable);
        return ResponseEntity.ok(books);
    }
}
