<?php
// auth_sys/config/database.php

class AuthDatabase {
    // Credenciales de la BD compartida (Ajusta los valores según tu XAMPP)
    private $host = "localhost";
    private $db_name = "sti_ticket_system";
    private $username = "root"; // Por defecto en XAMPP
    private $password = "";     // Por defecto en XAMPP sin contraseña
    public $conn;

    // Patrón Singleton para evitar múltiples conexiones abiertas
    private static $instance = null;

    private function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            // Configurar PDO para que lance excepciones ante cualquier error SQL
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Evitar emulación de prepares (mayor seguridad)
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $exception) {
            // En producción se guardaría en un log, aquí lo mostramos para depurar
            die("Error de conexión en el módulo Auth: " . $exception->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new AuthDatabase();
        }
        return self::$instance->conn;
    }
}
?>