package tech.mamall.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class UserRegisterDto {

	@NotBlank
	@Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]{1,45}+$")
	private String username;

	@Email
	@NotBlank
	private String email;

	@Pattern(regexp = "^\\S{8,65}$")
	private String password;

}
