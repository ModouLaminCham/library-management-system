package com.example.library.service;

import com.example.library.model.Book;
import com.example.library.model.BorrowingRecord;
import com.example.library.model.Member;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowingRecordRepository;
import com.example.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
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

    private static final double DAILY_FINE_RATE = 0.50; // $0.50 per day

    public List<BorrowingRecord> getAllBorrowingRecords() {
        return borrowingRecordRepository.findAll();
    }

    public List<BorrowingRecord> getActiveBorrowingRecords() {
        return borrowingRecordRepository.findByReturnedFalse();
    }

    public Optional<BorrowingRecord> getBorrowingRecordById(Long id) {
        return borrowingRecordRepository.findById(id);
    }

    public BorrowingRecord borrowBook(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));

        if (!book.getAvailable()) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        // Check if member has any overdue books
        List<BorrowingRecord> overdueBooks = getOverdueBooksByMember(memberId);
        if (!overdueBooks.isEmpty()) {
            throw new RuntimeException("Member has overdue books and cannot borrow new books");
        }

        // Create borrowing record
        BorrowingRecord borrowingRecord = new BorrowingRecord();
        borrowingRecord.setBook(book);
        borrowingRecord.setMember(member);
        borrowingRecord.setBorrowDate(LocalDate.now());
        borrowingRecord.setDueDate(LocalDate.now().plusDays(14)); // 2 weeks

        // Mark book as unavailable
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

        // Calculate fine if overdue
        LocalDate returnDate = LocalDate.now();
        if (returnDate.isAfter(borrowingRecord.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(borrowingRecord.getDueDate(), returnDate);
            double fine = daysOverdue * DAILY_FINE_RATE;
            borrowingRecord.setFineAmount(fine);
        }

        borrowingRecord.setReturnDate(returnDate);
        borrowingRecord.setReturned(true);

        // Mark book as available
        Book book = borrowingRecord.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        return borrowingRecordRepository.save(borrowingRecord);
    }

    public List<BorrowingRecord> getBorrowingRecordsByMember(Long memberId) {
        return borrowingRecordRepository.findActiveBorrowingsByMember(memberId);
    }

    public List<BorrowingRecord> getOverdueBooks() {
        return borrowingRecordRepository.findOverdueBooks(LocalDate.now());
    }

    public List<BorrowingRecord> getOverdueBooksByMember(Long memberId) {
        List<BorrowingRecord> overdueBooks = getOverdueBooks();
        return overdueBooks.stream()
                .filter(record -> record.getMember().getId().equals(memberId))
                .toList();
    }

    public void deleteBorrowingRecord(Long id) {
        borrowingRecordRepository.deleteById(id);
    }
}