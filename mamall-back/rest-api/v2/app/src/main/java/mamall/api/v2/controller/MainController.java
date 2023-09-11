package mamall.api.v2.controller;

import mamall.api.v2.annotation.ApiController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ApiController
public class MainController {

	@GetMapping()
	public String index() {
		return "hey";
	}

}
