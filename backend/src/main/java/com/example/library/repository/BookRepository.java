package com.example.library.repository;

import com.example.library.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findByAvailableTrue(Pageable pageable);

    Page<Book> findByAuthor(String author, Pageable pageable);

    Page<Book> findByGenre(String genre, Pageable pageable);

    @Query(value = "SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))",
           countQuery = "SELECT COUNT(b) FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Book> findByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);

    @Query(value = "SELECT b FROM Book b WHERE b.available = true AND LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))",
           countQuery = "SELECT COUNT(b) FROM Book b WHERE b.available = true AND LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Book> findAvailableByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);
}
