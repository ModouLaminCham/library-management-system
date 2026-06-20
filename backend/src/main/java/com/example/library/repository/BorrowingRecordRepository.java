package com.example.library.repository;

import com.example.library.model.BorrowingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowingRecordRepository extends JpaRepository<BorrowingRecord, Long> {

    List<BorrowingRecord> findByMemberIdAndReturnedFalse(Long memberId);

    List<BorrowingRecord> findByBookIdAndReturnedFalse(Long bookId);

    List<BorrowingRecord> findByReturnedFalse();

    @Query("SELECT br FROM BorrowingRecord br WHERE br.dueDate < :currentDate AND br.returned = false")
    List<BorrowingRecord> findOverdueBooks(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT br FROM BorrowingRecord br WHERE br.member.id = :memberId AND br.returned = false")
    List<BorrowingRecord> findActiveBorrowingsByMember(@Param("memberId") Long memberId);
}