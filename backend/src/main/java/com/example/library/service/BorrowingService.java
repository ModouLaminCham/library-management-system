package com.example.library.service;

import com.example.library.model.Book;
import com.example.library.model.BorrowingRecord;
import com.example.library.model.Member;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowingRecordRepository;
import com.example.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BorrowingService {

    private final BorrowingRecordRepository borrowingRecordRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public static final double DAILY_FINE_RATE = 0.50;

    public Page<BorrowingRecord> getAllBorrowingRecords(Pageable pageable) {
        return borrowingRecordRepository.findAll(pageable);
    }

    public Page<BorrowingRecord> getActiveBorrowingRecords(Pageable pageable) {
        return borrowingRecordRepository.findByReturnedFalse(pageable);
    }

    public Optional<BorrowingRecord> getBorrowingRecordById(Long id) {
        return borrowingRecordRepository.findById(id);
    }

    public BorrowingRecord borrowBook(Long bookId, Long memberId) {
        return borrowBook(bookId, memberId, null);
    }

    public BorrowingRecord borrowBook(Long bookId, Long memberId, LocalDate customDueDate) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));

        if (!book.getAvailable()) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        List<BorrowingRecord> overdueBooks = getOverdueBooksByMember(memberId);
        if (!overdueBooks.isEmpty()) {
            throw new RuntimeException("Member has overdue books and cannot borrow new books");
        }

        LocalDate dueDate = customDueDate != null ? customDueDate : LocalDate.now().plusDays(14);
        if (dueDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        BorrowingRecord borrowingRecord = new BorrowingRecord();
        borrowingRecord.setBook(book);
        borrowingRecord.setMember(member);
        borrowingRecord.setBorrowDate(LocalDate.now());
        borrowingRecord.setDueDate(dueDate);

        book.setAvailable(false);
        bookRepository.save(book);

        return borrowingRecordRepository.save(borrowingRecord);
    }

    public BorrowingRecord returnBook(Long borrowingRecordId) {
        BorrowingRecord borrowingRecord = borrowingRecordRepository.findById(borrowingRecordId)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found with id: " + borrowingRecordId));

        if (borrowingRecord.getReturned()) {
            throw new RuntimeException("Book has already been returned");
        }

        LocalDate returnDate = LocalDate.now();
        if (returnDate.isAfter(borrowingRecord.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(borrowingRecord.getDueDate(), returnDate);
            double fine = daysOverdue * DAILY_FINE_RATE;
            borrowingRecord.setFineAmount(fine);
        }

        borrowingRecord.setReturnDate(returnDate);
        borrowingRecord.setReturned(true);

        Book book = borrowingRecord.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        return borrowingRecordRepository.save(borrowingRecord);
    }

    public Page<BorrowingRecord> getBorrowingRecordsByMember(Long memberId, Pageable pageable) {
        return borrowingRecordRepository.findActiveBorrowingsByMember(memberId, pageable);
    }

    public Page<BorrowingRecord> getMemberHistory(Long memberId, Pageable pageable) {
        return borrowingRecordRepository.findByMemberId(memberId, pageable);
    }

    public List<BorrowingRecord> getOverdueBooks() {
        return borrowingRecordRepository.findOverdueBooks(LocalDate.now(), Pageable.unpaged()).getContent();
    }

    public Page<BorrowingRecord> getOverdueBooks(Pageable pageable) {
        return borrowingRecordRepository.findOverdueBooks(LocalDate.now(), pageable);
    }

    public List<BorrowingRecord> getOverdueBooksByMember(Long memberId) {
        return borrowingRecordRepository.findOverdueBooks(LocalDate.now(), Pageable.unpaged()).getContent().stream()
                .filter(record -> record.getMember().getId().equals(memberId))
                .toList();
    }

    public Page<BorrowingRecord> getOverdueBooksByMember(Long memberId, Pageable pageable) {
        List<BorrowingRecord> allOverdue = borrowingRecordRepository.findOverdueBooks(LocalDate.now(), Pageable.unpaged()).getContent();
        List<BorrowingRecord> filtered = allOverdue.stream()
                .filter(record -> record.getMember().getId().equals(memberId))
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<BorrowingRecord> pageContent = start > filtered.size() ? List.of() : filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public void deleteBorrowingRecord(Long id) {
        borrowingRecordRepository.deleteById(id);
    }

    public BorrowingRecord payFine(Long borrowingRecordId) {
        BorrowingRecord record = borrowingRecordRepository.findById(borrowingRecordId)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found"));
        if (record.getFineAmount() == null || record.getFineAmount() == 0) {
            throw new RuntimeException("No fine to pay on this record");
        }
        record.setFineAmount(0.0);
        return borrowingRecordRepository.save(record);
    }

    public BorrowingRecord waiveFine(Long borrowingRecordId) {
        BorrowingRecord record = borrowingRecordRepository.findById(borrowingRecordId)
                .orElseThrow(() -> new RuntimeException("Borrowing record not found"));
        if (record.getFineAmount() == null || record.getFineAmount() == 0) {
            throw new RuntimeException("No fine to waive on this record");
        }
        record.setFineAmount(0.0);
        return borrowingRecordRepository.save(record);
    }
}
