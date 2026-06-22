package com.example.library.service;

import com.example.library.model.Member;
import com.example.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;

    public Page<Member> getAllMembers(Pageable pageable) {
        return memberRepository.findAll(pageable);
    }

    public Page<Member> getActiveMembers(Pageable pageable) {
        return memberRepository.findByActiveTrue(pageable);
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> getMemberByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    public Member saveMember(Member member) {
        return memberRepository.save(member);
    }

    public Member updateMember(Long id, Member memberDetails) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        member.setName(memberDetails.getName());
        member.setEmail(memberDetails.getEmail());
        member.setPhoneNumber(memberDetails.getPhoneNumber());
        member.setAddress(memberDetails.getAddress());
        member.setActive(memberDetails.getActive());

        return memberRepository.save(member);
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public Page<Member> searchMembersByName(String name, Pageable pageable) {
        return memberRepository.findByNameContainingIgnoreCase(name, pageable);
    }
}
