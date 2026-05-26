<?php
session_start();
// Si el usuario ya está logueado, no tiene sentido que vea la página de registro
if (isset($_SESSION['usuario_id'])) {
    if ($_SESSION['nivel_acceso'] >= 80) header("Location: admin_usuarios.php");
    else header("Location: ../index.html");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChapinTech | Registro de Usuario</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #020617;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            background-image: radial-gradient(circle at 50% 20%, rgba(99,230,255,.08), transparent 40%);
            box-sizing: border-box;
        }
        .register-container {
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(99,230,255,.12);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 0 40px rgba(34,211,238,.08);
            backdrop-filter: blur(18px);
        }
        h2 {
            font-family: 'Orbitron', sans-serif;
            color: #63e6ff;
            text-align: center;
            margin-bottom: 25px;
        }
        .alert {
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            text-align: center;
        }
        .alert-error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); }
        .input-group {
            margin-bottom: 18px;
        }
        .input-group label {
            display: block;
            font-size: 0.9rem;
            color: rgba(255,255,255,.68);
            margin-bottom: 8px;
        }
        .input-group input, .input-group textarea {
            width: 100%;
            padding: 14px 18px;
            border-radius: 14px;
            background: #07111f;
            color: white;
            border: 1px solid rgba(99,230,255,.12);
            font-size: 0.95rem;
            box-sizing: border-box;
            outline: none;
            transition: 0.3s;
            font-family: 'Inter', sans-serif;
        }
        .input-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        .input-group input:focus, .input-group textarea:focus {
            border-color: #63e6ff;
            box-shadow: 0 0 15px rgba(99,230,255,.15);
        }
        .error-message {
            color: #ff4d4d;
            font-size: 0.8rem;
            margin-top: 5px;
            display: none;
        }
        button {
            margin-top: 15px;
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 14px;
            font-weight: 800;
            background: linear-gradient(90deg, #63e6ff, #3ba7ff);
            color: black;
            font-size: 1rem;
            cursor: pointer;
            transition: 0.3s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 25px rgba(99,230,255,.35);
        }
        .footer-links {
            margin-top: 25px;
            text-align: center;
            font-size: 0.85rem;
        }
        .footer-links a {
            color: #3ba7ff;
            text-decoration: none;
            transition: 0.2s;
        }
        .footer-links a:hover {
            color: #63e6ff;
            text-shadow: 0 0 10px rgba(99,230,255,.5);
        }
    </style>
</head>
<body>

    <div class="register-container">
        <h2>Crear Cuenta</h2>

        <?php if (isset($_SESSION['error_registro'])): ?>
            <div class="alert alert-error">
                <?= $_SESSION['error_registro']; unset($_SESSION['error_registro']); ?>
            </div>
        <?php endif; ?>

        <form action="../controllers/AuthController.php" method="POST" id="registerForm">
            <input type="hidden" name="action" value="register">
            
            <div class="input-group">
                <label for="nombre">Nombre Completo</label>
                <input type="text" id="nombre" name="nombre" required placeholder="Ej. Carlos Méndez">
            </div>

            <div class="input-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" name="email" required placeholder="correo@ejemplo.com">
            </div>

            <div class="input-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="Mínimo 8 caracteres">
                <div class="error-message" id="passwordError">La contraseña debe tener al menos 8 caracteres.</div>
            </div>

            <div class="input-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required placeholder="Ej. 5555-1002">
            </div>

            <div class="input-group">
                <label for="direccion">Dirección</label>
                <textarea id="direccion" name="direccion" required placeholder="Ej. 7a Avenida 12-34, Zona 10, Guatemala"></textarea>
            </div>

            <button type="submit">Registrarse</button>
        </form>

        <div class="footer-links">
            <p>¿Ya tienes cuenta? <a href="login.php">Inicia Sesión</a></p>
        </div>
    </div>

    <script>
        // Validación del lado del cliente antes de enviar el formulario
        document.getElementById('registerForm').addEventListener('submit', function(event) {
            const passwordInput = document.getElementById('password').value;
            const passwordError = document.getElementById('passwordError');

            if (passwordInput.length < 8) {
                event.preventDefault(); // Detiene el envío del formulario
                passwordError.style.display = 'block';
                document.getElementById('password').focus();
            } else {
                passwordError.style.display = 'none';
            }
        });
    </script>

</body>
</html>