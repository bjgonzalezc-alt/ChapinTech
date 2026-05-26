<?php
// auth_sys/config/mailer_setup.php

// Ajusta las rutas dependiendo de dónde guardes PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../libs/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/src/SMTP.php';

function enviarCorreoOTP($correoDestino, $codigoOTP, $nombreUsuario) {
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP (Ejemplo usando Mailtrap para pruebas, o Gmail)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Cambiar si usas otro proveedor
        $mail->SMTPAuth   = true;
        
        // CORREO Y CONTRASEÑA DE APLICACIÓN (No uses tu password normal de Gmail)
        $mail->Username   = '************'; 
        $mail->Password   = '*********'; 
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Remitente y Destinatario
        $mail->setFrom('************', 'ChapinTech Auth');
        $mail->addAddress($correoDestino, $nombreUsuario);

        // Contenido del correo
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Verifica tu cuenta - Código OTP';
        
        // Cuerpo del correo con un diseño básico y limpio
        $mail->Body    = "
            <h2>¡Hola, {$nombreUsuario}!</h2>
            <p>Gracias por registrarte. Para activar tu cuenta, ingresa el siguiente código de verificación:</p>
            <h1 style='color: #3ba7ff; letter-spacing: 5px;'>{$codigoOTP}</h1>
            <p><em>Este código expirará en 15 minutos.</em></p>
            <p>Si no solicitaste este registro, ignora este correo.</p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Retornamos el error para manejarlo en el controlador
        return "El mensaje no pudo ser enviado. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>