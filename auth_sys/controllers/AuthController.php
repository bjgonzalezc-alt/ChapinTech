<?php
// auth_sys/controllers/AuthController.php
session_start();

// Importamos la conexión a la BD y el configurador de correos
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mailer_setup.php';

// ESTRICTAMENTE NECESARIO: Configurar la zona horaria de Guatemala
// Si no hacemos esto, el servidor podría calcular la hora de expiración del OTP con UTC
// y el código nacería ya expirado para el usuario local.
date_default_timezone_set('America/Guatemala');

class AuthController {
    private $conn;

    public function __construct() {
        // Obtenemos la instancia Singleton de nuestra conexión encapsulada
        $this->conn = AuthDatabase::getInstance();
    }

    /**
     * Procesa el registro de un nuevo usuario (Rol por defecto: Cliente)
     */
    public function registrarUsuario($datosPost) {
        try {
            // 1. Saneamiento básico de entradas para evitar ataques XSS
            $nombre = htmlspecialchars(strip_tags(trim($datosPost['nombre'])));
            $email = filter_var(trim($datosPost['email']), FILTER_SANITIZE_EMAIL);
            $password = trim($datosPost['password']);
            $telefono = htmlspecialchars(strip_tags(trim($datosPost['telefono'])));
            $direccion = htmlspecialchars(strip_tags(trim($datosPost['direccion'])));

            // 2. Validación rápida
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("El formato del correo es inválido.");
            }

            // 3. Verificar si el correo ya existe en la tabla usuario
            $stmtCheck = $this->conn->prepare("SELECT id_usuario FROM usuario WHERE email = :email LIMIT 1");
            $stmtCheck->bindParam(":email", $email);
            $stmtCheck->execute();
            if ($stmtCheck->rowCount() > 0) {
                throw new Exception("Este correo ya está registrado.");
            }

            // 4. Seguridad: Hashing de la contraseña (NUNCA guardar en texto plano)
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            // 5. Generación del OTP (Código de 6 dígitos) y tiempo de expiración (+15 min)
            $otpCode = random_int(100000, 999999);
            $otpExpiracion = date("Y-m-d H:i:s", strtotime('+15 minutes'));

            // 6. INICIO DE TRANSACCIÓN: Aseguramos que ambas inserciones (usuario y cliente) sean exitosas
            $this->conn->beginTransaction();

            // Preparar el INSERT para la tabla `usuario`
            $queryUsuario = "INSERT INTO usuario 
                (nombre, email, contrasena, tipo, telefono, otp_code, otp_expiracion, email_verificado) 
                VALUES (:nombre, :email, :contrasena, 'cliente', :telefono, :otp_code, :otp_expiracion, 0)";
            
            $stmtUsuario = $this->conn->prepare($queryUsuario);
            $stmtUsuario->bindParam(":nombre", $nombre);
            $stmtUsuario->bindParam(":email", $email);
            $stmtUsuario->bindParam(":contrasena", $passwordHash);
            $stmtUsuario->bindParam(":telefono", $telefono);
            $stmtUsuario->bindParam(":otp_code", $otpCode);
            $stmtUsuario->bindParam(":otp_expiracion", $otpExpiracion);
            
            $stmtUsuario->execute();

            // Obtener el ID del usuario recién creado para relacionarlo con la tabla cliente
            $idUsuarioNuevo = $this->conn->lastInsertId();

            // Preparar el INSERT para la tabla `cliente` para mantener integridad referencial
            $queryCliente = "INSERT INTO cliente (id_usuario, direccion) VALUES (:id_usuario, :direccion)";
            $stmtCliente = $this->conn->prepare($queryCliente);
            $stmtCliente->bindParam(":id_usuario", $idUsuarioNuevo);
            $stmtCliente->bindParam(":direccion", $direccion);
            
            $stmtCliente->execute();

            // 7. Si llegamos aquí sin errores, CONFIRMAMOS LA TRANSACCIÓN
            $this->conn->commit();

            // 8. Enviar el correo con el OTP
            $envioCorreo = enviarCorreoOTP($email, $otpCode, $nombre);
            
            if ($envioCorreo === true) {
                // Guardamos el email en sesión temporalmente para la pantalla de verificación
                $_SESSION['email_temporal_otp'] = $email;
                $_SESSION['mensaje_exito'] = "Registro exitoso. Revisa tu correo para verificar tu cuenta.";
                
                // Redirigir a la vista de verificación (la crearemos más adelante)
                header("Location: ../views/verify_otp.php");
                exit();
            } else {
                // Si el correo falla, le avisamos al usuario (aunque la cuenta ya se creó en BD)
                throw new Exception("Cuenta creada, pero hubo un error enviando el correo: " . $envioCorreo);
            }

        } catch (Exception $e) {
            // Si algo falla durante los INSERT, revertimos los cambios en la BD
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            // Guardamos el error en sesión para mostrarlo en el formulario
            $_SESSION['error_registro'] = $e->getMessage();
            header("Location: ../views/register.php");
            exit();
        }
    }

    /**
     * Verifica el código OTP ingresado por el usuario
     */
    public function verificarOTP($datosPost) {
        try {
            // Verificamos que el email exista en la sesión (que venga de registrarse)
            if (!isset($_SESSION['email_temporal_otp'])) {
                throw new Exception("Sesión caducada. Por favor, inicia sesión o regístrate.");
            }

            $email = $_SESSION['email_temporal_otp'];
            // Limpiamos el input
            $codigoIngresado = htmlspecialchars(strip_tags(trim($datosPost['otp_code'])));

            if (empty($codigoIngresado)) {
                throw new Exception("Debes ingresar el código de 6 dígitos.");
            }

            // Usamos la hora de PHP (America/Guatemala) para evitar conflictos con MySQL
            $ahora = date("Y-m-d H:i:s");

            // Buscamos al usuario por correo y código
            $query = "SELECT id_usuario, otp_expiracion FROM usuario 
                      WHERE email = :email AND otp_code = :otp_code LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":otp_code", $codigoIngresado);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new Exception("Código incorrecto.");
            }

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verificamos si el código ya expiró
            if ($ahora > $usuario['otp_expiracion']) {
                throw new Exception("El código ha expirado. Por favor, solicita uno nuevo.");
            }

            // Si el código es correcto y no ha expirado, activamos la cuenta
            $queryUpdate = "UPDATE usuario 
                            SET email_verificado = 1, otp_code = NULL, otp_expiracion = NULL 
                            WHERE id_usuario = :id_usuario";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(":id_usuario", $usuario['id_usuario']);
            $stmtUpdate->execute();

            // Limpiamos la sesión temporal
            unset($_SESSION['email_temporal_otp']);
            
            // Mensaje de éxito para la vista de login
            $_SESSION['mensaje_exito'] = "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.";
            header("Location: ../views/login.php");
            exit();

        } catch (Exception $e) {
            $_SESSION['error_otp'] = $e->getMessage();
            header("Location: ../views/verify_otp.php");
            exit();
        }
    }

    /**
     * Procesa el inicio de sesión y asigna los niveles de acceso (RBAC)
     */
    public function loginUsuario($datosPost) {
        try {
            $email = filter_var(trim($datosPost['email']), FILTER_SANITIZE_EMAIL);
            $password = trim($datosPost['password']);

            if (empty($email) || empty($password)) {
                throw new Exception("Por favor, completa todos los campos.");
            }

            // Buscamos al usuario en la BD
            $query = "SELECT id_usuario, nombre, email, contrasena, tipo, activo, bloqueado, email_verificado, intentos_fallidos 
                      FROM usuario WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new Exception("Credenciales incorrectas.");
            }

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            // 1. Validar si la cuenta está bloqueada por el administrador o por intentos fallidos
            if ($usuario['bloqueado'] == 1 || $usuario['activo'] == 0) {
                throw new Exception("Tu cuenta ha sido suspendida o bloqueada. Contacta a soporte.");
            }

            // 2. Validar si ya pasó el filtro OTP
            if ($usuario['email_verificado'] == 0) {
                // Le guardamos el email en sesión para que la vista de OTP no falle
                $_SESSION['email_temporal_otp'] = $usuario['email'];
                header("Location: ../views/verify_otp.php");
                exit();
            }

            // 3. Verificar contraseña
            if (!password_verify($password, $usuario['contrasena'])) {
                // Lógica de seguridad: Incrementar intentos fallidos
                $intentos = $usuario['intentos_fallidos'] + 1;
                $updateFallo = $this->conn->prepare("UPDATE usuario SET intentos_fallidos = :intentos WHERE id_usuario = :id");
                $updateFallo->bindParam(":intentos", $intentos);
                $updateFallo->bindParam(":id", $usuario['id_usuario']);
                $updateFallo->execute();

                // Si llega a 3 intentos, bloqueamos la cuenta
                if ($intentos >= 3) {
                    $bloquear = $this->conn->prepare("UPDATE usuario SET bloqueado = 1 WHERE id_usuario = :id");
                    $bloquear->bindParam(":id", $usuario['id_usuario']);
                    $bloquear->execute();
                    throw new Exception("Cuenta bloqueada por múltiples intentos fallidos.");
                }

                throw new Exception("Credenciales incorrectas. Intento $intentos de 3.");
            }

            // 4. Si la contraseña es correcta, reiniciamos los intentos fallidos a 0
            if ($usuario['intentos_fallidos'] > 0) {
                $resetIntentos = $this->conn->prepare("UPDATE usuario SET intentos_fallidos = 0 WHERE id_usuario = :id");
                $resetIntentos->bindParam(":id", $usuario['id_usuario']);
                $resetIntentos->execute();
            }

            // 5. ASIGNACIÓN DE ROLES (RBAC) - Sistema de Pesos
            $nivelAcceso = 10; // Nivel por defecto (Cliente)
            switch (strtolower($usuario['tipo'])) {
                case 'administrador':
                    $nivelAcceso = 100;
                    break;
                case 'soporte':
                    $nivelAcceso = 80;
                    break;
                case 'tecnico':
                    $nivelAcceso = 50;
                    break;
                case 'cliente':
                    $nivelAcceso = 10;
                    break;
            }

            // 6. Crear la sesión del usuario
            $_SESSION['usuario_id'] = $usuario['id_usuario'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
            $_SESSION['usuario_email'] = $usuario['email'];
            $_SESSION['usuario_rol'] = $usuario['tipo'];
            $_SESSION['nivel_acceso'] = $nivelAcceso; // Esta es la variable mágica para restringir vistas

            // 7. Redirección basada en rol
            if ($nivelAcceso >= 80) {
                header("Location: ../admin.html"); // Admin y Soporte van al panel de gestión
            } else if ($nivelAcceso == 50) {
                header("Location: ../techportal.html"); // Los técnicos van a su portal (ajusta la ruta según tu proyecto)
            } else {
                header("Location: ../index.html"); // Los clientes van al inicio
            }
            exit();

        } catch (Exception $e) {
            $_SESSION['error_login'] = $e->getMessage();
            header("Location: ../views/login.php");
            exit();
        }
    }
}

// =========================================================================
// ENRUTADOR BÁSICO DEL CONTROLADOR
// Esto intercepta las peticiones POST enviadas desde los formularios HTML
// =========================================================================

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $authController = new AuthController();

    // Identificar qué acción se está solicitando mediante un campo oculto en el formulario
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'register':
                $authController->registrarUsuario($_POST);
                break;
            case 'verify_otp': // <--- NUEVO CASO AGREGADO
                $authController->verificarOTP($_POST);
                break;
            case 'login':
                $authController->loginUsuario($_POST);
                break;
            default:
                header("Location: ../views/login.php");
                exit();
        }
    }
}
?>