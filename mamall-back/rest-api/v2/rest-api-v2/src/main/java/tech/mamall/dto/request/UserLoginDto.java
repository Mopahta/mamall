package tech.mamall.dto.request;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class UserLoginDto {

	private String username;
	private String password;

}
