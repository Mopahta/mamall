package tech.mamall.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.mamall.dto.response.ContactsDto;
import tech.mamall.service.UserContactsService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Slf4j
public class ContactsController {

	private final UserContactsService userContactsService;

	@GetMapping
	public ResponseEntity<List<ContactsDto>> getContacts() {
		log.info("getContacts()");
		return new ResponseEntity<>(userContactsService.getUserContacts(), HttpStatus.OK);
	}

}
