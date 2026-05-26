// ========================================
// WAIT FOR DOM
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================
  // SCREENS
  // ========================================

  const queueScreen =
  document.getElementById('queueScreen');

  const activeScreen =
  document.getElementById('activeScreen');

  // ========================================
  // ACTIVE CASE ELEMENTS
  // ========================================

  const ticketId =
  document.getElementById('ticketId');

  const ticketClient =
  document.getElementById('ticketClient');

  const ticketLocation =
  document.getElementById('ticketLocation');

  const ticketProblem =
  document.getElementById('ticketProblem');

  const ticketStatus =
  document.getElementById('ticketStatus');

  const timerLabel =
  document.getElementById('timerLabel');

  const mainTimer =
  document.getElementById('mainTimer');

  // ========================================
  // BUTTONS
  // ========================================

  const arrivalBtn =
  document.getElementById('arrivalBtn');

  const confirmBtn =
  document.getElementById('confirmBtn');

  const denyBtn =
  document.getElementById('denyBtn');

  const saveDocsBtn =
  document.getElementById('saveDocsBtn');

  const escalateBtn =
  document.getElementById('escalateBtn');

  const paymentBtn =
  document.getElementById('paymentBtn');

  const resolveBtn =
  document.getElementById('resolveBtn');

  // ========================================
  // SECTIONS
  // ========================================

  const documentationBox =
  document.getElementById('documentationBox');

  const invoiceBox =
  document.getElementById('invoiceBox');

  // ========================================
  // INPUTS
  // ========================================

  const findingsInput =
  document.getElementById('findingsInput');

  const solutionInput =
  document.getElementById('solutionInput');

  // ========================================
  // VARIABLES
  // ========================================

  let travelTime = 900;
  let repairTime = 5400;

  let timerInterval = null;

  let currentCard = null;

  // ========================================
  // ASSIGN BUTTONS
  // ========================================

  const assignButtons =
  document.querySelectorAll('.assign-btn');

  assignButtons.forEach(btn => {

    btn.addEventListener('click', () => {

      // Save current card
      currentCard =
      btn.closest('.ticket-card');

      // Fill active ticket
      ticketId.textContent =
      btn.dataset.id || '';

      ticketClient.textContent =
      btn.dataset.client || '';

      ticketLocation.textContent =
      btn.dataset.location || '';

      ticketProblem.textContent =
      btn.dataset.problem || '';

      // Hide queue
      queueScreen.classList.remove(
        'active-screen'
      );

      // Show active incident
      activeScreen.classList.add(
        'active-screen'
      );

      // Reset interface
      resetUI();

      // Start timer
      iniciarTravelTimer();

    });

  });

  // ========================================
  // RESET UI
  // ========================================

  function resetUI(){

    clearInterval(timerInterval);

    travelTime = 900;
    repairTime = 5400;

    ticketStatus.className =
    'status route';

    ticketStatus.textContent =
    'En Camino';

    timerLabel.textContent =
    'SLA ACTIVO';

    mainTimer.textContent =
    '15:00';

    confirmBtn.classList.add(
      'hidden'
    );

    denyBtn.classList.add(
      'hidden'
    );

    documentationBox.classList.add(
      'hidden'
    );

    escalateBtn.classList.add(
      'hidden'
    );

    invoiceBox.classList.add(
      'hidden'
    );

    resolveBtn.classList.add(
      'hidden'
    );

    findingsInput.value = '';
    solutionInput.value = '';

    arrivalBtn.disabled = false;

  }

  // ========================================
  // TRAVEL TIMER
  // ========================================

  function iniciarTravelTimer(){

    clearInterval(timerInterval);

    timerLabel.textContent =
    'SLA ACTIVO';

    timerInterval = setInterval(() => {

      actualizarTimer(travelTime);

      if(travelTime <= 0){

        clearInterval(timerInterval);

        regresarQueue();

        return;

      }

      travelTime--;

    },1000);

  }

  // ========================================
  // ARRIVAL
  // ========================================

  arrivalBtn.addEventListener('click', () => {

    confirmBtn.classList.remove(
      'hidden'
    );

    denyBtn.classList.remove(
      'hidden'
    );

  });

  // ========================================
  // CLIENT CONFIRMED
  // ========================================

  confirmBtn.addEventListener('click', () => {

    clearInterval(timerInterval);

    ticketStatus.className =
    'status repair';

    ticketStatus.textContent =
    'En Reparación';

    confirmBtn.classList.add(
      'hidden'
    );

    denyBtn.classList.add(
      'hidden'
    );

    documentationBox.classList.remove(
      'hidden'
    );

    iniciarRepairTimer();

  });

  // ========================================
  // CLIENT DENIED
  // ========================================

  denyBtn.addEventListener('click', () => {

    confirmBtn.classList.add(
      'hidden'
    );

    denyBtn.classList.add(
      'hidden'
    );

    iniciarTravelTimer();

  });

  // ========================================
  // REPAIR TIMER
  // ========================================

  function iniciarRepairTimer(){

    clearInterval(timerInterval);

    timerLabel.textContent =
    'REPARACIÓN';

    timerInterval = setInterval(() => {

      actualizarTimer(repairTime);

      if(repairTime <= 0){

        clearInterval(timerInterval);

        ticketStatus.className =
        'status escalated';

        ticketStatus.textContent =
        'Escalado';

        escalateBtn.classList.remove(
          'hidden'
        );

        return;

      }

      repairTime--;

    },1000);

  }

  // ========================================
  // TIMER DISPLAY
  // ========================================

  function actualizarTimer(time){

    const min =
    Math.floor(time / 60);

    const sec =
    time % 60;

    mainTimer.textContent =
    `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;

  }

  // ========================================
  // SAVE DOCS
  // ========================================

  saveDocsBtn.addEventListener('click', () => {

    if(
      findingsInput.value.trim() === '' ||
      solutionInput.value.trim() === ''
    ){

      alert(
        'Debe completar hallazgos y solución.'
      );

      return;

    }

    invoiceBox.classList.remove(
      'hidden'
    );

  });

  // ========================================
  // ESCALATE
  // ========================================

  escalateBtn.addEventListener('click', () => {

    ticketStatus.className =
    'status escalated';

    ticketStatus.textContent =
    'Escalado';

    invoiceBox.classList.remove(
      'hidden'
    );

  });

  // ========================================
  // PAYMENT
  // ========================================

  paymentBtn.addEventListener('click', () => {

    resolveBtn.classList.remove(
      'hidden'
    );

  });

  // ========================================
  // RESOLVE
  // ========================================

  resolveBtn.addEventListener('click', () => {

    clearInterval(timerInterval);

    ticketStatus.className =
    'status resolved';

    ticketStatus.textContent =
    'Resuelto';

    // Remove resolved card
    if(currentCard){

      currentCard.remove();

      actualizarContador();

    }

    setTimeout(() => {

      regresarQueue();

    },2500);

  });

  // ========================================
  // RETURN QUEUE
  // ========================================

  function regresarQueue(){

    activeScreen.classList.remove(
      'active-screen'
    );

    queueScreen.classList.add(
      'active-screen'
    );

  }

  // ========================================
  // COUNTER
  // ========================================

  function actualizarContador(){

    const total =
    document.querySelectorAll(
      '.ticket-card'
    ).length;

    const caseCount =
    document.getElementById(
      'caseCount'
    );

    if(caseCount){

      caseCount.textContent =
      total;

    }

  }

});