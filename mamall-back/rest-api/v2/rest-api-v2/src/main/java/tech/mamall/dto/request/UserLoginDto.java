package tech.mamall.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class UserLoginDto {

	@NotBlank
	private String username;
	@NotBlank
	private String password;

}
