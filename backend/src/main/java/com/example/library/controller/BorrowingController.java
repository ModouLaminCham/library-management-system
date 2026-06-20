package com.example.library.controller;

import com.example.library.dto.BorrowingRecordDTO;
import com.example.library.model.BorrowingRecord;
import com.example.library.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/borrowing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class BorrowingController {

    private final BorrowingService borrowingService;

    @GetMapping
    public ResponseEntity<List<BorrowingRecordDTO>> getAllBorrowingRecords() {
        List<BorrowingRecord> records = borrowingService.getAllBorrowingRecords();
        List<BorrowingRecordDTO> dtos = records.stream()
                .map(BorrowingRecordDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BorrowingRecordDTO>> getActiveBorrowingRecords() {
        List<BorrowingRecord> records = borrowingService.getActiveBorrowingRecords();
        List<BorrowingRecordDTO> dtos = records.stream()
                .map(BorrowingRecordDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowingRecordDTO> getBorrowingRecordById(@PathVariable Long id) {
        return borrowingService.getBorrowingRecordById(id)
                .map(BorrowingRecordDTO::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestBody Map<String, Long> request) {
        try {
            Long bookId = request.get("bookId");
            Long memberId = request.get("memberId");

            if (bookId == null || memberId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "bookId and memberId are required"));
            }

            BorrowingRecord record = borrowingService.borrowBook(bookId, memberId);
            BorrowingRecordDTO dto = new BorrowingRecordDTO(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Request could not be completed."));
        }
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            BorrowingRecord record = borrowingService.returnBook(id);
            BorrowingRecordDTO dto = new BorrowingRecordDTO(record);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Request could not be completed."));
        }
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BorrowingRecordDTO>> getBorrowingRecordsByMember(@PathVariable Long memberId) {
        List<BorrowingRecord> records = borrowingService.getBorrowingRecordsByMember(memberId);
        List<BorrowingRecordDTO> dtos = records.stream()
                .map(BorrowingRecordDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BorrowingRecordDTO>> getOverdueBooks() {
        List<BorrowingRecord> records = borrowingService.getOverdueBooks();
        List<BorrowingRecordDTO> dtos = records.stream()
                .map(BorrowingRecordDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/overdue/member/{memberId}")
    public ResponseEntity<List<BorrowingRecordDTO>> getOverdueBooksByMember(@PathVariable Long memberId) {
        List<BorrowingRecord> records = borrowingService.getOverdueBooksByMember(memberId);
        List<BorrowingRecordDTO> dtos = records.stream()
                .map(BorrowingRecordDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBorrowingRecord(@PathVariable Long id) {
        borrowingService.deleteBorrowingRecord(id);
        return ResponseEntity.noContent().build();
    }
}