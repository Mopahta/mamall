package tech.mamall.exception;

public class UserNotFoundException extends RuntimeException {
	public UserNotFoundException(String message) {
		super("The user " + message + " not found.");
	}
}
