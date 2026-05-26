document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.support-menu-btn');
  const navLinks = document.querySelector('.support-shell .nav-links');
  const ticketSearchForm = document.querySelector('.ticket-search-form');
  const ticketResult = document.getElementById('ticketResult');
  const roleButtons = document.querySelectorAll('.role-chip[data-role]');
  const rolePanels = document.querySelectorAll('[data-role-panel]');
  const clientToggleButtons = document.querySelectorAll('.client-toggle-btn[data-client-panel]');
  const clientContents = document.querySelectorAll('[data-client-content]');
  const statusSteps = ['Recibido', 'Asignado', 'Tecnico en Ruta', 'Diagnostico', 'En Reparacion', 'Finalizado'];
  const technicianModal = document.getElementById('technicianModal');
  let activeAssignButton = null;

  const demoTickets = [
    {
      code: 'CT-1024',
      contact: 'carlos@email.com',
      client: 'Carlos Mendez',
      service: 'Reparacion de laptop',
      status: 'En Reparacion',
      technician: 'Anna',
      priority: 'Alta',
      steps: ['Recibido', 'Asignado', 'Tecnico en Ruta', 'Diagnostico', 'En Reparacion']
    },
    {
      code: 'CT-1025',
      contact: '+50248882299',
      client: 'Maria Lopez',
      service: 'Soporte de impresora',
      status: 'Tecnico en ruta',
      technician: 'Kevin',
      priority: 'Media',
      steps: ['Recibido', 'Asignado', 'Tecnico en Ruta']
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

  function renderStatusBar(activeSteps, size = 'default') {
    const lastActiveIndex = Math.max(...activeSteps.map((step) => statusSteps.indexOf(step)));
    const progress = lastActiveIndex <= 0
      ? 0
      : (lastActiveIndex / (statusSteps.length - 1)) * 100;
    const sizeClass = size === 'compact' || size === 'client' ? size : '';

    return `
      <div class="status-progress ${sizeClass}">
        <div class="status-track">
          <div class="status-fill" style="width:${progress}%; --progress:${progress}%;"></div>
          ${statusSteps.map((step, index) => {
            const isDone = index <= lastActiveIndex ? 'done' : '';
            const isCurrent = index === lastActiveIndex ? 'current' : '';

            return `
              <div class="status-point ${isDone} ${isCurrent}">
                <span></span>
                <p>${step}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function openTechnicianModal(assignButton) {
    activeAssignButton = assignButton;
    technicianModal.classList.remove('is-collapsed');
    technicianModal.setAttribute('aria-hidden', 'false');
  }

  function closeTechnicianModal() {
    technicianModal.classList.add('is-collapsed');
    technicianModal.setAttribute('aria-hidden', 'true');
    activeAssignButton = null;
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

  document.querySelectorAll('.assign-tech-btn').forEach((button) => {
    button.addEventListener('click', () => {
      openTechnicianModal(button);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeTechnicianModal);
  });

  document.querySelectorAll('.technician-option').forEach((button) => {
    button.addEventListener('click', () => {
      if (!activeAssignButton) {
        return;
      }

      activeAssignButton.textContent = button.dataset.technician;
      activeAssignButton.classList.remove('assign-tech-btn');
      activeAssignButton.classList.add('assigned-tech-btn');
      closeTechnicianModal();
    });
  });

  setRoleView('client');
  setClientPanel('search');

  ticketSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const codeInput = ticketSearchForm.querySelector('#ticketCode');
    const code = codeInput.value.trim().toUpperCase();

    const ticket = demoTickets.find((item) => {
      return item.code === code;
    });

    if (!ticket) {
      ticketResult.classList.remove('is-collapsed');
      ticketResult.innerHTML = `
        <div class="ticket-result-error">
          <span>!</span>
          <h3>Numero incorrecto o inexistente</h3>
          <p>No encontramos un ticket con ese codigo. Verifica el numero e intenta nuevamente.</p>
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

        ${renderStatusBar(ticket.steps, 'client')}
      </div>
    `;
  });

  document.querySelectorAll('.admin-ticket-row[data-steps]').forEach((row) => {
    const activeSteps = row.dataset.steps.split(',').map((step) => step.trim());
    const progressTarget = row.querySelector('.admin-ticket-progress');

    if (progressTarget) {
      progressTarget.innerHTML = renderStatusBar(activeSteps, 'compact');
    }
  });
});
