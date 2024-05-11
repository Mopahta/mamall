package tech.mamall.service;

import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
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

	public String createAccessToken(UserDetails userDetails) {
		if (userDetails instanceof UserEntity user) {
			return createToken(
				  Map.of("username", user.getUsername(), "user_id", user.getId()),
				  Date.from(Instant.now().plus(2, ChronoUnit.HOURS)));
		} else {
			return "";
		}
	}

	public String createRefreshToken(UserDetails userDetails) {
		if (userDetails instanceof UserEntity user) {
			return createToken(
				  Map.of("user_id", user.getId()),
				  Date.from(Instant.now().plus(1, ChronoUnit.DAYS)));
		} else {
			return "";
		}
	}

	public Boolean isTokenValid(String token, UserDetails userDetails) {
		try {
			Jwt<JwsHeader, Claims> jwt = Jwts.parser()
				  .verifyWith(secretKey)
				  .build()
				  .parseSignedClaims(token);

			return jwt.getPayload().getExpiration().before(new Date())
				  && userDetails.getUsername().equals(jwt.getPayload().get("username", String.class));
		} catch (JwtException e) {
			return false;
		}
	}

	private String createToken(Map<String, ?> claims, Date expiration) {
		return Jwts.builder()
			  .expiration(expiration)
			  .issuedAt(new Date())
			  .claims(claims)
			  .signWith(secretKey)
			  .compact();
	}

	public UserEntity extractUserInfoFromToken(String token) {
		try {
			Jwt<JwsHeader, Claims> jwt = Jwts.parser()
				  .verifyWith(secretKey)
				  .build()
				  .parseSignedClaims(token);

			UserEntity userEntity = new UserEntity();
			userEntity.setId(jwt.getPayload().get("user_id", Long.class));
			userEntity.setUsername(jwt.getPayload().get("username", String.class));

			return userEntity;
		} catch (JwtException e) {
			return null;
		}
	}

}
