package mamall.api.v2.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

@Configuration
@EnableWebMvc
@ComponentScan("mamall.api.v2")
public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

	@Override
	protected Class<?>[] getRootConfigClasses() {
		return new Class<?>[] { AppInitializer.class };
	}

	@Override
	protected Class<?>[] getServletConfigClasses () {
		return new Class[0];
	}

	@Override
	protected String[] getServletMappings() {
		return new String[] { "/*" };
	}
}
