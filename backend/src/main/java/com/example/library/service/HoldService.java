package com.example.library.service;

import com.example.library.model.Book;
import com.example.library.model.Hold;
import com.example.library.model.Member;
import com.example.library.repository.BookRepository;
import com.example.library.repository.HoldRepository;
import com.example.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HoldService {

    private final HoldRepository holdRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public Hold placeHold(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));

        if (holdRepository.existsByBookIdAndStatus(bookId, "ACTIVE")) {
            throw new RuntimeException("Book is already on hold");
        }

        Hold hold = new Hold();
        hold.setBook(book);
        hold.setMember(member);
        hold.setStatus("ACTIVE");

        return holdRepository.save(hold);
    }

    public Hold cancelHold(Long holdId) {
        Hold hold = holdRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Hold not found with id: " + holdId));
        hold.setStatus("CANCELLED");
        return holdRepository.save(hold);
    }

    public Hold fulfillHold(Long holdId) {
        Hold hold = holdRepository.findById(holdId)
                .orElseThrow(() -> new RuntimeException("Hold not found with id: " + holdId));
        hold.setStatus("FULFILLED");
        return holdRepository.save(hold);
    }

    public List<Hold> getHoldsByMember(Long memberId) {
        return holdRepository.findByMemberId(memberId);
    }

    public List<Hold> getActiveHolds() {
        return holdRepository.findByStatus("ACTIVE");
    }

    public List<Hold> getActiveHoldsByBook(Long bookId) {
        return holdRepository.findByBookIdAndStatus(bookId, "ACTIVE");
    }
}
