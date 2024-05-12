package tech.mamall.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tech.mamall.exception.InvalidTokenException;
import tech.mamall.model.UserEntity;
import tech.mamall.service.JwtService;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	// TODO: jwt filter
	// TODO: base rest api functionality
	@Override
	@SneakyThrows
	protected void doFilterInternal(HttpServletRequest request,
						  @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) {
		String token = null;

		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if (cookie.getName().equals("token")) {
					token = cookie.getValue();
				}
			}
		}

		if (token == null) {
			filterChain.doFilter(request, response);
			return;
		}

		UserEntity user;
		try {
			user = jwtService.extractUserInfoFromToken(token);
		} catch (InvalidTokenException ignored) {
			filterChain.doFilter(request, response);
			return;
		}

		if(user.getUsername() != null) {
			SecurityContext context = SecurityContextHolder.createEmptyContext();

			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
				  user,
				  null,
				  user.getAuthorities()
			);

			authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			context.setAuthentication(authToken);
			SecurityContextHolder.setContext(context);
		}

		filterChain.doFilter(request, response);
	}
}
