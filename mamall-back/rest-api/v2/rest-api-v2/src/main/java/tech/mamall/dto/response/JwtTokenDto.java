package tech.mamall.dto.response;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtTokenDto {

	private String accessToken;
	private String refreshToken;
	private String username;
	private Long userId;

}
