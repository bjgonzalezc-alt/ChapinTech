<?php
// auth_sys/views/admin_usuarios.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Validación redundante en la vista para evitar la visualización de datos confidenciales
if (!isset($_SESSION['nivel_acceso']) || $_SESSION['nivel_acceso'] < 80) {
    header("Location: login.php");
    exit();
}

require_once __DIR__ . '/../controllers/UserController.php';
$controller = new UserController();
$usuarios = $controller->listarUsuarios();

$nivelLogueado = $_SESSION['nivel_acceso'];
$rolLogueado = $_SESSION['usuario_rol'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChapinTech | Control de Usuarios</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #020617;
            color: white;
            margin: 0;
            padding: 20px;
            background-image: radial-gradient(circle at 50% 20%, rgba(99,230,255,.05), transparent 50%);
        }
        .container {
            max-width: 1200px;
            margin: 40px auto;
            background: rgba(255,255,255,.03);
            border: 1px solid rgba(99,230,255,.12);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 0 50px rgba(34,211,238,.05);
            backdrop-filter: blur(18px);
        }
        .header-panel {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,.08);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h2 {
            font-family: 'Orbitron', sans-serif;
            color: #63e6ff;
            margin: 0;
        }
        .user-badge {
            background: rgba(99,230,255,.12);
            border: 1px solid rgba(99,230,255,.3);
            color: #63e6ff;
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        .alert {
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 25px;
            font-size: 0.9rem;
            text-align: center;
        }
        .alert-success { background: rgba(0, 255, 128, 0.1); color: #00ff80; border: 1px solid rgba(0, 255, 128, 0.3); }
        .alert-error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            font-family: 'Orbitron', sans-serif;
            color: rgba(255,255,255,.6);
            text-align: left;
            padding: 15px;
            font-size: 0.85rem;
            letter-spacing: 1px;
            border-bottom: 2px solid rgba(255,255,255,.08);
        }
        td {
            padding: 15px;
            border-bottom: 1px solid rgba(255,255,255,.05);
            font-size: 0.95rem;
        }
        tr:hover td {
            background: rgba(255,255,255,.01);
        }
        select {
            padding: 8px 12px;
            border-radius: 8px;
            background: #07111f;
            color: white;
            border: 1px solid rgba(99,230,255,.2);
            outline: none;
            cursor: pointer;
        }
        .btn {
            padding: 8px 14px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 0.85rem;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-danger {
            background: rgba(255, 77, 77, 0.15);
            color: #ff4d4d;
            border: 1px solid rgba(255, 77, 77, 0.4);
        }
        .btn-danger:hover:not(:disabled) {
            background: #ff4d4d;
            color: black;
            box-shadow: 0 0 15px rgba(255,77,77,0.4);
        }
        .btn:disabled {
            opacity: 0.2;
            cursor: not-allowed;
        }
        .action-form {
            display: inline-block;
            margin: 0;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header-panel">
        <div>
            <h2>Panel de Control RBAC</h2>
            <p style="color: rgba(255,255,255,.5); margin: 5px 0 0 0; font-size: 0.9rem;">
                Supervisión del Sistema Operativo Técnico e identidades.
            </p>
        </div>
        <div class="user-badge">
            Operador: <?= htmlspecialchars($_SESSION['usuario_nombre']) ?> (<?= htmlspecialchars(ucfirst($rolLogueado)) ?>)
        </div>
    </div>

    <?php if (isset($_SESSION['mensaje_gestion'])): ?>
        <div class="alert alert-success">
            <?= $_SESSION['mensaje_gestion']; unset($_SESSION['mensaje_gestion']); ?>
        </div>
    <?php endif; ?>

    <?php if (isset($_SESSION['error_gestion'])): ?>
        <div class="alert alert-error">
            <?= $_SESSION['error_gestion']; unset($_SESSION['error_gestion']); ?>
        </div>
    <?php endif; ?>

    <table>
        <thead>
            <tr>
                <th>Usuario / Operario</th>
                <th>Correo Electrónico</th>
                <th>Fecha de Alta</th>
                <th>Nivel / Permisos</th>
                <th>Acción Operativa</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($usuarios as $usr): 
                $rolTarget = strtolower($usr['tipo']);
                
                // Determinamos el nivel de peso de la fila actual
                $pesoTarget = 10;
                if ($rolTarget === 'administrador') $pesoTarget = 100;
                elseif ($rolTarget === 'soporte') $pesoTarget = 80;
                elseif ($rolTarget === 'tecnico') $pesoTarget = 50;

                // LÓGICA DE CONTROL VISUAL:
                // El usuario puede modificar el rol si es Admin, o si es Soporte y la fila no pertenece a un Admin.
                $puedeModificarRol = ($nivelLogueado == 100 || ($nivelLogueado == 80 && $rolTarget !== 'administrador'));
                
                // El usuario puede eliminar si es Admin, o si es Soporte y la fila tiene un nivel estrictamente menor a 80.
                // Además, nadie puede eliminarse a sí mismo.
                $puedeEliminar = ($nivelLogueado == 100 || ($nivelLogueado == 80 && $pesoTarget < 80)) && ($usr['id_usuario'] != $_SESSION['usuario_id']);
            ?>
            <tr>
                <td><?= htmlspecialchars($usr['nombre']) ?></td>
                <td><?= htmlspecialchars($usr['email']) ?></td>
                <td><?= htmlspecialchars(date("d/m/Y H:i", strtotime($usr['fecha_registro']))) ?></td>
                <td>
                    <form action="../controllers/UserController.php" method="POST" class="action-form">
                        <input type="hidden" name="action" value="update_role">
                        <input type="hidden" name="id_usuario" value="<?= $usr['id_usuario'] ?>">
                        
                        <select name="nuevo_rol" onchange="this.form.submit()" <?= !$puedeModificarRol ? 'disabled' : '' ?>>
                            <option value="cliente" <?= $rolTarget === 'cliente' ? 'selected' : '' ?>>Cliente</option>
                            <option value="tecnico" <?= $rolTarget === 'tecnico' ? 'selected' : '' ?>>Técnico</option>
                            <option value="soporte" <?= $rolTarget === 'soporte' ? 'selected' : '' ?>>Soporte</option>
                            <option value="administrador" <?= $rolTarget === 'administrador' ? 'selected' : '' ?> <?= $nivelLogueado < 100 ? 'disabled' : '' ?>>Administrador</option>
                        </select>
                    </form>
                </td>
                <td>
                    <form action="../controllers/UserController.php" method="POST" class="action-form" onsubmit="return confirm('¿Confirmas la remoción permanente de este registro?');">
                        <input type="hidden" name="action" value="delete_user">
                        <input type="hidden" name="id_usuario" value="<?= $usr['id_usuario'] ?>">
                        <button type="submit" class="btn btn-danger" <?= !$puedeEliminar ? 'disabled' : '' ?>>
                            Eliminar
                        </button>
                    </form>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

</body>
</html>