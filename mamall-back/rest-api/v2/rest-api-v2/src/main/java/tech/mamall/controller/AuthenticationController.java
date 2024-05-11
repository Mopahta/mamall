package tech.mamall.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tech.mamall.dto.request.UserLoginDto;
import tech.mamall.dto.request.UserRegisterDto;
import tech.mamall.dto.response.ApiResponse;
import tech.mamall.dto.response.JwtTokenDto;
import tech.mamall.dto.response.LoginInfoDto;
import tech.mamall.service.AuthenticationService;

@RestController
@RequestMapping("/api/v2")
@RequiredArgsConstructor
public class AuthenticationController {

	private final AuthenticationService authenticationService;

	@PostMapping("/login")
	public ResponseEntity<LoginInfoDto> login(@RequestBody @Valid UserLoginDto userLoginDto) {

		JwtTokenDto jwtTokenDto = authenticationService.loginUser(userLoginDto);

		HttpCookie accessTokenCookie = ResponseCookie.from("token", jwtTokenDto.getAccessToken())
			  .httpOnly(true)
			  .maxAge(48 * 60 * 60 * 1000).build();

		HttpCookie refreshTokenCookie = ResponseCookie.from("refresh_token", jwtTokenDto.getAccessToken())
			  .httpOnly(true)
			  .path("/api/v2/refresh")
			  .maxAge(48 * 60 * 60 * 1000).build();

		return ResponseEntity.ok()
			  .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
			  .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
			  .body(new LoginInfoDto(jwtTokenDto.getUsername(), jwtTokenDto.getUserId()));
	}

	@PostMapping("/signup")
	public ResponseEntity<ApiResponse> signUp(@RequestBody @Valid UserRegisterDto userRegisterDto) {
		authenticationService.registerUser(userRegisterDto);

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse> refreshToken(@RequestBody @Valid UserRegisterDto userRegisterDto) {
		authenticationService.registerUser(userRegisterDto);

		return new ResponseEntity<>(HttpStatus.OK);
	}
}
