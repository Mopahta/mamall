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
import tech.mamall.exception.InvalidRefreshTokenException;
import tech.mamall.exception.InvalidTokenException;
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

		// TODO: mind how to secure refresh token
		userService.updateUserRefreshToken(user, refreshToken);

		return new JwtTokenDto(jwtService.createAccessToken(user),
			  refreshToken, user.getUsername(), ((UserEntity) user).getId());
	}

	public JwtTokenDto refreshToken(String refreshToken) {
		UserEntity user;

		try {
			user = jwtService.extractUserInfoFromToken(refreshToken);
		} catch (InvalidTokenException e) {
			throw new InvalidRefreshTokenException();
		}

		if (!userService.verifyRefreshToken(refreshToken, user.getId())) {
			throw new InvalidRefreshTokenException();
		}

		refreshToken = jwtService.createRefreshToken(user);

		userService.updateUserRefreshToken(user, refreshToken);

		return new JwtTokenDto(jwtService.createAccessToken(user),
			  refreshToken, user.getUsername(), user.getId());
	}

	public JwtTokenDto validateToken(String token) {
		UserEntity user = jwtService.extractUserInfoFromToken(token);

		return JwtTokenDto.builder()
			  .username(user.getUsername()).userId(user.getId()).build();
	}
}
