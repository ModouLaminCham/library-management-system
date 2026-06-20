package com.example.library.dto;

import com.example.library.model.BorrowingRecord;
import java.time.LocalDate;

public class BorrowingRecordDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Long memberId;
    private String memberName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Boolean returned;
    private Double fineAmount;

    public BorrowingRecordDTO() {
    }

    public BorrowingRecordDTO(BorrowingRecord record) {
        this.id = record.getId();
        
        // Handle potential null book
        if (record.getBook() != null) {
            this.bookId = record.getBook().getId();
            this.bookTitle = record.getBook().getTitle();
            this.bookAuthor = record.getBook().getAuthor();
        }
        
        // Handle potential null member
        if (record.getMember() != null) {
            this.memberId = record.getMember().getId();
            this.memberName = record.getMember().getName();
        }
        
        this.borrowDate = record.getBorrowDate();
        this.dueDate = record.getDueDate();
        this.returnDate = record.getReturnDate();
        this.returned = record.getReturned();
        this.fineAmount = record.getFineAmount();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public Boolean getReturned() {
        return returned;
    }

    public void setReturned(Boolean returned) {
        this.returned = returned;
    }

    public Double getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(Double fineAmount) {
        this.fineAmount = fineAmount;
    }
}
