package tech.mamall.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@ToString
@AllArgsConstructor
public class ContactsDto {

	private static DateTimeFormatter formatter = DateTimeFormatter
		  .ofPattern("YYYY-MM-DD'T'hh:mm'Z'")
		  .withZone(ZoneOffset.UTC);

	private Long userId;
	private String contactNickname;
	private Long roomId;
	private String contactSince;
	private String username;
	private Integer iconFileId;

	public ContactsDto(Long userId, String contactNickname, Long roomId,
				 Instant contactSince, String username, Integer iconFileId) {
		this.userId = userId;
		this.contactNickname = contactNickname;
		this.roomId = roomId;


		this.contactSince = LocalDateTime
			  .ofInstant(contactSince, ZoneOffset.ofHours(3)).format(formatter);
		this.username = username;
		this.iconFileId = iconFileId;
	}
}
