package tech.mamall.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.mamall.dto.request.UserRegisterDto;
import tech.mamall.exception.UserNotFoundException;
import tech.mamall.exception.UsernameAlreadyTakenException;
import tech.mamall.mapper.UserInfoMapper;
import tech.mamall.model.UserEntity;
import tech.mamall.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	private final UserInfoMapper userInfoMapper;

	@Transactional
	public UserEntity createUser(UserRegisterDto userRegisterDto) {

		UserEntity userEntity = userInfoMapper.userRegisterDtoToUserEntity(userRegisterDto);

		if (userRepository.existsByUsername(userEntity.getUsername())) {
			throw new UsernameAlreadyTakenException(userEntity.getUsername());
		}

		return userRepository.save(userEntity);
	}

	public UserEntity getByUsername(String username) {
		return userRepository.findByUsername(username)
			  .orElseThrow(() -> new UserNotFoundException(username));

	}

	public UserDetailsService userDetailsService() {
		return this::getByUsername;
	}

	public UserEntity getCurrentUser() {
		var username = SecurityContextHolder.getContext().getAuthentication().getName();
		return getByUsername(username);
	}

	public Boolean verifyRefreshToken(String refreshToken, Long userId) {
		UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(""));

		return userEntity.getRefreshToken().equals(refreshToken);
	}

	@Transactional
	public void updateUserRefreshToken(UserDetails user, String refreshToken) {
		UserEntity userEntity = (UserEntity) user;
		userEntity.setRefreshToken(refreshToken);
		userRepository.save(userEntity);
	}
}
