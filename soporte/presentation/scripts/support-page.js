document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.support-menu-btn');
  const navLinks = document.querySelector('.support-shell .nav-links');
  const ticketSearchForm = document.querySelector('.ticket-search-form');
  const ticketResult = document.getElementById('ticketResult');
  const roleButtons = document.querySelectorAll('.role-chip[data-role]');
  const rolePanels = document.querySelectorAll('[data-role-panel]');
  const clientToggleButtons = document.querySelectorAll('.client-toggle-btn[data-client-panel]');
  const clientContents = document.querySelectorAll('[data-client-content]');

  const demoTickets = [
    {
      code: 'CT-1024',
      contact: 'carlos@email.com',
      client: 'Carlos Mendez',
      service: 'Reparacion de laptop',
      status: 'En diagnostico',
      technician: 'Anna',
      priority: 'Alta',
      steps: ['Recibido', 'Asignado', 'En camino', 'Diagnostico']
    },
    {
      code: 'CT-1025',
      contact: '+50248882299',
      client: 'Maria Lopez',
      service: 'Soporte de impresora',
      status: 'Tecnico en ruta',
      technician: 'Kevin',
      priority: 'Media',
      steps: ['Recibido', 'Asignado', 'En camino']
    }
  ];

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (!ticketSearchForm || !ticketResult) {
    return;
  }

  function setRoleView(role) {
    roleButtons.forEach((button) => {
      const isActive = button.dataset.role === role;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    rolePanels.forEach((panel) => {
      panel.classList.toggle('is-collapsed', panel.dataset.rolePanel !== role);
    });
  }

  function setClientPanel(panelName) {
    clientToggleButtons.forEach((button) => {
      const isActive = button.dataset.clientPanel === panelName;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-expanded', String(isActive));
    });

    clientContents.forEach((content) => {
      content.classList.toggle('is-collapsed', content.dataset.clientContent !== panelName);
    });
  }

  roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setRoleView(button.dataset.role);
    });
  });

  clientToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setClientPanel(button.dataset.clientPanel);
    });
  });

  setRoleView('client');
  setClientPanel('search');

  ticketSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const codeInput = ticketSearchForm.querySelector('#ticketCode');
    const contactInput = ticketSearchForm.querySelector('#ticketContact');
    const code = codeInput.value.trim().toUpperCase();
    const contact = contactInput.value.trim().toLowerCase().replace(/\s/g, '');

    const ticket = demoTickets.find((item) => {
      return item.code === code && item.contact.toLowerCase().replace(/\s/g, '') === contact;
    });

    if (!ticket) {
      ticketResult.classList.remove('is-collapsed');
      ticketResult.innerHTML = `
        <div class="ticket-result-error">
          <span>!</span>
          <h3>Numero incorrecto o inexistente</h3>
          <p>No encontramos un ticket con esos datos. Verifica el codigo y el correo o telefono asociado.</p>
        </div>
      `;
      return;
    }

    ticketResult.classList.remove('is-collapsed');
    ticketResult.innerHTML = `
      <div class="ticket-result-live">
        <div class="module-heading">
          <div>
            <p>Ticket encontrado</p>
            <h2>${ticket.code}</h2>
          </div>
          <span class="module-badge">${ticket.status}</span>
        </div>

        <div class="ticket-meta-grid">
          <div class="ticket-meta">
            <p>Cliente</p>
            <strong>${ticket.client}</strong>
          </div>
          <div class="ticket-meta">
            <p>Tecnico</p>
            <strong>${ticket.technician}</strong>
          </div>
          <div class="ticket-meta">
            <p>Servicio</p>
            <strong>${ticket.service}</strong>
          </div>
          <div class="ticket-meta">
            <p>Prioridad</p>
            <strong>${ticket.priority}</strong>
          </div>
        </div>

        <div class="ticket-timeline">
          ${['Recibido', 'Asignado', 'En camino', 'Diagnostico', 'Finalizado'].map((step) => {
            const done = ticket.steps.includes(step) ? 'done' : '';
            return `<div class="timeline-step ${done}">${step}</div>`;
          }).join('')}
        </div>
      </div>
    `;
  });
});
