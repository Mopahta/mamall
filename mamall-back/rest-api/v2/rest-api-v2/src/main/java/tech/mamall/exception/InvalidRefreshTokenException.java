package tech.mamall.exception;


public class InvalidRefreshTokenException extends RuntimeException {
	public InvalidRefreshTokenException() {
		super("Invalid token.");
	}
}
