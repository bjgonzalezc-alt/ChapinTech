<?php
// auth_sys/views/verify_otp.php
session_start();

// Si no hay un correo en sesión, significa que el usuario intentó entrar aquí por URL directa
if (!isset($_SESSION['email_temporal_otp'])) {
    header("Location: register.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChapinTech | Verificar Cuenta</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        /* Estilos básicos integrados para encapsulamiento y rapidez */
        body {
            font-family: 'Inter', sans-serif;
            background: #020617; /* Fondo oscuro del proyecto */
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .otp-container {
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(99,230,255,.12);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 40px rgba(34,211,238,.08);
            backdrop-filter: blur(18px);
        }
        h2 {
            font-family: 'Orbitron', sans-serif;
            color: #63e6ff;
            margin-bottom: 10px;
        }
        p {
            color: rgba(255,255,255,.68);
            font-size: 0.95rem;
            margin-bottom: 30px;
        }
        .alert {
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        .alert-success { background: rgba(0, 255, 128, 0.1); color: #00ff80; border: 1px solid rgba(0, 255, 128, 0.3); }
        .alert-error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); }
        input[type="text"] {
            width: 100%;
            padding: 18px 20px;
            border-radius: 18px;
            background: #07111f;
            color: white;
            border: 1px solid rgba(99,230,255,.12);
            font-size: 1.5rem;
            text-align: center;
            letter-spacing: 5px;
            box-sizing: border-box;
            outline: none;
            transition: 0.3s;
        }
        input[type="text"]:focus {
            border-color: #63e6ff;
            box-shadow: 0 0 20px rgba(99,230,255,.15);
        }
        button {
            margin-top: 20px;
            width: 100%;
            padding: 18px;
            border: none;
            border-radius: 18px;
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
    </style>
</head>
<body>

    <div class="otp-container">
        <h2>Verificación OTP</h2>
        <p>Hemos enviado un código de 6 dígitos a <strong><?= htmlspecialchars($_SESSION['email_temporal_otp']) ?></strong></p>

        <?php if (isset($_SESSION['mensaje_exito'])): ?>
            <div class="alert alert-success">
                <?= $_SESSION['mensaje_exito']; unset($_SESSION['mensaje_exito']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error_otp'])): ?>
            <div class="alert alert-error">
                <?= $_SESSION['error_otp']; unset($_SESSION['error_otp']); ?>
            </div>
        <?php endif; ?>

        <form action="../controllers/AuthController.php" method="POST">
            <input type="hidden" name="action" value="verify_otp">
            
            <input type="text" name="otp_code" maxlength="6" pattern="\d{6}" placeholder="000000" required autocomplete="off">
            
            <button type="submit">Verificar Cuenta</button>
        </form>
    </div>

</body>
</html>