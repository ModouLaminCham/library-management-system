package com.example.library.controller;

import com.example.library.model.Hold;
import com.example.library.model.User;
import com.example.library.repository.UserRepository;
import com.example.library.security.UserDetailsImpl;
import com.example.library.service.HoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/holds")
@RequiredArgsConstructor
public class HoldController {

    private final HoldService holdService;
    private final UserRepository userRepository;

    // --- Admin endpoints ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Hold>> getAllActiveHolds() {
        return ResponseEntity.ok(holdService.getActiveHolds());
    }

    @GetMapping("/book/{bookId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Hold>> getActiveHoldsByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(holdService.getActiveHoldsByBook(bookId));
    }

    @PostMapping("/{id}/fulfill")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> fulfillHold(@PathVariable Long id) {
        try {
            Hold hold = holdService.fulfillHold(id);
            return ResponseEntity.ok(hold);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Self-service endpoints ---

    @GetMapping("/my-holds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyHolds(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        List<Hold> holds = holdService.getHoldsByMember(user.getMember().getId());
        return ResponseEntity.ok(holds);
    }

    @PostMapping("/my-hold/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> placeMyHold(@PathVariable Long bookId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        try {
            Hold hold = holdService.placeHold(bookId, user.getMember().getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(hold);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/my-cancel/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelMyHold(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getMember() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No linked member record"));
        }
        Hold hold = holdService.getHoldsByMember(user.getMember().getId()).stream()
                .filter(h -> h.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (hold == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "This hold does not belong to you"));
        }
        try {
            hold = holdService.cancelHold(id);
            return ResponseEntity.ok(hold);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
