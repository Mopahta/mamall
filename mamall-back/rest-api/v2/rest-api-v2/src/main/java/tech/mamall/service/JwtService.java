package tech.mamall.service;

import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tech.mamall.model.UserEntity;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtService {

	private SecretKey secretKey;

	public JwtService(@Value("${JWTSECRET}") String jwtSecret) {
		secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "SHA-512");
	}

	public String createToken(UserEntity user) {
		Date expiration = Date.from(Instant.now().plus(2, ChronoUnit.HOURS));
		String jwt = Jwts.builder()
			  .expiration(expiration)
			  .issuedAt(new Date())
			  .claims(Map.of(
				    "username", user.getUsername(),
				    "user_id", user.getId()
			  ))
			  .signWith(secretKey)
			  .compact();


		return jwt;
	}

}
