package tech.mamall.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@ToString
public class ApiResponse {
	private String status;
	private String description;
}
