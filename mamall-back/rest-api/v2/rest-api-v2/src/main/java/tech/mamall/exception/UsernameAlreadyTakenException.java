package tech.mamall.exception;

public class UsernameAlreadyTakenException extends RuntimeException {
	public UsernameAlreadyTakenException(String message) {
		super("The username " + message + " is already taken.");
	}
}
