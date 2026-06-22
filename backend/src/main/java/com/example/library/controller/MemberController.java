package com.example.library.controller;

import com.example.library.model.Member;
import com.example.library.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<Page<Member>> getAllMembers(@PageableDefault(size = 20) Pageable pageable) {
        Page<Member> members = memberService.getAllMembers(pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/active")
    public ResponseEntity<Page<Member>> getActiveMembers(@PageableDefault(size = 20) Pageable pageable) {
        Page<Member> members = memberService.getActiveMembers(pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Member> getMemberByEmail(@PathVariable String email) {
        return memberService.getMemberByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Member> createMember(@Valid @RequestBody Member member) {
        Member savedMember = memberService.saveMember(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMember);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @Valid @RequestBody Member memberDetails) {
        try {
            Member updatedMember = memberService.updateMember(id, memberDetails);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Member>> searchMembers(@RequestParam String name, @PageableDefault(size = 20) Pageable pageable) {
        Page<Member> members = memberService.searchMembersByName(name, pageable);
        return ResponseEntity.ok(members);
    }
}
