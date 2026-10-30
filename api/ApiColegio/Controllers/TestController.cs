using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    [Authorize]
    [HttpGet("privado")]
    public IActionResult Privado()
    {
        return Ok("Accediste con token válido");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult SoloAdmin()
    {
        return Ok("Solo Admin puede ver esto");
    }
}
