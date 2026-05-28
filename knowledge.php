<?php
/**
 * GEMA AI Light — Base de Conocimiento ERP Transport TIASTICA
 */
function getKnowledgeBase() {
    return <<<EOK
=== ERP GM TRANSPORT SOFTWARE® ===

DESCRIPCIÓN GENERAL:
Sistema ERP 100% en la nube para empresas de transporte de carga. Accesible desde cualquier dispositivo con Google Chrome. Sin instalación local, sin servidor propio, con respaldos automáticos y actualizaciones en línea transparentes. Desarrollado específicamente para el sector transporte con presencia en México, USA y Perú.

VENTAJAS COMPETITIVAS:
- 100% en la nube (SaaS) — sin servidores ni instalaciones locales
- Acceso desde cualquier dispositivo (PC, tablet, smartphone) con Chrome
- Actualizaciones automáticas sin interrupciones al usuario
- Respaldos automáticos continuos — información siempre segura
- Timbrado CFDI incluido (traslado, ingresos, liquidaciones a permisionarios)
- Integración nativa con Rastreo Satelital GPS
- Presencia activa en México, Estados Unidos y Perú

=== MÓDULOS PRINCIPALES ===

MÓDULO TRÁFICO:
Centro de control logístico de toda la operación. Punto de partida para los demás módulos.
Tipos de operación: Viajes Nacionales, Viajes Locales, Cruces Fronterizos, Repartos, Operación Portuaria, Agente de Carga / Operador Logístico, Operación PEMEX, Volumétricos.
Funciones: Viajes, liquidaciones a operadores y permisionarios, rutas/trayectos, estatus de viaje para clientes, anticipos, gastos, vales de combustible, autopistas, Pantalla de Aeropuerto, doble operador, descuentos, inventario de equipo (disponible/ocupado/mantenimiento), Portal de Clientes (adicional).

MÓDULO FACTURACIÓN:
Control total de facturación con timbrado automático ante el SAT.
Tipos: por concepto (addendas, centros de costos), viajes totales/parciales, peso carga/descarga, kilómetro, recorrido, combustible, relación PEMEX.
Funciones: Timbrado CFDI 4.0 automático, Complemento Carta Porte, cancelaciones SAT, envío de facturas + evidencias por correo, descarga PDF/XML, fechas de pago, pólizas contables automáticas (requiere módulo Contabilidad).

MÓDULO COBRANZA:
Recuperación de cartera y control de facturas cobradas.
Incluye: pagos/abonos con complemento de pago, notas de crédito, auxiliar de clientes, vencimiento de facturas, saldos, cobranza automática, factoraje, pólizas automáticas.

MÓDULO BANCOS:
Control financiero completo.
Incluye: movimientos bancarios, control de cheques por banco y numeración, saldos en tiempo real, conciliación bancaria automática por layouts, registro manual o automático (nóminas, liquidaciones, cobranza), pólizas contables.

MÓDULO CUENTAS POR PAGAR:
Control de pagos a proveedores y gastos.
Incluye: pasivos por XML o manual, pago anticipado, reposiciones, contra recibos, DIOT, auxiliar de proveedor, gastos mensuales por centro de costos, importación masiva de XMLs (requiere GM Importa).

MÓDULO MANTENIMIENTO DE UNIDADES:
Servicios preventivos y correctivos basados en kilómetros reales del GPS integrado.

MÓDULO CONTROL DE LLANTAS:
Gestión del ciclo de vida de llantas por unidad y kilometraje real.

MÓDULO INVENTARIO DE REFACCIONES Y COMPRAS:
Gestión de inventario para mantenimiento y compras de la empresa.

MÓDULO INDICADORES:
Dashboard de KPIs operativos y financieros en tiempo real.

MÓDULO REPORTES GERENCIALES:
Inteligencia de negocio para toma de decisiones.
Reportes: análisis de ventas/ingresos, radiografía de viaje, just-in-time, rendimiento de flotillas, situación de la empresa, estado de resultados.

=== MÓDULOS ADICIONALES (contratación separada) ===
- Portal de Clientes: solicitudes de viaje en línea desde el cliente final
- Transporte de Personal: maquiladoras, escolar, eventos, renta de autobuses
- Operación Multifactura: facturar con más de una razón social
- Control de Patios con QR Code: entradas/salidas validadas con código QR
- Propietarios/Socios, Operación Portuaria, Cotizador, EDI
- Seguimiento de viajes para clientes, Bitácora de conducción (App Conduce 087)
- Aplicaciones Móviles (Mis Viajes / GMTERP), Tablero de Combustible
- Módulo Contabilidad: ligado a facturación, cobranza, CxP y bancos
- GM Importa: importación masiva de XMLs de proveedores
- Paquetería: módulo completo para paquetería y última milla

=== MÓDULO PAQUETERÍA (especializado) ===
Para empresas de mensajería, paquetería y última milla:
Recolección de paquetes, guías y facturación, tarifarios y convenios por clientes, manejo de sucursales y zonas, gestión de última milla, corte de caja, consolidado de cargas, ruteo (optimización de rutas), cubicaje de carga, tracking de paquete, App Móvil, etiquetas digitales y físicas, Facturación 4.0 y complemento pago 2.0.

=== VERSIONES / PLANES ERP ===

LITE: Versión básica. Módulos: Tráfico + Facturación + Cobranza.
AGENTE DE CARGA: Para agentes de carga y operadores logísticos. + Bancos, CxP, Indicadores, Reportes.
GESTIÓN DE FLOTAS: Para transportistas con flota propia. + Mantenimiento, Control Llantas, Inventario.
PREMIUM: Versión completa con todos los módulos principales.
PRO: Versión máxima + Contabilidad integrada.
HOMBRE CAMIÓN: Para 1-10 unidades motrices / permisionarios. Incluye: Carta Porte, CFDI, Complemento Carta Porte, importación desde Excel, catálogos, pólizas contables, CxC, registro de pagos y gastos.

=== RASTREO SATELITAL by GM Transport ===
Plataforma de localización vehicular 4G con monitoreo 24/7 y alianza ANERPV.
Integración ERP+GPS:
01 - GEOCERCAS: Automatiza entradas/salidas de zonas. Control exacto en tiempo real.
02 - ODÓMETROS ACTUALIZADOS: Km reales por viaje para mantenimiento, llantas y niveles.
03 - ESTATUS AUTOMÁTICO: El viaje actualiza su estatus solo por geocercas. Monitorea tiempos en casetas.
04 - GEORUTAS: Trayectos autorizados. Alertas automáticas si el conductor se desvía.
05 - PANTALLA AEROPUERTO: % de avance, demoras, estatus GPS en tiempo real desde el ERP.
06 - USUARIO ESPEJO / LIGAS DE SEGUIMIENTO: Acceso de clientes para ver sus unidades, con o sin autenticación. Comandos GPS configurables (poleo, paro motor, apertura chapa, etc.).
07 - ESTIMACIÓN JUST-IN-TIME: Alertas de congestión y accidentes para ajustar tiempos de entrega.

=== DASHCAM — VIDEO TELEMÁTICA CON IA ===
Cámaras duales Full HD con Machine Vision + Inteligencia Artificial.
Especificaciones: Cámara carretera Full HD 1080p, cámara conductor 720p, visión nocturna y gran angular, módem 4G para video en vivo, hasta 512 GB almacenamiento, grabación local 7 días a 1 mes, almacenamiento en nube hasta 30 días, Wi-Fi integrado, hasta 4 cámaras auxiliares.
Detección IA: uso de teléfono, cinturón de seguridad, fumando, alimentos/bebidas, conducción distraída. Alertas de audio en tiempo real al conductor.
Beneficios: video en alta resolución, retroalimentación de conductores, notificaciones automáticas, evaluación de desempeño, evidencia de colisiones, compartir video por evento.

=== CANBUS — DIAGNÓSTICO VEHICULAR ===
Lector del puerto de diagnóstico OBD. Recolecta datos para análisis y control de rendimiento.
Datos capturados (según marca/modelo/año): temperatura del refrigerante, temperatura del aceite de motor, RPM, ángulo del pedal acelerador, combustible consumido, velocidades máximas y promedio, rendimiento de la unidad.
Uso: comparativo de comportamiento entre unidades en distintos trayectos. Reportes por periodos definidos.

=== APLICACIONES MÓVILES 2025 ===
IA-GM: Asistente de IA que resuelve dudas sobre funciones del ERP de manera precisa.
IA-RASTREO: Consulta IA sobre el sistema de Rastreo y unidades registradas.
MIS VIAJES: Los operadores registran solicitudes, consultan viajes asignados y notifican al departamento de tráfico.

=== SECTORES ATENDIDOS ===
Transporte local y nacional, cruces fronterizos, operación portuaria, agentes de carga, operadores logísticos, PEMEX/volumétricos, transporte de personal (escolar, empresarial, eventos), paquetería y última milla, almacenes WMS, contenedores.
EOK;
}
?>
