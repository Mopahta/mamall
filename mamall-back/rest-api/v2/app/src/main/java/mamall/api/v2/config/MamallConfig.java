package mamall.api.v2.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletRegistration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "mamall.api.v2")
public class MamallConfig implements WebApplicationInitializer {

	@Override
	public void onStartup (ServletContext servletContext) {
		AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();

		rootContext.register(MamallConfig.class);

		ServletRegistration.Dynamic dispatcher =
			  servletContext.addServlet("mamall-rest", new DispatcherServlet(rootContext));

		dispatcher.setLoadOnStartup(1);
		dispatcher.addMapping("/");
	}
}
