<?php
session_start();
// Si ya hay una sesión activa, lo sacamos del login
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
    <title>ChapinTech | Iniciar Sesión</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #020617;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-image: radial-gradient(circle at 50% 20%, rgba(99,230,255,.08), transparent 40%);
        }
        .login-container {
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(99,230,255,.12);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
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
        .alert-success { background: rgba(0, 255, 128, 0.1); color: #00ff80; border: 1px solid rgba(0, 255, 128, 0.3); }
        .alert-error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); }
        .input-group {
            margin-bottom: 20px;
        }
        .input-group label {
            display: block;
            font-size: 0.9rem;
            color: rgba(255,255,255,.68);
            margin-bottom: 8px;
        }
        .input-group input {
            width: 100%;
            padding: 15px 18px;
            border-radius: 14px;
            background: #07111f;
            color: white;
            border: 1px solid rgba(99,230,255,.12);
            font-size: 1rem;
            box-sizing: border-box;
            outline: none;
            transition: 0.3s;
        }
        .input-group input:focus {
            border-color: #63e6ff;
            box-shadow: 0 0 15px rgba(99,230,255,.15);
        }
        button {
            margin-top: 10px;
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

    <div class="login-container">
        <h2>Acceso al Sistema</h2>

        <?php if (isset($_SESSION['mensaje_exito'])): ?>
            <div class="alert alert-success">
                <?= $_SESSION['mensaje_exito']; unset($_SESSION['mensaje_exito']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error_login'])): ?>
            <div class="alert alert-error">
                <?= $_SESSION['error_login']; unset($_SESSION['error_login']); ?>
            </div>
        <?php endif; ?>

        <form action="../controllers/AuthController.php" method="POST">
            <input type="hidden" name="action" value="login">
            
            <div class="input-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" name="email" required placeholder="correo@ejemplo.com">
            </div>

            <div class="input-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required placeholder="••••••••">
            </div>

            <button type="submit">Iniciar Sesión</button>
        </form>

        <div class="footer-links">
            <p>¿No tienes cuenta? <a href="register.php">Regístrate aquí</a></p>
        </div>
    </div>

</body>
</html>