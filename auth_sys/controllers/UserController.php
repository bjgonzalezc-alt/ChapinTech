<?php
// auth_sys/controllers/UserController.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Requerimos la conexión única encapsulada
require_once __DIR__ . '/../config/database.php';

// PROTECCIÓN DE ACCESO GLOBAL: 
// Si un usuario común (Cliente/Técnico) intenta ejecutar este script, el servidor lo rechaza de inmediato.
if (!isset($_SESSION['nivel_acceso']) || $_SESSION['nivel_acceso'] < 80) {
    header("HTTP/1.1 403 Forbidden");
    exit("Acceso denegado: Privilegios insuficientes.");
}

class UserController {
    private $conn;
    private $usuarioNivel;

    public function __construct() {
        $this->conn = AuthDatabase::getInstance();
        $this->usuarioNivel = $_SESSION['nivel_acceso'];
    }

    /**
     * Devuelve todos los usuarios registrados para la tabla general
     */
    public function listarUsuarios() {
        try {
            // Excluimos la contraseña por seguridad en la transferencia de datos
            $query = "SELECT id_usuario, nombre, email, tipo, activo, bloqueado, fecha_registro 
                      FROM usuario ORDER BY fecha_registro DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Actualiza el rol de un usuario validando las restricciones del emisor
     */
    public function cambiarRol($idUsuarioObjetivo, $nuevoRol) {
        try {
            $nuevoRol = strtolower(trim($nuevoRol));
            
            // Asignación de pesos para validar la jerarquía que se intenta guardar
            $pesoNuevoRol = 10;
            if ($nuevoRol === 'administrador') $pesoNuevoRol = 100;
            elseif ($nuevoRol === 'soporte') $pesoNuevoRol = 80;
            elseif ($nuevoRol === 'tecnico') $pesoNuevoRol = 50;

            // REGLA 1: Un rol Soporte (80) jamás puede promover a alguien a Administrador (100)
            if ($this->usuarioNivel < 100 && $pesoNuevoRol === 100) {
                throw new Exception("No tienes autorización para asignar el rol de Administrador.");
            }

            // Consultamos el estado actual del usuario que se quiere modificar
            $queryCheck = "SELECT tipo FROM usuario WHERE id_usuario = :id LIMIT 1";
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->bindParam(":id", $idUsuarioObjetivo);
            $stmtCheck->execute();
            
            if ($stmtCheck->rowCount() === 0) {
                throw new Exception("El usuario especificado no existe.");
            }
            
            $usuarioObjetivo = $stmtCheck->fetch(PDO::FETCH_ASSOC);
            $rolActualObjetivo = strtolower($usuarioObjetivo['tipo']);

            // REGLA 2: Un rol Soporte (80) no puede modificar los privilegios de un Administrador (100)
            if ($this->usuarioNivel < 100 && $rolActualObjetivo === 'administrador') {
                throw new Exception("No tienes privilegios para modificar a un Administrador.");
            }

            // Si pasa todas las reglas de negocio, se ejecuta la actualización
            $queryUpdate = "UPDATE usuario SET tipo = :nuevo_rol WHERE id_usuario = :id";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(":nuevo_rol", $nuevoRol);
            $stmtUpdate->bindParam(":id", $idUsuarioObjetivo);
            $stmtUpdate->execute();

            $_SESSION['mensaje_gestion'] = "El rol del usuario ha sido actualizado correctamente.";

        } catch (Exception $e) {
            $_SESSION['error_gestion'] = $e->getMessage();
        }
        header("Location: ../views/admin_usuarios.php");
        exit();
    }

    /**
     * Elimina un usuario basándose en las restricciones jerárquicas estrictas
     */
    public function eliminarUsuario($idUsuarioObjetivo) {
        try {
            // Un usuario no puede eliminarse a sí mismo desde este panel
            if ($idUsuarioObjetivo == $_SESSION['usuario_id']) {
                throw new Exception("Operación inválida: No puedes eliminar tu propia sesión.");
            }

            $queryCheck = "SELECT tipo FROM usuario WHERE id_usuario = :id LIMIT 1";
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->bindParam(":id", $idUsuarioObjetivo);
            $stmtCheck->execute();

            if ($stmtCheck->rowCount() === 0) {
                throw new Exception("El usuario no existe.");
            }

            $usuarioObjetivo = $stmtCheck->fetch(PDO::FETCH_ASSOC);
            $rolObjetivo = strtolower($usuarioObjetivo['tipo']);

            $pesoObjetivo = 10;
            if ($rolObjetivo === 'administrador') $pesoObjetivo = 100;
            elseif ($rolObjetivo === 'soporte') $pesoObjetivo = 80;
            elseif ($rolObjetivo === 'tecnico') $pesoObjetivo = 50;

            // REGLA 3: Soporte (80) solo puede borrar cuentas de nivel inferior (< 80: Técnico y Cliente)
            // No puede eliminar administradores ni a otros miembros del equipo de soporte.
            if ($this->usuarioNivel < 100 && $pesoObjetivo >= $this->usuarioNivel) {
                throw new Exception("No tienes los privilegios necesarios para eliminar cuentas de este nivel.");
            }

            // Ejecución del borrado físico
            $queryDelete = "DELETE FROM usuario WHERE id_usuario = :id";
            $stmtDelete = $this->conn->prepare($queryDelete);
            $stmtDelete->bindParam(":id", $idUsuarioObjetivo);
            $stmtDelete->execute();

            $_SESSION['mensaje_gestion'] = "El usuario ha sido eliminado permanentemente del sistema.";

        } catch (Exception $e) {
            $_SESSION['error_gestion'] = $e->getMessage();
        }
        header("Location: ../views/admin_usuarios.php");
        exit();
    }
}

// =========================================================================
// ENRUTADOR POST PARA PETICIONES ADMINISTRATIVAS
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userController = new UserController();

    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'update_role':
                $userController->cambiarRol((int)$_POST['id_usuario'], $_POST['nuevo_rol']);
                break;
                
            case 'delete_user':
                $userController->eliminarUsuario((int)$_POST['id_usuario']);
                break;
        }
    }
}
?>