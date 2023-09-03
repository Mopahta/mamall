package mamall.api.v2;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

public class Main {
	private static final int PORT = 8080;

	public static void main (String[] args) {
		Tomcat server = new Tomcat();

		server.setPort(PORT);

		try {
			server.start();
			server.getServer().await();
		}
		catch (LifecycleException e){
			System.out.println(e.toString());
		}
	}
}
