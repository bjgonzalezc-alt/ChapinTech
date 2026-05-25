// ========================================
// TECH PORTAL LOGIC
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  // Contenedor activos
  const activeContainer =
  document.getElementById('activeCases');

  // Botones asignar
  const botonesAsignar =
  document.querySelectorAll('.assign-btn');

  botonesAsignar.forEach(boton => {

    boton.addEventListener('click', () => {

      // Evitar doble click
      if(boton.disabled) return;

      // Tarjeta original
      const tarjeta =
      boton.closest('.case-card');

      // ========================================
      // CLONAR TARJETA
      // ========================================

      const nuevaTarjeta =
      tarjeta.cloneNode(true);

      // ========================================
      // REMOVER BOTÓN ORIGINAL
      // ========================================

      const botonViejo =
      nuevaTarjeta.querySelector('.assign-btn');

      if(botonViejo){
        botonViejo.remove();
      }

      // ========================================
      // CAMBIAR ESTADO
      // ========================================

      const estado =
      nuevaTarjeta.querySelector('.case-status');

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
      // CREAR ACCIONES
      // ========================================

      const acciones =
      document.createElement('div');

      acciones.classList.add(
        'case-actions'
      );

      // ========================================
      // BOTÓN LLEGADA
      // ========================================

      const arrivalBtn =
      document.createElement('button');

      arrivalBtn.classList.add(
        'arrival-btn'
      );

      arrivalBtn.innerText =
      'Llegué al Sitio';

      // ========================================
      // BOTÓN RESOLVER
      // ========================================

      const resolveBtn =
      document.createElement('button');

      resolveBtn.classList.add(
        'complete-btn'
      );

      resolveBtn.innerText =
      'Resolver Caso';

      // Agregar botones
      acciones.appendChild(arrivalBtn);
      acciones.appendChild(resolveBtn);

      // Agregar acciones
      nuevaTarjeta.appendChild(
        acciones
      );

      // ========================================
      // MOSTRAR SOLO CASO ACTUAL
      // ========================================

      activeContainer.innerHTML = '';

      // Agregar nuevo caso
      activeContainer.appendChild(
        nuevaTarjeta
      );

      // Ocultar original
      tarjeta.style.display = 'none';

      // ========================================
      // TIMER SLA
      // ========================================

      const timer =
      document.createElement('div');

      timer.classList.add(
        'sla-timer'
      );

      nuevaTarjeta.appendChild(
        timer
      );

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

        // SLA expirado
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
      setInterval(
        actualizarTimer,
        1000
      );

      // ========================================
      // LLEGUÉ AL SITIO
      // ========================================

      arrivalBtn.addEventListener('click', () => {

        if(arrivalBtn.disabled) return;

        // Actualizar estado
        estado.innerText =
        'Esperando Cliente';

        estado.classList.remove(
          'status-route'
        );

        estado.classList.add(
          'status-onsite'
        );

        // Cambiar botón
        arrivalBtn.innerText =
        'Cliente Pendiente';

        arrivalBtn.disabled = true;

        // ========================================
        // TIMER CLIENTE
        // ========================================

        const clientTimer =
        document.createElement('div');

        clientTimer.classList.add(
          'client-timer'
        );

        nuevaTarjeta.appendChild(
          clientTimer
        );

        let tiempoCliente = 300;

        function actualizarCliente(){

          const minutos =
          Math.floor(
            tiempoCliente / 60
          );

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

          // Cliente ausente
          if(tiempoCliente <= 0){

            clearInterval(
              intervaloCliente
            );

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
        setInterval(
          actualizarCliente,
          1000
        );

      });

    });

  });

});