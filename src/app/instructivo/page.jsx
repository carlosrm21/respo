
import React from "react";
import styles from "./page.module.css";

export default function InstructivoImpresion() {
  return (
    <div className={styles["instructivo-hero"]}>
      <div className={styles["instructivo-card"]}>
        <h1 className={styles["instructivo-title"]}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6Zm0 2h12v16H6V4Zm2 2v2h8V6H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z"/></svg>
          Instructivo de Impresión
        </h1>
        <div className={styles["instructivo-section"]}>
          <h2>1. Instalación de la impresora en Windows</h2>
          <ul>
            <li>Conecta la impresora POS o de cocina al computador (USB o red).</li>
            <li>Ve a <b>Configuración &gt; Dispositivos &gt; Impresoras y escáneres</b>.</li>
            <li>Haz clic en <b>Agregar una impresora</b> y sigue los pasos del asistente.</li>
            <li>Imprime una página de prueba para verificar que funciona.</li>
          </ul>
        </div>
        <div className={styles["instructivo-section"]}>
          <h2>2. Configuración desde el Panel Administrativo</h2>
          <ul>
            <li>Ingresa al panel administrativo del sistema.</li>
            <li>Ve a la sección <b>Configuración de Tickets/Impresión</b>.</li>
            <li>Elige si el mesero puede imprimir:
              <ul>
                <li><b>Ticket POS</b> (para el cliente)</li>
                <li><b>Comanda de cocina</b> (para cocina)</li>
              </ul>
            </li>
            <li>Guarda los cambios. Esta configuración se aplica automáticamente a los terminales de mesero.</li>
          </ul>
        </div>
        <div className={styles["instructivo-section"]}>
          <h2>3. Uso en el Terminal Mesero</h2>
          <ul>
            <li>El mesero inicia sesión en su terminal.</li>
            <li>Al tomar un pedido, verá las opciones de impresión según lo configurado por el admin.</li>
            <li>Al presionar <b>Imprimir</b>, el navegador abrirá el diálogo de impresión:
              <ul>
                <li>Selecciona la impresora instalada.</li>
                <li>Confirma la impresión.</li>
              </ul>
            </li>
          </ul>
        </div>
        <div className={styles["instructivo-section"]}>
          <h2>4. Consejos y Solución de Problemas</h2>
          <ul>
            <li>Si no aparece la impresora, revisa que esté instalada y seleccionada como predeterminada.</li>
            <li>Usa Google Chrome o Edge para mejor compatibilidad.</li>
            <li>Si la comanda no imprime, revisa la configuración en el panel admin.</li>
            <li>Para soporte técnico, contacta a tu proveedor con capturas de pantalla del error.</li>
          </ul>
        </div>
        <div className={styles["instructivo-footer"]}>
          ¡Listo! El sistema está preparado para imprimir tickets y comandas según la configuración del administrador.
        </div>
        <div className={styles["instructivo-note"]}>
          Este instructivo puede entregarse al cliente final o imprimirse para referencia en el local.
        </div>
      </div>
    </div>
  );
}
