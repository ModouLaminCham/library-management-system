package com.example.library.repository;

import com.example.library.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    Page<Member> findByActiveTrue(Pageable pageable);

    Page<Member> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
}
