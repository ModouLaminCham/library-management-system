package com.example.library.service;

import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public Page<Book> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public Page<Book> getAvailableBooks(Pageable pageable) {
        return bookRepository.findByAvailableTrue(pageable);
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setGenre(bookDetails.getGenre());
        book.setPublicationYear(bookDetails.getPublicationYear());
        book.setDescription(bookDetails.getDescription());
        book.setAvailable(bookDetails.getAvailable());

        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public Page<Book> searchBooksByTitle(String title, Pageable pageable) {
        return bookRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    public Page<Book> searchAvailableBooksByTitle(String title, Pageable pageable) {
        return bookRepository.findAvailableByTitleContainingIgnoreCase(title, pageable);
    }

    public Page<Book> getBooksByAuthor(String author, Pageable pageable) {
        return bookRepository.findByAuthor(author, pageable);
    }

    public Page<Book> getBooksByGenre(String genre, Pageable pageable) {
        return bookRepository.findByGenre(genre, pageable);
    }
}
