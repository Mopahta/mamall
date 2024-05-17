package tech.mamall.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tech.mamall.dto.response.ContactsDto;
import tech.mamall.model.UserEntity;
import tech.mamall.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserContactsService {

	private final UserService userService;

	private final UserRepository userRepository;

	public List<ContactsDto> getUserContacts() {
		UserEntity user = userService.getCurrentUser();

		return userRepository.findUserContactsById(user.getId());
	}
}
