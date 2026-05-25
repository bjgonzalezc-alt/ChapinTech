// ========================================
// TECH PORTAL LOGIC
// ========================================

// ========================================
// ASIGNAR CASO
// ========================================

const botonesAsignar =
document.querySelectorAll('.assign-btn');

botonesAsignar.forEach(boton => {

  boton.addEventListener('click', () => {

    if(boton.disabled) return;

    const tarjeta =
    boton.closest('.case-card');

    // Cambiar botón
    boton.innerText = 'Asignado';

    boton.style.background =
    '#16a34a';

    boton.disabled = true;

    // Cambiar estado
    const estado =
    tarjeta.querySelector('.case-status');

    estado.innerText =
    'En Camino';

    estado.classList.remove(
      'status-open',
      'status-urgent'
    );

    estado.classList.add(
      'status-route'
    );

    // ========================================
    // TIMER SLA 15 MIN
    // ========================================

    const timer =
    document.createElement('div');

    timer.classList.add('sla-timer');

    tarjeta.appendChild(timer);

    let tiempoRestante = 900;

    function actualizarTimer(){

      const minutos =
      Math.floor(tiempoRestante / 60);

      const segundos =
      tiempoRestante % 60;

      timer.innerHTML = `
        SLA:
        ${String(minutos).padStart(2,'0')}:
        ${String(segundos).padStart(2,'0')}
      `;

      // Últimos 5 min
      if(tiempoRestante <= 300){

        timer.style.background =
        'rgba(250,204,21,.15)';

        timer.style.color =
        '#facc15';

      }

      // Expirado
      if(tiempoRestante <= 0){

        clearInterval(intervalo);

        timer.innerHTML =
        'SLA EXPIRADO';

        timer.style.background =
        'rgba(239,68,68,.15)';

        timer.style.color =
        '#ef4444';

        estado.innerText =
        'SLA Vencido';

        estado.classList.remove(
          'status-route'
        );

        estado.classList.add(
          'status-urgent'
        );

        return;

      }

      tiempoRestante--;

    }

    actualizarTimer();

    const intervalo =
    setInterval(actualizarTimer,1000);

    // ========================================
    // CREAR BOTÓN LLEGUÉ AL SITIO
    // ========================================

    let acciones =
    tarjeta.querySelector('.case-actions');

    // Si no existe crear
    if(!acciones){

      acciones =
      document.createElement('div');

      acciones.classList.add(
        'case-actions'
      );

      tarjeta.appendChild(acciones);

    }

    // Crear botón
    const arrivalBtn =
    document.createElement('button');

    arrivalBtn.classList.add(
      'arrival-btn'
    );

    arrivalBtn.innerText =
    'Llegué al Sitio';

    acciones.appendChild(arrivalBtn);

    // ========================================
    // EVENTO LLEGADA
    // ========================================

    arrivalBtn.addEventListener('click', () => {

      if(arrivalBtn.disabled) return;

      estado.innerText =
      'Esperando Cliente';

      estado.classList.remove(
        'status-route'
      );

      estado.classList.add(
        'status-onsite'
      );

      arrivalBtn.innerText =
      'Cliente Pendiente';

      arrivalBtn.disabled = true;

      // ========================================
      // TIMER CLIENTE 5 MIN
      // ========================================

      const clientTimer =
      document.createElement('div');

      clientTimer.classList.add(
        'client-timer'
      );

      tarjeta.appendChild(clientTimer);

      let tiempoCliente = 300;

      function actualizarCliente(){

        const minutos =
        Math.floor(tiempoCliente / 60);

        const segundos =
        tiempoCliente % 60;

        clientTimer.innerHTML = `
          Confirmación Cliente:
          ${String(minutos).padStart(2,'0')}:
          ${String(segundos).padStart(2,'0')}
        `;

        // Último minuto
        if(tiempoCliente <= 60){

          clientTimer.style.background =
          'rgba(250,204,21,.15)';

          clientTimer.style.color =
          '#facc15';

        }

        // Expirado
        if(tiempoCliente <= 0){

          clearInterval(intervaloCliente);

          clientTimer.innerHTML =
          'CLIENTE NO DISPONIBLE';

          clientTimer.style.background =
          'rgba(239,68,68,.15)';

          clientTimer.style.color =
          '#ef4444';

          estado.innerText =
          'Cliente No Disponible';

          estado.classList.remove(
            'status-onsite'
          );

          estado.classList.add(
            'status-urgent'
          );

          return;

        }

        tiempoCliente--;

      }

      actualizarCliente();

      const intervaloCliente =
      setInterval(actualizarCliente,1000);

    });
  });
});
