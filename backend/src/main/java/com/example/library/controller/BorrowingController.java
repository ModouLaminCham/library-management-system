package com.example.library.controller;

import com.example.library.dto.BorrowingRecordDTO;
import com.example.library.model.BorrowingRecord;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import com.example.library.security.UserDetailsImpl;
import com.example.library.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowing")
@RequiredArgsConstructor
public class BorrowingController {

    private final BorrowingService borrowingService;
    private final UserRepository userRepository;

    // --- Admin endpoints ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getAllBorrowingRecords(@PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getAllBorrowingRecords(pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getActiveBorrowingRecords(@PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getActiveBorrowingRecords(pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BorrowingRecordDTO> getBorrowingRecordById(@PathVariable Long id) {
        return borrowingService.getBorrowingRecordById(id)
                .map(BorrowingRecordDTO::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/borrow")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> borrowBook(@RequestBody Map<String, Object> request) {
        try {
            Long bookId = request.get("bookId") != null ? ((Number) request.get("bookId")).longValue() : null;
            Long memberId = request.get("memberId") != null ? ((Number) request.get("memberId")).longValue() : null;

            if (bookId == null || memberId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "bookId and memberId are required"));
            }

            LocalDate dueDate = null;
            if (request.get("dueDate") != null) {
                dueDate = LocalDate.parse(request.get("dueDate").toString());
            }

            BorrowingRecord record = borrowingService.borrowBook(bookId, memberId, dueDate);
            BorrowingRecordDTO dto = new BorrowingRecordDTO(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Request could not be completed."));
        }
    }

    @PostMapping("/return/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getBorrowingRecordsByMember(@PathVariable Long memberId, @PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getBorrowingRecordsByMember(memberId, pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getOverdueBooks(@PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getOverdueBooks(pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/overdue/member/{memberId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getOverdueBooksByMember(@PathVariable Long memberId, @PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getOverdueBooksByMember(memberId, pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBorrowingRecord(@PathVariable Long id) {
        borrowingService.deleteBorrowingRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getAllHistory(@PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getAllBorrowingRecords(pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/member/{memberId}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BorrowingRecordDTO>> getMemberHistory(@PathVariable Long memberId, @PageableDefault(size = 20) Pageable pageable) {
        Page<BorrowingRecordDTO> dtos = borrowingService.getMemberHistory(memberId, pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    // --- Fine management ---

    @PostMapping("/{id}/pay-fine")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> payFine(@PathVariable Long id) {
        try {
            BorrowingRecord record = borrowingService.payFine(id);
            return ResponseEntity.ok(Map.of("message", "Fine paid", "fineAmount", record.getFineAmount()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/waive-fine")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> waiveFine(@PathVariable Long id) {
        try {
            BorrowingRecord record = borrowingService.waiveFine(id);
            return ResponseEntity.ok(Map.of("message", "Fine waived", "fineAmount", record.getFineAmount()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Self-service endpoints (for the authenticated user's linked member) ---

    @GetMapping("/my-books")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyBooks(Authentication authentication, @PageableDefault(size = 20) Pageable pageable) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        Page<BorrowingRecordDTO> dtos = borrowingService.getBorrowingRecordsByMember(user.getMember().getId(), pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyHistory(Authentication authentication, @PageableDefault(size = 20) Pageable pageable) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        Page<BorrowingRecordDTO> dtos = borrowingService.getMemberHistory(user.getMember().getId(), pageable).map(BorrowingRecordDTO::new);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/my-borrow/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> borrowMyBook(@PathVariable Long bookId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        try {
            BorrowingRecord record = borrowingService.borrowBook(bookId, user.getMember().getId());
            BorrowingRecordDTO dto = new BorrowingRecordDTO(record);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Request could not be completed."));
        }
    }

    @PostMapping("/my-return/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> returnMyBook(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        BorrowingRecord record = borrowingService.getBorrowingRecordById(id)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found"));
        if (!record.getMember().getId().equals(user.getMember().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "This record does not belong to you"));
        }
        try {
            record = borrowingService.returnBook(id);
            BorrowingRecordDTO dto = new BorrowingRecordDTO(record);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Request could not be completed."));
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
