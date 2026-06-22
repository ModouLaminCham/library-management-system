package com.example.library.repository;

import com.example.library.model.Hold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoldRepository extends JpaRepository<Hold, Long> {

    List<Hold> findByMemberIdAndStatus(Long memberId, String status);

    List<Hold> findByBookIdAndStatus(Long bookId, String status);

    List<Hold> findByStatus(String status);

    boolean existsByBookIdAndStatus(Long bookId, String status);

    List<Hold> findByMemberId(Long memberId);
}
