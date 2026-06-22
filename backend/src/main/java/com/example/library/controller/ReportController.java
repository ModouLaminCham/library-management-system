package com.example.library.controller;

import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowingRecordRepository;
import com.example.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowingRecordRepository borrowingRecordRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalBooks = bookRepository.count();
        long availableBooks = bookRepository.findByAvailableTrue(Pageable.unpaged()).getTotalElements();
        long totalMembers = memberRepository.count();
        long activeMembers = memberRepository.findByActiveTrue(Pageable.unpaged()).getTotalElements();
        long activeLoans = borrowingRecordRepository.findByReturnedFalse(Pageable.unpaged()).getTotalElements();
        long overdueBooks = borrowingRecordRepository.findOverdueBooks(LocalDate.now(), Pageable.unpaged()).getTotalElements();

        stats.put("totalBooks", totalBooks);
        stats.put("availableBooks", availableBooks);
        stats.put("onLoanBooks", totalBooks - availableBooks);
        stats.put("totalMembers", totalMembers);
        stats.put("activeMembers", activeMembers);
        stats.put("activeLoans", activeLoans);
        stats.put("overdueBooks", overdueBooks);

        double totalFines = borrowingRecordRepository.findAll().stream()
                .mapToDouble(r -> r.getFineAmount() != null ? r.getFineAmount() : 0.0)
                .sum();
        stats.put("totalFinesAccrued", Math.round(totalFines * 100.0) / 100.0);

        return ResponseEntity.ok(stats);
    }
}
