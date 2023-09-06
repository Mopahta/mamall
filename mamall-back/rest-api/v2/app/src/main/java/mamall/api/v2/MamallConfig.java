package mamall.api.v2;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletRegistration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
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

//		servletContext.addListener(new ContextLoaderListener(rootContext));

//		AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();

		ServletRegistration.Dynamic dispatcher =
			  servletContext.addServlet("mamall", new DispatcherServlet(rootContext));
		dispatcher.setLoadOnStartup(1);
		dispatcher.addMapping("/");
	}
}
