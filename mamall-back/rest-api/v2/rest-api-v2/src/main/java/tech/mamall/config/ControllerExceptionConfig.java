package tech.mamall.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import tech.mamall.dto.response.ApiResponse;
import tech.mamall.exception.InvalidRefreshTokenException;
import tech.mamall.exception.InvalidTokenException;
import tech.mamall.exception.UserNotFoundException;
import tech.mamall.exception.UsernameAlreadyTakenException;

@ControllerAdvice
@Slf4j
public class ControllerExceptionConfig {

	@ExceptionHandler(value = UsernameAlreadyTakenException.class)
	public ResponseEntity<ApiResponse> usernameAlreadyTakenException(UsernameAlreadyTakenException e) {
		return new ResponseEntity<>(
			  new ApiResponse("error", e.getMessage()),
			  HttpStatusCode.valueOf(401));
	}

	@ExceptionHandler(value = UserNotFoundException.class)
	public ResponseEntity<ApiResponse> userNotFoundException(UserNotFoundException e) {
		log.error(e.getMessage(), e);
		return new ResponseEntity<>(
			  ApiResponse.builder().status("error").description("Invalid credentials.").build(),
			  HttpStatusCode.valueOf(401));
	}

	@ExceptionHandler(value = InvalidTokenException.class)
	public ResponseEntity<ApiResponse> invalidTokenException(InvalidTokenException e) {
		return new ResponseEntity<>(
			  ApiResponse.builder().status("error").description("Invalid token.").build(),
			  HttpStatusCode.valueOf(401));
	}

	@ExceptionHandler(value = InvalidRefreshTokenException.class)
	public ResponseEntity<ApiResponse> invalidRefreshTokenException(InvalidRefreshTokenException e) {
		return new ResponseEntity<>(
			  ApiResponse.builder().status("error").description("Invalid token.").build(),
			  HttpStatusCode.valueOf(403));
	}

	@ExceptionHandler(MissingRequestCookieException.class)
	public HttpEntity<ApiResponse> missingRequestCookieException(MissingRequestCookieException e) {
		return new ResponseEntity<>(HttpStatusCode.valueOf(403));
	}
}
