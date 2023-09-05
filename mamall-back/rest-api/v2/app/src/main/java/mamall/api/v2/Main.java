package mamall.api.v2;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class Main {
	private static final int PORT = 8080;

	public static void main (String[] args) {
		Tomcat server = new Tomcat();
		String appbase = ".";

		server.setPort(PORT);
		server.getHost().setAppBase(appbase);
		server.addWebapp("", appbase);

		try {
			server.start();
			server.getServer().await();
		}
		catch (LifecycleException e){
			System.out.println(e.toString());
		}
	}
}
