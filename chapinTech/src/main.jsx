document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  const searchInput = document.querySelector(".search-box input");
  const searchButton = document.querySelector(".search-box button");
  const ticketResult = document.getElementById("ticket-result");
  const createTicketForm = document.querySelector("form");

  if (!searchBox || !searchInput || !searchButton || !ticketResult) {
    return;
  }

  const statusMap = {
    CREATED: { label: "Ticket Creado", step: 1 },
    AVAILABLE: { label: "Disponible para asignación", step: 1 },
    ASSIGNED: { label: "Asignado a técnico", step: 2 },
    ON_THE_WAY: { label: "Técnico en ruta", step: 3 },
    ON_SITE: { label: "Técnico en sitio", step: 4 },
    IN_DIAGNOSIS: { label: "En diagnóstico", step: 5 },
    DIAGNOSIS_COMPLETED: { label: "Diagnóstico finalizado", step: 6 },
    PAYMENT_PENDING: { label: "Pendiente de pago", step: 6 },
    COMPLETED: { label: "Servicio completado", step: 6 },
    CANCELLED: { label: "Cancelado", step: 1 }
  };

  const autoStatusFlow = [
    { code: "ASSIGNED", delay: 4000 },
    { code: "ON_THE_WAY", delay: 8000 },
    { code: "ON_SITE", delay: 12000 },
    { code: "IN_DIAGNOSIS", delay: 16000 },
    { code: "COMPLETED", delay: 20000 }
  ];

  const initialTickets = [
    {
      ticket_id: "CT-1024",
      cliente: {
        nombre: "Carlos Méndez",
        telefono: "+502 4123-8899",
        correo: "carlosm@example.com"
      },
      servicio: "Reparación de Laptop",
      estado: {
        codigo: "IN_DIAGNOSIS",
        label: "En Diagnóstico",
        step: 5
      },
      tecnico: {
        nombre: "Anna",
        telefono: "+502 5555-1111"
      },
      prioridad: "Alta",
      fecha_creacion: "2026-05-10T09:30:00",
      ultima_actualizacion: "2026-05-10T12:42:00",
      timeline: [
        { status: "CREATED", label: "Ticket Creado", time: "09:30 AM" },
        { status: "ASSIGNED", label: "Asignado a Técnico", time: "10:00 AM" },
        { status: "ON_SITE", label: "Técnico en Sitio", time: "11:10 AM" },
        { status: "IN_DIAGNOSIS", label: "En Diagnóstico", time: "12:42 PM" }
      ],
      descripcion: "La laptop presenta sobrecalentamiento y apagones repentinos.",
      notas_tecnicas: "Se detectó acumulación excesiva de polvo y pasta térmica seca."
    },
    {
      ticket_id: "CT-2048",
      cliente: {
        nombre: "María López",
        telefono: "+502 4888-2299",
        correo: "maria.lopez@example.com"
      },
      servicio: "Instalación de Red",
      estado: {
        codigo: "ON_THE_WAY",
        label: "Técnico en Ruta",
        step: 3
      },
      tecnico: {
        nombre: "Kevin",
        telefono: "+502 5555-2222"
      },
      prioridad: "Media",
      fecha_creacion: "2026-05-11T08:10:00",
      ultima_actualizacion: "2026-05-11T10:15:00",
      timeline: [
        { status: "CREATED", label: "Ticket Creado", time: "08:10 AM" },
        { status: "ASSIGNED", label: "Asignado a Técnico", time: "09:00 AM" },
        { status: "ON_THE_WAY", label: "Técnico en Ruta", time: "10:15 AM" }
      ],
      descripcion: "Cliente solicita instalación de red para oficina pequeña.",
      notas_tecnicas: "Pendiente evaluación del cableado existente."
    },
    {
      ticket_id: "CT-4096",
      cliente: {
        nombre: "Luis Pérez",
        telefono: "+502 4999-1100",
        correo: "luisp@example.com"
      },
      servicio: "Mantenimiento de PC",
      estado: {
        codigo: "COMPLETED",
        label: "Servicio Finalizado",
        step: 6
      },
      tecnico: {
        nombre: "Andrea",
        telefono: "+502 5555-3333"
      },
      prioridad: "Baja",
      fecha_creacion: "2026-05-09T02:20:00",
      ultima_actualizacion: "2026-05-09T05:40:00",
      timeline: [
        { status: "CREATED", label: "Ticket Creado", time: "02:20 PM" },
        { status: "ASSIGNED", label: "Asignado a Técnico", time: "02:45 PM" },
        { status: "IN_DIAGNOSIS", label: "En Diagnóstico", time: "03:20 PM" },
        { status: "DIAGNOSIS_COMPLETED", label: "Diagnóstico Finalizado", time: "04:10 PM" },
        { status: "COMPLETED", label: "Servicio Finalizado", time: "05:40 PM" }
      ],
      descripcion: "Mantenimiento preventivo completo de computadora de escritorio.",
      notas_tecnicas: "Equipo limpiado y optimizado correctamente."
    }
  ];

  const tickets = initialTickets.map((ticket) => cloneTicket(ticket));
  const statusTimers = new Map();
  let currentTicketId = null;

  function cloneTicket(ticket) {
    return {
      ...ticket,
      cliente: { ...ticket.cliente },
      tecnico: { ...ticket.tecnico },
      estado: { ...ticket.estado },
      timeline: Array.isArray(ticket.timeline)
        ? ticket.timeline.map((step) => ({ ...step }))
        : []
    };
  }

  function formatDateTime(value) {
    if (!value) return "Sin información";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("es-GT", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("es-GT", {
      hour: "numeric",
      minute: "2-digit"
    }).format(value);
  }

  function getStatusInfo(statusCode) {
    return statusMap[statusCode] || {
      label: "Estado desconocido",
      step: 1
    };
  }

  function clearScheduledUpdates(ticketId) {
    const timers = statusTimers.get(ticketId);
    if (!timers) return;

    timers.forEach((timer) => window.clearTimeout(timer));
    statusTimers.delete(ticketId);
  }

  function findTicket(ticketId) {
    return tickets.find((ticket) => ticket.ticket_id === ticketId);
  }

  function getNextTicketId() {
    const highestNumber = tickets.reduce((max, ticket) => {
      const numericPart = Number.parseInt(ticket.ticket_id.replace("CT-", ""), 10);
      return Number.isFinite(numericPart) && numericPart > max ? numericPart : max;
    }, 0);

    return `CT-${highestNumber + 1}`;
  }

  function getTimeline(ticket) {
    if (ticket.timeline && ticket.timeline.length > 0) {
      return ticket.timeline;
    }

    return [
      {
        status: "CREATED",
        label: "Ticket Creado",
        time: formatTime(new Date(ticket.fecha_creacion || Date.now()))
      }
    ];
  }

  function getTimelineStep(ticket, index) {
    const estado = ticket.estado?.codigo || "CREATED";
    const activeStep = getStatusInfo(estado).step;
    return index + 1 <= activeStep;
  }

  function renderTicket(ticket) {
    currentTicketId = ticket.ticket_id;

    const status = getStatusInfo(ticket.estado?.codigo);
    const timeline = getTimeline(ticket);

    const progressWidth = timeline.length > 1
      ? Math.max(0, Math.min(100, ((status.step - 1) / (timeline.length - 1)) * 100))
      : 100;

    ticketResult.innerHTML = `
      <div class="panel" style="margin-top:30px;">
        <div class="status-grid">
          <div class="status-card">
            <p>Código</p>
            <h3>${ticket.ticket_id}</h3>
          </div>

          <div class="status-card">
            <p>Cliente</p>
            <h3>${ticket.cliente?.nombre || "Sin cliente"}</h3>
          </div>

          <div class="status-card">
            <p>Técnico</p>
            <h3>${ticket.tecnico?.nombre || "Sin técnico"}</h3>
          </div>

          <div class="status-card">
            <p>Estado</p>
            <div class="active-status">${status.label}</div>
          </div>
        </div>

        <div class="timeline">
          <div class="timeline-line"></div>
          <div class="timeline-progress" style="width:${progressWidth}%"></div>

          <div class="steps">
            ${timeline.map((step, index) => {
              const active = getTimelineStep(ticket, index);
              return `
                <div class="step">
                  <div class="circle ${active ? "active" : "inactive"}"></div>
                  <h4>${step.label}</h4>
                  <span>${step.time || ""}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-top:40px;">
          <div class="status-card">
            <p>Servicio</p>
            <h3>${ticket.servicio || "Sin servicio"}</h3>
          </div>

          <div class="status-card">
            <p>Prioridad</p>
            <h3>${ticket.prioridad || "Normal"}</h3>
          </div>

          <div class="status-card">
            <p>Última actualización</p>
            <h3>${formatDateTime(ticket.ultima_actualizacion)}</h3>
          </div>
        </div>

        <div style="margin-top:30px;display:grid;gap:20px;">
          <div class="status-card">
            <p>Descripción</p>
            <h3 style="font-size:1rem;line-height:1.7;font-weight:500;color:rgba(255,255,255,.82);">
              ${ticket.descripcion || "Sin descripción registrada."}
            </h3>
          </div>

          <div class="status-card">
            <p>Notas técnicas</p>
            <h3 style="font-size:1rem;line-height:1.7;font-weight:500;color:rgba(255,255,255,.82);">
              ${ticket.notas_tecnicas || "Sin notas técnicas."}
            </h3>
          </div>
        </div>
      </div>
    `;
  }

  function renderNotFound(query) {
    ticketResult.innerHTML = `
      <div class="panel" style="margin-top:30px;">
        <h3 style="color:#ff6b6b;">Ticket no encontrado</h3>
        <p style="margin-top:10px;opacity:.7;">
          No encontramos el código <strong>${query || "ingresado"}</strong>. Verifica el formato e intenta nuevamente.
        </p>
      </div>
    `;
  }

  function updateTicketStatus(ticketId, nextStatusCode) {
    const ticket = findTicket(ticketId);
    if (!ticket) return;

    const statusInfo = getStatusInfo(nextStatusCode);
    ticket.estado = {
      codigo: nextStatusCode,
      label: statusInfo.label,
      step: statusInfo.step
    };
    ticket.ultima_actualizacion = new Date().toISOString();

    if (!ticket.timeline.some((step) => step.status === nextStatusCode)) {
      ticket.timeline.push({
        status: nextStatusCode,
        label: statusInfo.label,
        time: formatTime(new Date())
      });
    }

    if (currentTicketId === ticketId) {
      renderTicket(ticket);
    }

    if (nextStatusCode === "COMPLETED") {
      clearScheduledUpdates(ticketId);
    }
  }

  function scheduleAutomaticStatusUpdates(ticketId) {
    clearScheduledUpdates(ticketId);

    const timers = autoStatusFlow.map(({ code, delay }) => {
      return window.setTimeout(() => {
        updateTicketStatus(ticketId, code);
      }, delay);
    });

    statusTimers.set(ticketId, timers);
  }

  function createTicketFromForm() {
    const fields = createTicketForm.querySelectorAll("input, select, textarea");
    const [nameInput, emailInput, phoneInput, serviceSelect, problemTextarea] = fields;

    const ticketId = getNextTicketId();
    const now = new Date();

    return {
      ticket_id: ticketId,
      cliente: {
        nombre: nameInput?.value.trim() || "Sin nombre",
        telefono: phoneInput?.value.trim() || "Sin teléfono",
        correo: emailInput?.value.trim() || "Sin correo"
      },
      servicio: serviceSelect?.value || "Soporte Técnico",
      estado: {
        codigo: "CREATED",
        label: statusMap.CREATED.label,
        step: statusMap.CREATED.step
      },
      tecnico: {
        nombre: "Pendiente de asignación",
        telefono: "Sin asignar"
      },
      prioridad: "Media",
      fecha_creacion: now.toISOString(),
      ultima_actualizacion: now.toISOString(),
      timeline: [
        {
          status: "CREATED",
          label: statusMap.CREATED.label,
          time: formatTime(now)
        }
      ],
      descripcion: problemTextarea?.value.trim() || "Sin descripción registrada.",
      notas_tecnicas: "Ticket generado automáticamente desde el formulario."
    };
  }

  function searchTicket() {
    const query = searchInput.value.trim().toUpperCase();

    if (!query) {
      ticketResult.innerHTML = `
        <div class="panel" style="margin-top:30px;">
          <h3>Ingresa un código de ticket</h3>
          <p style="margin-top:10px;opacity:.7;">
            Ejemplo: CT-1024, CT-2048 o CT-4096.
          </p>
        </div>
      `;
      return;
    }

    const ticket = findTicket(query);

    if (!ticket) {
      renderNotFound(query);
      return;
    }

    renderTicket(ticket);
  }

  searchButton.addEventListener("click", searchTicket);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchTicket();
    }
  });

  if (createTicketForm) {
    createTicketForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const newTicket = createTicketFromForm();
      tickets.unshift(newTicket);
      searchInput.value = newTicket.ticket_id;
      renderTicket(newTicket);
      scheduleAutomaticStatusUpdates(newTicket.ticket_id);
      createTicketForm.reset();
    });
  }

  renderTicket(tickets[0]);
});

import { useState } from "react";

import { db } from "./firebase";

import {
  collection,
  addDoc
} from "firebase/firestore";

export default function CrearTicket() {

  const [nombre, setNombre] = useState("");

  const [problema, setProblema] = useState("");

  async function crearTicket() {

    try {

      const ticketId =
        "CT-" +
        Math.floor(Math.random() * 100000);

      await addDoc(collection(db, "tickets"), {

        ticketId,

        nombre,

        problema,

        estado: "CREATED",

        createdAt: new Date()

      });

      alert("Ticket creado: " + ticketId);

    } catch(error) {

      console.error(error);

    }

  }

  return (

    <div>

      <input
        placeholder="Nombre"
        onChange={(e) => setNombre(e.target.value)}
      />

      <textarea
        placeholder="Describe el problema"
        onChange={(e) => setProblema(e.target.value)}
      />

      <button onClick={crearTicket}>
        Crear Ticket
      </button>

    </div>

  );

}