package com.example.library.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "holds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Book is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @NotNull(message = "Member is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Member member;

    @NotNull(message = "Hold date is required")
    @Column(nullable = false)
    private LocalDate holdDate;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @PrePersist
    protected void onCreate() {
        if (holdDate == null) {
            holdDate = LocalDate.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
