-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-05-2026 a las 04:07:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sti_ticket_system`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `coordenadas_ubicacion` varchar(100) DEFAULT NULL,
  `telefono_alternativo` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `id_usuario`, `direccion`, `coordenadas_ubicacion`, `telefono_alternativo`) VALUES
(1, 2, '7a Avenida 12-34, Zona 10, Guatemala', NULL, '555-1002'),
(2, 4, '5ta Calle 8-20, Zona 14, Guatemala', NULL, '555-1003');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `controltiempo`
--

CREATE TABLE `controltiempo` (
  `id_control` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `tiempo_limite_segundos` int(11) DEFAULT 1200,
  `tiempo_inicio` datetime NOT NULL,
  `tiempo_fin` datetime DEFAULT NULL,
  `tiempo_cumplido` tinyint(1) DEFAULT 0,
  `liberado_automaticamente` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historialservicio`
--

CREATE TABLE `historialservicio` (
  `id_historial` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `id_usuario_modificador` int(11) DEFAULT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) NOT NULL,
  `accion_realizada` varchar(100) DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT current_timestamp(),
  `ip_origen` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe`
--

CREATE TABLE `informe` (
  `id_informe` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `trabajo_realizado` text DEFAULT NULL,
  `materiales_utilizados` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `fecha_informe` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacion`
--

CREATE TABLE `notificacion` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_ticket` int(11) DEFAULT NULL,
  `tipo` enum('email','sms','whatsapp','push') NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT current_timestamp(),
  `fecha_lectura` datetime DEFAULT NULL,
  `enviado_exitosamente` tinyint(1) DEFAULT 0,
  `error_mensaje` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `metodo_pago` enum('tarjeta','paypal','google_pay','efectivo') NOT NULL,
  `estado_pago` enum('pendiente','completado','fallido','reembolsado') DEFAULT 'pendiente',
  `transaccion_id` varchar(100) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa`
--

CREATE TABLE `tarifa` (
  `id_tarifa` int(11) NOT NULL,
  `tipo_servicio` varchar(100) NOT NULL,
  `monto_base` decimal(10,2) NOT NULL,
  `costo_adicional_por_hora` decimal(10,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tarifa`
--

INSERT INTO `tarifa` (`id_tarifa`, `tipo_servicio`, `monto_base`, `costo_adicional_por_hora`, `activo`, `fecha_actualizacion`) VALUES
(1, 'Mantenimiento preventivo', 150.00, 50.00, 1, '2026-05-15 00:11:00'),
(2, 'Reparación de hardware', 200.00, 75.00, 1, '2026-05-15 00:11:00'),
(3, 'Instalación de software', 100.00, 40.00, 1, '2026-05-15 00:11:00'),
(4, 'Configuración de red', 180.00, 60.00, 1, '2026-05-15 00:11:00'),
(5, 'Soporte remoto', 80.00, 30.00, 1, '2026-05-15 00:11:00'),
(6, 'Emergencia (24h)', 350.00, 100.00, 1, '2026-05-15 00:11:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnico`
--

CREATE TABLE `tecnico` (
  `id_tecnico` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `estado_disponibilidad` enum('disponible','ocupado','en_camino','no_disponible') DEFAULT 'disponible',
  `calificacion_promedio` decimal(3,2) DEFAULT 0.00,
  `total_servicios` int(11) DEFAULT 0,
  `ubicacion_actual` varchar(255) DEFAULT NULL,
  `ultima_ubicacion_actualizacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tecnico`
--

INSERT INTO `tecnico` (`id_tecnico`, `id_usuario`, `especialidad`, `estado_disponibilidad`, `calificacion_promedio`, `total_servicios`, `ubicacion_actual`, `ultima_ubicacion_actualizacion`) VALUES
(1, 3, 'Hardware y Redes', 'disponible', 0.00, 0, NULL, NULL),
(2, 5, 'Software y Sistemas', 'disponible', 0.00, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket`
--

CREATE TABLE `ticket` (
  `id_ticket` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `tipo_servicio` varchar(100) DEFAULT NULL,
  `estado` enum('pendiente','asignado','en_camino','en_proceso','finalizado_pendiente_pago','cerrado','reabierto','cancelado') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_asignacion` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_finalizacion` datetime DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `tiempo_respuesta_segundos` int(11) DEFAULT NULL,
  `tiempo_atencion_segundos` int(11) DEFAULT NULL,
  `calificacion_cliente` int(11) DEFAULT NULL CHECK (`calificacion_cliente` between 1 and 5),
  `comentario_cliente` text DEFAULT NULL,
  `reabierto_contador` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `ticket`
--
DELIMITER $$
CREATE TRIGGER `ActualizarCalificacionTecnico` AFTER UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.estado = 'cerrado' AND NEW.calificacion_cliente IS NOT NULL AND OLD.calificacion_cliente IS NULL THEN
        UPDATE Tecnico t
        SET t.calificacion_promedio = (
            SELECT AVG(calificacion_cliente) 
            FROM Ticket 
            WHERE id_tecnico = NEW.id_tecnico 
            AND calificacion_cliente IS NOT NULL
        ),
        t.total_servicios = t.total_servicios + 1
        WHERE t.id_tecnico = NEW.id_tecnico;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `ActualizarControlTiempoAsignacion` AFTER UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.estado = 'asignado' AND OLD.estado = 'pendiente' THEN
        UPDATE ControlTiempo 
        SET tiempo_inicio = NOW()
        WHERE id_ticket = NEW.id_ticket;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `LiberarTecnicoEnCierre` AFTER UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF NEW.estado IN ('cerrado', 'cancelado') AND OLD.estado NOT IN ('cerrado', 'cancelado') THEN
        UPDATE Tecnico 
        SET estado_disponibilidad = 'disponible'
        WHERE id_tecnico = NEW.id_tecnico;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `RegistrarHistorialEstado` AFTER UPDATE ON `ticket` FOR EACH ROW BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO HistorialServicio (id_ticket, estado_anterior, estado_nuevo, fecha_cambio)
        VALUES (NEW.id_ticket, OLD.estado, NEW.estado, NOW());
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `tipo` enum('cliente','tecnico','administrador') NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `contrasena`, `tipo`, `telefono`, `fecha_registro`, `ultimo_acceso`, `activo`, `intentos_fallidos`, `bloqueado`) VALUES
(1, 'Admin STI', 'admin@sti.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrador', '555-0001', '2026-05-15 00:11:00', NULL, 1, 0, 0),
(2, 'Carlos Cliente', 'cliente@sti.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', '555-1001', '2026-05-15 00:11:00', NULL, 1, 0, 0),
(3, 'Ana Técnica', 'tecnico@sti.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tecnico', '555-2001', '2026-05-15 00:11:00', NULL, 1, 0, 0),
(4, 'Pedro Cliente2', 'pedro@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', '555-1002', '2026-05-15 00:11:00', NULL, 1, 0, 0),
(5, 'Laura Tecnico2', 'laura@tecnico.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tecnico', '555-2002', '2026-05-15 00:11:00', NULL, 1, 0, 0);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vistadashboardmetricas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vistadashboardmetricas` (
`total_tickets` bigint(21)
,`tickets_pendientes` decimal(22,0)
,`tickets_en_curso` decimal(22,0)
,`tickets_cerrados_hoy` decimal(22,0)
,`tickets_hoy` decimal(22,0)
,`satisfaccion_promedio` decimal(13,2)
,`tecnicos_disponibles` bigint(21)
,`tiempo_respuesta_promedio` decimal(11,0)
,`tiempo_atencion_promedio` decimal(11,0)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vistahistorialcompleto`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vistahistorialcompleto` (
`id_ticket` int(11)
,`descripcion` text
,`estado_actual` enum('pendiente','asignado','en_camino','en_proceso','finalizado_pendiente_pago','cerrado','reabierto','cancelado')
,`cliente` varchar(100)
,`tecnico` varchar(100)
,`estado_anterior` varchar(50)
,`estado_nuevo` varchar(50)
,`accion_realizada` varchar(100)
,`fecha_cambio` datetime
,`ip_origen` varchar(45)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vistaticketsactivos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vistaticketsactivos` (
`id_ticket` int(11)
,`descripcion` text
,`tipo_servicio` varchar(100)
,`estado` enum('pendiente','asignado','en_camino','en_proceso','finalizado_pendiente_pago','cerrado','reabierto','cancelado')
,`prioridad` enum('baja','media','alta')
,`fecha_creacion` datetime
,`cliente_direccion` varchar(255)
,`cliente_nombre` varchar(100)
,`cliente_telefono` varchar(20)
,`id_tecnico` int(11)
,`tecnico_nombre` varchar(100)
,`tecnico_telefono` varchar(20)
,`tecnico_especialidad` varchar(100)
,`minutos_espera` bigint(21)
,`tiempo_limite_segundos` int(11)
,`tiempo_cumplido` tinyint(1)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vistadashboardmetricas`
--
DROP TABLE IF EXISTS `vistadashboardmetricas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vistadashboardmetricas`  AS SELECT count(0) AS `total_tickets`, sum(case when `ticket`.`estado` = 'pendiente' then 1 else 0 end) AS `tickets_pendientes`, sum(case when `ticket`.`estado` in ('asignado','en_camino','en_proceso') then 1 else 0 end) AS `tickets_en_curso`, sum(case when `ticket`.`estado` = 'cerrado' and cast(`ticket`.`fecha_cierre` as date) = curdate() then 1 else 0 end) AS `tickets_cerrados_hoy`, sum(case when cast(`ticket`.`fecha_creacion` as date) = curdate() then 1 else 0 end) AS `tickets_hoy`, round(avg(case when `ticket`.`calificacion_cliente` is not null then `ticket`.`calificacion_cliente` end),2) AS `satisfaccion_promedio`, (select count(0) from `tecnico` where `tecnico`.`estado_disponibilidad` = 'disponible') AS `tecnicos_disponibles`, round(avg(`ticket`.`tiempo_respuesta_segundos`),0) AS `tiempo_respuesta_promedio`, round(avg(`ticket`.`tiempo_atencion_segundos`),0) AS `tiempo_atencion_promedio` FROM `ticket` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vistahistorialcompleto`
--
DROP TABLE IF EXISTS `vistahistorialcompleto`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vistahistorialcompleto`  AS SELECT `t`.`id_ticket` AS `id_ticket`, `t`.`descripcion` AS `descripcion`, `t`.`estado` AS `estado_actual`, `u_cliente`.`nombre` AS `cliente`, `u_tecnico`.`nombre` AS `tecnico`, `hs`.`estado_anterior` AS `estado_anterior`, `hs`.`estado_nuevo` AS `estado_nuevo`, `hs`.`accion_realizada` AS `accion_realizada`, `hs`.`fecha_cambio` AS `fecha_cambio`, `hs`.`ip_origen` AS `ip_origen` FROM (((((`ticket` `t` join `cliente` `c` on(`t`.`id_cliente` = `c`.`id_cliente`)) join `usuario` `u_cliente` on(`c`.`id_usuario` = `u_cliente`.`id_usuario`)) left join `tecnico` `tec` on(`t`.`id_tecnico` = `tec`.`id_tecnico`)) left join `usuario` `u_tecnico` on(`tec`.`id_usuario` = `u_tecnico`.`id_usuario`)) join `historialservicio` `hs` on(`t`.`id_ticket` = `hs`.`id_ticket`)) ORDER BY `hs`.`fecha_cambio` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vistaticketsactivos`
--
DROP TABLE IF EXISTS `vistaticketsactivos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vistaticketsactivos`  AS SELECT `t`.`id_ticket` AS `id_ticket`, `t`.`descripcion` AS `descripcion`, `t`.`tipo_servicio` AS `tipo_servicio`, `t`.`estado` AS `estado`, `t`.`prioridad` AS `prioridad`, `t`.`fecha_creacion` AS `fecha_creacion`, `c`.`direccion` AS `cliente_direccion`, `u_cliente`.`nombre` AS `cliente_nombre`, `u_cliente`.`telefono` AS `cliente_telefono`, `tec`.`id_tecnico` AS `id_tecnico`, `u_tecnico`.`nombre` AS `tecnico_nombre`, `u_tecnico`.`telefono` AS `tecnico_telefono`, `tec`.`especialidad` AS `tecnico_especialidad`, timestampdiff(MINUTE,`t`.`fecha_creacion`,current_timestamp()) AS `minutos_espera`, `ct`.`tiempo_limite_segundos` AS `tiempo_limite_segundos`, `ct`.`tiempo_cumplido` AS `tiempo_cumplido` FROM (((((`ticket` `t` join `cliente` `c` on(`t`.`id_cliente` = `c`.`id_cliente`)) join `usuario` `u_cliente` on(`c`.`id_usuario` = `u_cliente`.`id_usuario`)) left join `tecnico` `tec` on(`t`.`id_tecnico` = `tec`.`id_tecnico`)) left join `usuario` `u_tecnico` on(`tec`.`id_usuario` = `u_tecnico`.`id_usuario`)) left join `controltiempo` `ct` on(`t`.`id_ticket` = `ct`.`id_ticket`)) WHERE `t`.`estado` not in ('cerrado','cancelado') ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_direccion` (`direccion`);

--
-- Indices de la tabla `controltiempo`
--
ALTER TABLE `controltiempo`
  ADD PRIMARY KEY (`id_control`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `idx_ticket` (`id_ticket`),
  ADD KEY `idx_tiempo_cumplido` (`tiempo_cumplido`);

--
-- Indices de la tabla `historialservicio`
--
ALTER TABLE `historialservicio`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_ticket` (`id_ticket`),
  ADD KEY `idx_fecha_cambio` (`fecha_cambio`),
  ADD KEY `idx_usuario` (`id_usuario_modificador`);

--
-- Indices de la tabla `informe`
--
ALTER TABLE `informe`
  ADD PRIMARY KEY (`id_informe`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `idx_fecha_informe` (`fecha_informe`);

--
-- Indices de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `idx_usuario` (`id_usuario`),
  ADD KEY `idx_ticket` (`id_ticket`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_fecha_envio` (`fecha_envio`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_notificacion_usuario_leida` (`id_usuario`,`leida`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `idx_estado_pago` (`estado_pago`),
  ADD KEY `idx_fecha_pago` (`fecha_pago`),
  ADD KEY `idx_transaccion` (`transaccion_id`),
  ADD KEY `idx_pago_estado_fecha` (`estado_pago`,`fecha_pago`);

--
-- Indices de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  ADD PRIMARY KEY (`id_tarifa`),
  ADD UNIQUE KEY `tipo_servicio` (`tipo_servicio`),
  ADD KEY `idx_tipo_servicio` (`tipo_servicio`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `tecnico`
--
ALTER TABLE `tecnico`
  ADD PRIMARY KEY (`id_tecnico`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_estado_disponibilidad` (`estado_disponibilidad`),
  ADD KEY `idx_calificacion` (`calificacion_promedio`);

--
-- Indices de la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id_ticket`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_cliente` (`id_cliente`),
  ADD KEY `idx_tecnico` (`id_tecnico`),
  ADD KEY `idx_estado_fecha` (`estado`,`fecha_creacion`),
  ADD KEY `idx_ticket_estado_fecha` (`estado`,`fecha_creacion`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `controltiempo`
--
ALTER TABLE `controltiempo`
  MODIFY `id_control` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historialservicio`
--
ALTER TABLE `historialservicio`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `informe`
--
ALTER TABLE `informe`
  MODIFY `id_informe` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  MODIFY `id_tarifa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tecnico`
--
ALTER TABLE `tecnico`
  MODIFY `id_tecnico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `controltiempo`
--
ALTER TABLE `controltiempo`
  ADD CONSTRAINT `controltiempo_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historialservicio`
--
ALTER TABLE `historialservicio`
  ADD CONSTRAINT `historialservicio_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `historialservicio_ibfk_2` FOREIGN KEY (`id_usuario_modificador`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `informe`
--
ALTER TABLE `informe`
  ADD CONSTRAINT `informe_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notificacion_ibfk_2` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tecnico`
--
ALTER TABLE `tecnico`
  ADD CONSTRAINT `tecnico_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnico` (`id_tecnico`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
