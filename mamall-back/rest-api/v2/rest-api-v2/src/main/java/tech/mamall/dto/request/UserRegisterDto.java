package tech.mamall.dto.request;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class UserRegisterDto {

	private String username;
	private String email;
	private String password;

}
