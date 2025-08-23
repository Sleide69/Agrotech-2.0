using ExportModule.Data.Context;
using ExportModule.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ExportModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User login)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == login.Username && u.Password == login.Password);

            if (user == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

            var token = GenerateJwtToken(user);

            return Ok(new { token });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] User newUser)
        {
            // Validar si el usuario ya existe
            var existingUser = _context.Users.FirstOrDefault(u => u.Username == newUser.Username);
            if (existingUser != null)
            {
                return BadRequest(new { message = "El usuario ya existe" });
            }

            // Aquí puedes agregar lógica para encriptar la contraseña si quieres

            // Agregar usuario a la base de datos
            _context.Users.Add(newUser);
            _context.SaveChanges();

            return CreatedAtAction(nameof(Register), new { id = newUser.Id }, newUser);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtConfig = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]));

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username)
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtConfig["Issuer"],
                audience: jwtConfig["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
