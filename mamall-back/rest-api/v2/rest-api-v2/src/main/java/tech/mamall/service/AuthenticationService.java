package tech.mamall.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tech.mamall.dto.request.UserLoginDto;
import tech.mamall.dto.request.UserRegisterDto;
import tech.mamall.dto.response.JwtTokenDto;
import tech.mamall.exception.UserNotFoundException;
import tech.mamall.model.UserEntity;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;


	public void registerUser(UserRegisterDto userRegisterDto) {
		userRegisterDto.setPassword(passwordEncoder.encode(userRegisterDto.getPassword()));

		UserEntity user = userService.createUser(userRegisterDto);
	}

	public JwtTokenDto loginUser(UserLoginDto userLoginDto) {
		UserDetails user = userService.userDetailsService().loadUserByUsername(userLoginDto.getUsername());

		if (user == null) {
			throw new UserNotFoundException(userLoginDto.getUsername());
		}

		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
			  userLoginDto.getUsername(),
			  userLoginDto.getPassword()
		));

		String refreshToken = jwtService.createRefreshToken(user);

		userService.updateUserRefreshToken(user, refreshToken);

		return new JwtTokenDto(jwtService.createAccessToken(user),
			  refreshToken, user.getUsername(), ((UserEntity) user).getId());
	}
}
