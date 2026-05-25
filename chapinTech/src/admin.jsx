import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc
}
from "firebase/firestore";

import { db } from "../firebase";

export default function Admin() {

  const [tickets, setTickets] = useState([]);

  // ========================================
  // LOAD TICKETS
  // ========================================

  async function loadTickets() {

    const snapshot =
      await getDocs(collection(db, "tickets"));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setTickets(data);

  }

  useEffect(() => {

    loadTickets();

  }, []);

  // ========================================
  // UPDATE STATUS
  // ========================================

  async function updateStatus(ticketId, newStatus) {

    try {

      const ticketRef =
        doc(db, "tickets", ticketId);

      await updateDoc(ticketRef, {

        estado: newStatus,

        updatedAt: new Date()

      });

      loadTickets();

    } catch(error) {

      console.error(error);

    }
  }

  return (

    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h1>ChapinTech</h1>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Tickets</a>
          <a href="#">Técnicos</a>
          <a href="#">Analytics</a>
        </nav>
      </aside>

      {/* MAIN */}

      <main className="admin-main">
        <div className="topbar">
          <h2>Panel de Soporte</h2>
        </div>

        {/* TABLE */}

        <div className="ticket-table">
          <div className="table-header">

            <span>Ticket</span>
            <span>Cliente</span>
            <span>Estado</span>
            <span>Técnico</span>
            <span>Acciones</span>

          </div>

          {tickets.map(ticket => (

            <div
              className="ticket-row"
              key={ticket.id}>

              <span>{ticket.ticketId}</span>

              <span>{ticket.nombre}</span>

              <span className={`status ${ticket.estado}`}>
                {ticket.estado}
              </span>

              <span>
                {ticket.tecnico || "Sin asignar"}
              </span>

              <select
                onChange={(e) =>
                  updateStatus(
                    ticket.id,
                    e.target.value
                  )
                }

                value={ticket.estado}
              >

                <option value="CREATED">
                  Creado
                </option>

                <option value="ASSIGNED">
                  Asignado
                </option>

                <option value="ON_THE_WAY">
                  En Ruta
                </option>

                <option value="ON_SITE">
                  En Sitio
                </option>

                <option value="IN_DIAGNOSIS">
                  Diagnóstico
                </option>

                <option value="REPAIRING">
                  Reparando
                </option>

                <option value="TESTING">
                  Probando
                </option>

                <option value="COMPLETED">
                  Finalizado
                </option>

              </select>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ========================================
// SEARCH FUNCTIONALITY (OPTIONAL)
// ========================================
const searchBtn =
document.querySelector(".search-btn");

const searchInput =
document.querySelector(".search-input");

const ticketsContainer =
document.querySelector(".tickets-container");

searchBtn.addEventListener("click", async () => {

  const value = searchInput.value;

  const res = await fetch(
    `http://localhost:3000/tickets/search/${value}`
  );

  const data = await res.json();

  ticketsContainer.innerHTML = "";

  data.forEach(ticket => {

    ticketsContainer.innerHTML += `

      <div class="ticket-row">

        <span>${ticket.ticket_id}</span>

        <span>${ticket.cliente}</span>

        <span class="status route">
          ${ticket.estado}
        </span>

        <span>
          ${ticket.tecnico || "Sin asignar"}
        </span>

        <span class="priority high">
          ${ticket.prioridad}
        </span>

        <select>

          <option>
            ABIERTO
          </option>

          <option>
            EN RUTA
          </option>

          <option>
            EN SITIO
          </option>

          <option>
            FINALIZADO
          </option>

        </select>

      </div>

    `;
  });

});