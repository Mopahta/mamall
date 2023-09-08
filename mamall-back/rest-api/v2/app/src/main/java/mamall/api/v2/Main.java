package mamall.api.v2;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class Main {
	private static final int PORT = 8001;

	public static void main (String[] args) throws LifecycleException {

		String appBase = ".";
		Tomcat tomcat = new Tomcat();
		tomcat.setPort(PORT);
		tomcat.getHost().setAppBase(appBase);
		tomcat.addWebapp("", appBase);
		tomcat.getConnector();
		tomcat.start();
		tomcat.getServer().await();

	}
}
