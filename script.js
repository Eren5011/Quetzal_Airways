(function () {
  const DURATION_MS = 5000; // 5 seconds
  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');
  const progressContainer = document.querySelector('.progress');

  if (!progressBar || !progressLabel || !progressContainer) return;

  let startTs = null;

  function formatPercent(n) {
    const clamped = Math.max(0, Math.min(100, n));
    return Math.round(clamped);
  }

  function step(ts) {
    if (startTs === null) startTs = ts;
    const elapsed = ts - startTs;
    const percent = Math.min(1, elapsed / DURATION_MS) * 100;
    const percentInt = formatPercent(percent);

    progressBar.style.width = percentInt + '%';
    progressLabel.textContent = percentInt + '%';
    progressContainer.setAttribute('aria-valuenow', String(percentInt));

    if (elapsed < DURATION_MS) {
      requestAnimationFrame(step);
    } else {
      document.querySelector('main.splash')?.setAttribute('aria-busy', 'false');
      // Fade in main page after loading completes
      const mainPage = document.getElementById('mainPage');
      if (mainPage) {
        setTimeout(() => {
          mainPage.classList.remove('main-page--hidden');
          // Hide loading screen after fade-in starts
          const splash = document.querySelector('.splash');
          if (splash) {
            setTimeout(() => {
              splash.style.display = 'none';
            }, 400);
          }
        }, 200);
      }
    }
  }

  // Kick off on next frame to ensure initial layout applied
  requestAnimationFrame(step);
})();

// Video auto-play on scroll
(function() {
  const video = document.getElementById('quetzalVideo');
  if (!video) {
    console.log('Video element not found');
    return;
  }

  console.log('Video element found:', video);

  let hasStarted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log('Video intersection:', entry.isIntersecting, 'hasStarted:', hasStarted);
      if (entry.isIntersecting && !hasStarted) {
        console.log('Attempting to play video');
        video.play().then(() => {
          console.log('Video playing successfully');
        }).catch(error => {
          console.error('Error playing video:', error);
        });
        hasStarted = true;
      } else if (!entry.isIntersecting && hasStarted) {
        console.log('Pausing video');
        video.pause();
      } else if (entry.isIntersecting && hasStarted && video.paused) {
        console.log('Resuming video');
        video.play().catch(error => {
          console.error('Error resuming video:', error);
        });
      }
    });
  }, {
    threshold: 0.1 // Start when 10% of video is visible
  });

  // Wait for page to load before observing
  setTimeout(() => {
    console.log('Setting up observer for video');
    observer.observe(video);
  }, 2000);
})();

// Modal functionality
(function() {
  'use strict';

  // Get modal elements
  const modal = document.getElementById('authModal');
  const closeBtn = document.querySelector('.close');
  const loginBtn = document.querySelector('.main-login-btn');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // User data storage
  let userData = {
    isLoggedIn: false,
    name: '',
    email: '',
    phone: '',
    membership: 'basic' // 'basic' or 'pro'
  };

  // Open modal or account
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (userData.isLoggedIn) {
        showAccountModal();
      } else {
        modal.classList.add('active');
        // Reset to login tab
        switchTab('login');
      }
    });
  }

  // Account modal functionality
  const accountModal = document.getElementById('accountModal');

  window.closeAccountModal = function() {
    if (accountModal) {
      accountModal.classList.remove('active');
    }
  };

  window.showAccountModal = function() {
    if (accountModal) {
      // Update account info
      updateAccountDisplay();
      
      // Update membership display
      updateMembershipDisplay();
      
      accountModal.classList.add('active');
    }
  };

  function updateAccountDisplay() {
    if (userData.isLoggedIn) {
      document.getElementById('accountName').textContent = userData.name;
      document.getElementById('accountEmail').textContent = userData.email;
      document.getElementById('accountPhone').textContent = userData.phone;
    }
  }

  function updateMembershipDisplay() {
    const badge = document.getElementById('membershipBadge');
    const description = document.getElementById('membershipDescription');
    const actions = document.getElementById('membershipActions');
    
    if (!badge || !description) return;

    if (userData.membership === 'pro') {
      badge.className = 'membership-badge pro';
      badge.querySelector('.membership-label').textContent = 'Pro';
      description.textContent = 'Disfruta de todos los beneficios premium y servicios exclusivos';
      
      // Show actions if pro
      if (actions) {
        actions.style.display = 'block';
        actions.innerHTML = `
          <button class="downgrade-btn" onclick="downgradeMembership()">Cambiar a Básico</button>
          <button class="cancel-subscription-btn" onclick="cancelSubscription()">Cancelar suscripción</button>
        `;
      }
      
      // Highlight pro plan
      document.getElementById('planPro').classList.add('selected');
      document.getElementById('planBasic').classList.remove('selected');
    } else {
      badge.className = 'membership-badge';
      badge.querySelector('.membership-label').textContent = 'Básico';
      description.textContent = 'Disfruta de beneficios básicos en todos tus vuelos';
      
      // Show actions if basic
      if (actions) {
        actions.style.display = 'block';
        actions.innerHTML = `
          <button class="upgrade-btn" onclick="upgradeMembership()">Actualizar a Pro</button>
        `;
      }
      
      // Highlight basic plan
      document.getElementById('planBasic').classList.add('selected');
      document.getElementById('planPro').classList.remove('selected');
    }
  }

  window.selectPlan = function(plan) {
    if (plan === userData.membership) {
      return; // Already selected
    }
    
    updateMembershipDisplay();
  };

  window.upgradeMembership = function() {
    if (userData.membership === 'pro') {
      alert('Ya tienes membresía Pro');
      return;
    }

    if (confirm('¿Deseas actualizar tu membresía a Pro por $299/mes?')) {
      userData.membership = 'pro';
      updateMembershipDisplay();
      alert('¡Felicidades! Ahora eres miembro Pro de Quetzal Airways');
    }
  };

  window.downgradeMembership = function() {
    if (userData.membership === 'basic') {
      alert('Ya tienes membresía Básica');
      return;
    }

    if (confirm('¿Estás seguro de cambiar a membresía Básica? Perderás todos los beneficios Pro.')) {
      userData.membership = 'basic';
      updateMembershipDisplay();
      alert('Tu membresía se ha cambiado a Básica');
    }
  };

  window.cancelSubscription = function() {
    if (userData.membership === 'basic') {
      alert('No tienes una suscripción activa');
      return;
    }

    if (confirm('¿Estás seguro de cancelar tu suscripción Pro? Tendrás acceso hasta el final del período pagado.')) {
      // In a real app, this would schedule cancellation
      alert('Tu suscripción se cancelará al final del período actual. Seguirás disfrutando de los beneficios Pro hasta entonces.');
    }
  };

  window.handleLogout = function() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      userData.isLoggedIn = false;
      userData.name = '';
      userData.email = '';
      userData.phone = '';
      userData.membership = 'basic';

      // Update buttons
      if (loginBtn) {
        loginBtn.textContent = 'Iniciar sesion';
      }
      
      const misViajesLoginBtn = document.getElementById('misViajesLoginBtn');
      if (misViajesLoginBtn) {
        misViajesLoginBtn.textContent = 'Iniciar sesion';
      }

      // Disable Mis Viajes
      const misViajesLinks = document.querySelectorAll('#misViajesLink, #misViajesLink2');
      misViajesLinks.forEach(link => {
        link.classList.add('disabled');
      });

      // Close account modal
      closeAccountModal();

      // If on Mis Viajes page, go back to main
      const misViajesPage = document.getElementById('misViajesPage');
      const mainPage = document.getElementById('mainPage');
      if (misViajesPage && !misViajesPage.classList.contains('mis-viajes-page--hidden')) {
        showMainPage();
      }

      alert('Sesión cerrada correctamente');
    }
  };

  // Close account modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Tab switching
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Global function to switch tabs
  window.switchTab = function(tabName) {
    // Update tabs
    authTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.add('active');
      }
    });

    // Update forms
    if (tabName === 'login') {
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    } else {
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    }
  };

  // Handle login
  window.handleLogin = function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    // Simulate login (in real app, this would call an API)
    console.log('Login attempt:', { email, password });
    
    // Store user data (in real app, this would come from API)
    userData.isLoggedIn = true;
    userData.email = email;
    userData.name = email.split('@')[0]; // Temporary, real app would get from API
    userData.phone = '+52 123 456 7890'; // Temporary
    userData.membership = 'basic'; // Default membership
    
    alert('¡Bienvenido de vuelta!');
    modal.classList.remove('active');
    
    // Update login button text
    if (loginBtn) {
      loginBtn.textContent = 'Mi cuenta';
    }

    // Update login button in Mis Viajes page
    const misViajesLoginBtn = document.getElementById('misViajesLoginBtn');
    if (misViajesLoginBtn) {
      misViajesLoginBtn.textContent = 'Mi cuenta';
    }

    // Enable Mis Viajes link
    enableMisViajes();

    // Reset form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  };

  // Handle registration
  window.handleRegister = function() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !phone || !password || !confirmPassword) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validate phone format (basic)
    if (phone.length < 10) {
      alert('Por favor, ingresa un número de teléfono válido');
      return;
    }

    // Simulate registration (in real app, this would call an API)
    console.log('Registration attempt:', { name, email, phone });
    
    // Store user data (in real app, this would come from API)
    userData.isLoggedIn = true;
    userData.name = name;
    userData.email = email;
    userData.phone = phone;
    userData.membership = 'basic'; // Default membership for new users
    
    alert('¡Cuenta creada exitosamente!');
    modal.classList.remove('active');
    
    // Update login button text
    if (loginBtn) {
      loginBtn.textContent = 'Mi cuenta';
    }

    // Update login button in Mis Viajes page
    const misViajesLoginBtn = document.getElementById('misViajesLoginBtn');
    if (misViajesLoginBtn) {
      misViajesLoginBtn.textContent = 'Mi cuenta';
    }

    // Enable Mis Viajes link
    enableMisViajes();

    // Reset form
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPhone').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  };

  // Enable Mis Viajes functionality
  function enableMisViajes() {
    const misViajesLinks = document.querySelectorAll('#misViajesLink, #misViajesLink2');
    misViajesLinks.forEach(link => {
      link.classList.remove('disabled');
    });
  }

  // Show Mis Viajes page
  window.showMisViajes = function() {
    const misViajesLink = document.getElementById('misViajesLink');
    if (misViajesLink && misViajesLink.classList.contains('disabled')) {
      alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
      return;
    }

    const mainPage = document.getElementById('mainPage');
    const misViajesPage = document.getElementById('misViajesPage');

    if (mainPage && misViajesPage) {
      mainPage.classList.add('main-page--hidden');
      misViajesPage.classList.remove('mis-viajes-page--hidden');
      
      // Reset results
      const results = document.getElementById('misViajesResults');
      if (results) {
        results.innerHTML = '';
        results.className = 'mis-viajes-results';
      }
    }
  };

  // Show main page
  window.showMainPage = function() {
    const mainPage = document.getElementById('mainPage');
    const misViajesPage = document.getElementById('misViajesPage');
    const resultsPage = document.getElementById('flightResultsPage');
    const rastrearPage = document.getElementById('rastrearPage');
    const seatSelectionPage = document.getElementById('seatSelectionPage');
    const seatNumberSelectionPage = document.getElementById('seatNumberSelectionPage');
    const flightSummaryPage = document.getElementById('flightSummaryPage');
    const paymentMethodsPage = document.getElementById('paymentMethodsPage');
    const cardPaymentPage = document.getElementById('cardPaymentPage');
    const paymentProcessingPage = document.getElementById('paymentProcessingPage');
    const paymentConfirmationModal = document.getElementById('paymentConfirmationModal');
 
    // Hide all other pages and modals
    if (misViajesPage) {
      misViajesPage.classList.add('mis-viajes-page--hidden');
    }
    
    if (resultsPage) {
      resultsPage.classList.add('flight-results-page--hidden');
    }
    
    if (rastrearPage) {
      rastrearPage.classList.add('rastrear-page--hidden');
    }
    
    if (seatSelectionPage) {
      seatSelectionPage.classList.add('seat-selection-page--hidden');
    }
    
    if (seatNumberSelectionPage) {
      seatNumberSelectionPage.classList.add('seat-number-selection-page--hidden');
    }
    
    if (flightSummaryPage) {
      flightSummaryPage.classList.add('flight-summary-page--hidden');
    }
    
    if (paymentMethodsPage) {
      paymentMethodsPage.classList.add('payment-methods-page--hidden');
    }
    
    if (cardPaymentPage) {
      cardPaymentPage.classList.add('card-payment-page--hidden');
    }
    
    if (paymentProcessingPage) {
      paymentProcessingPage.classList.add('payment-processing-page--hidden');
    }
    
    if (paymentConfirmationModal) {
      paymentConfirmationModal.classList.add('payment-confirmation-modal--hidden');
    }
    
    // Show main page
    if (mainPage) {
      mainPage.classList.remove('main-page--hidden');
    }
  };

  // Show Rastrear page
  window.showRastrear = function() {
    const rastrearPage = document.getElementById('rastrearPage');
    const mainPage = document.getElementById('mainPage');
    const misViajesPage = document.getElementById('misViajesPage');
    const resultsPage = document.getElementById('flightResultsPage');
    
    // Hide all other pages
    if (mainPage) {
      mainPage.classList.add('main-page--hidden');
    }
    
    if (misViajesPage) {
      misViajesPage.classList.add('mis-viajes-page--hidden');
    }
    
    if (resultsPage) {
      resultsPage.classList.add('flight-results-page--hidden');
    }
    
    // Show rastrear page
    if (rastrearPage) {
      rastrearPage.classList.remove('rastrear-page--hidden');
      // Reset search type to destination
      switchRastrearType('destination');
      // Clear results
      const results = document.getElementById('rastrearResults');
      if (results) {
        results.innerHTML = '';
      }
    }
  };

  // Switch rastrear search type
  window.switchRastrearType = function(type) {
    const destinationForm = document.getElementById('destinationSearchForm');
    const flightNumberForm = document.getElementById('flightNumberSearchForm');
    const destinationBtn = document.querySelector('[data-search-type="destination"]');
    const flightNumberBtn = document.querySelector('[data-search-type="flightNumber"]');
    const results = document.getElementById('rastrearResults');
    
    if (type === 'destination') {
      if (destinationForm) destinationForm.classList.remove('rastrear-search-form--hidden');
      if (flightNumberForm) flightNumberForm.classList.add('rastrear-search-form--hidden');
      if (destinationBtn) {
        destinationBtn.classList.add('rastrear-type-btn-active');
        destinationBtn.classList.remove('rastrear-type-btn');
      }
      if (flightNumberBtn) {
        flightNumberBtn.classList.remove('rastrear-type-btn-active');
        flightNumberBtn.classList.add('rastrear-type-btn');
      }
    } else {
      if (destinationForm) destinationForm.classList.add('rastrear-search-form--hidden');
      if (flightNumberForm) flightNumberForm.classList.remove('rastrear-search-form--hidden');
      if (flightNumberBtn) {
        flightNumberBtn.classList.add('rastrear-type-btn-active');
        flightNumberBtn.classList.remove('rastrear-type-btn');
      }
      if (destinationBtn) {
        destinationBtn.classList.remove('rastrear-type-btn-active');
        destinationBtn.classList.add('rastrear-type-btn');
      }
    }
    
    // Clear results
    if (results) {
      results.innerHTML = '';
    }
  };

  // Handle Rastrear search
  window.handleRastrearSearch = function() {
    const destinationForm = document.getElementById('destinationSearchForm');
    const flightNumberForm = document.getElementById('flightNumberSearchForm');
    const results = document.getElementById('rastrearResults');
    
    if (!results) return;
    
    let searchType = 'destination';
    if (destinationForm && destinationForm.classList.contains('rastrear-search-form--hidden')) {
      searchType = 'flightNumber';
    }
    
    if (searchType === 'destination') {
      const destination = document.getElementById('rastrearDestinationSelect')?.value;
      if (!destination) {
        alert('Por favor, selecciona un destino');
        return;
      }
      searchFlightsByDestination(destination);
    } else {
      const flightNumber = document.getElementById('rastrearFlightNumber')?.value.trim().toUpperCase();
      if (!flightNumber) {
        alert('Por favor, ingresa un número de vuelo');
        return;
      }
      searchFlightByNumber(flightNumber);
    }
  };

  // Search flights by destination
  function searchFlightsByDestination(destination) {
    const results = document.getElementById('rastrearResults');
    if (!results) return;
    
    // Mock flight data
    const mockFlights = getMockFlightsByDestination(destination);
    
    setTimeout(() => {
      if (mockFlights.length > 0) {
        displayRastrearResults(mockFlights);
      } else {
        displayRastrearResults([]);
      }
    }, 500);
  }

  // Search flight by number
  function searchFlightByNumber(flightNumber) {
    const results = document.getElementById('rastrearResults');
    if (!results) return;
    
    // Mock flight data
    const mockFlight = getMockFlightByNumber(flightNumber);
    
    setTimeout(() => {
      if (mockFlight) {
        displayRastrearResults([mockFlight]);
      } else {
        displayRastrearResults([]);
      }
    }, 500);
  }

  // Get mock flights by destination
  function getMockFlightsByDestination(destination) {
    const destinations = {
      'CUN': [
        { flightNumber: 'QA-2045', origin: 'CDMX', originName: 'Ciudad de México', destination: 'CUN', destinationName: 'Cancún', departureTime: '08:30', arrivalTime: '10:45', departureDate: new Date(), status: 'on-time', gate: 'A12', terminal: '1', duration: '2h 15m' },
        { flightNumber: 'QA-2090', origin: 'CDMX', originName: 'Ciudad de México', destination: 'CUN', destinationName: 'Cancún', departureTime: '14:00', arrivalTime: '16:15', departureDate: new Date(), status: 'on-time', gate: 'B8', terminal: '1', duration: '2h 15m' }
      ],
      'MTY': [
        { flightNumber: 'QA-3021', origin: 'CDMX', originName: 'Ciudad de México', destination: 'MTY', destinationName: 'Monterrey', departureTime: '10:00', arrivalTime: '11:30', departureDate: new Date(), status: 'on-time', gate: 'C5', terminal: '2', duration: '1h 30m' }
      ]
    };
    
    return destinations[destination] || [];
  }

  // Get mock flight by number
  function getMockFlightByNumber(flightNumber) {
    const flights = {
      'QA-2045': { flightNumber: 'QA-2045', origin: 'CDMX', originName: 'Ciudad de México', destination: 'CUN', destinationName: 'Cancún', departureTime: '08:30', arrivalTime: '10:45', departureDate: new Date(), status: 'on-time', gate: 'A12', terminal: '1', duration: '2h 15m' },
      'QA-2090': { flightNumber: 'QA-2090', origin: 'CDMX', originName: 'Ciudad de México', destination: 'CUN', destinationName: 'Cancún', departureTime: '14:00', arrivalTime: '16:15', departureDate: new Date(), status: 'delayed', gate: 'B8', terminal: '1', duration: '2h 15m' },
      'QA-3021': { flightNumber: 'QA-3021', origin: 'CDMX', originName: 'Ciudad de México', destination: 'MTY', destinationName: 'Monterrey', departureTime: '10:00', arrivalTime: '11:30', departureDate: new Date(), status: 'on-time', gate: 'C5', terminal: '2', duration: '1h 30m' }
    };
    
    return flights[flightNumber] || null;
  }

  // Display rastrear results
  function displayRastrearResults(flights) {
    const results = document.getElementById('rastrearResults');
    if (!results) return;
    
    if (!flights || flights.length === 0) {
      results.innerHTML = `
        <div class="rastrear-no-results">
          <p>No se encontraron vuelos con los criterios especificados.</p>
        </div>
      `;
      return;
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-MX', options);
    };
    
    const statusTexts = {
      'on-time': 'A tiempo',
      'delayed': 'Retrasado',
      'cancelled': 'Cancelado'
    };
    
    results.innerHTML = flights.map(flight => `
      <div class="rastrear-flight-card">
        <div class="rastrear-flight-header">
          <div class="rastrear-flight-number">${flight.flightNumber}</div>
          <div class="rastrear-flight-status ${flight.status}">${statusTexts[flight.status] || 'A tiempo'}</div>
        </div>
        <div class="rastrear-flight-route">
          <div class="rastrear-airport-info">
            <div class="rastrear-airport-code">${flight.origin}</div>
            <div class="rastrear-airport-name">${flight.originName}</div>
            <div class="rastrear-flight-time">${flight.departureTime}</div>
            <div class="rastrear-flight-date">${formatDate(flight.departureDate)}</div>
          </div>
          <div style="flex: 1; text-align: center; padding: 0 20px;">
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #666;">→</div>
          </div>
          <div class="rastrear-airport-info">
            <div class="rastrear-airport-code">${flight.destination}</div>
            <div class="rastrear-airport-name">${flight.destinationName}</div>
            <div class="rastrear-flight-time">${flight.arrivalTime}</div>
            <div class="rastrear-flight-date">${formatDate(flight.departureDate)}</div>
          </div>
        </div>
        <div class="rastrear-flight-details">
          <div class="rastrear-detail-item">
            <div class="rastrear-detail-label">Puerta</div>
            <div class="rastrear-detail-value">${flight.gate || 'N/A'}</div>
          </div>
          <div class="rastrear-detail-item">
            <div class="rastrear-detail-label">Terminal</div>
            <div class="rastrear-detail-value">${flight.terminal || 'N/A'}</div>
          </div>
          <div class="rastrear-detail-item">
            <div class="rastrear-detail-label">Estado</div>
            <div class="rastrear-detail-value">${statusTexts[flight.status] || 'A tiempo'}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Handle Mis Viajes search
  window.handleMisViajesSearch = function() {
    const bookingCode = document.getElementById('bookingCode').value.trim().toUpperCase();
    const surname = document.getElementById('surname').value.trim().toUpperCase();

    if (!bookingCode || !surname) {
      alert('Por favor, completa ambos campos');
      return;
    }

    const results = document.getElementById('misViajesResults');
    if (!results) return;

    // Search in localStorage bookings
    let foundBooking = null;
    
    try {
      const storedBookings = JSON.parse(localStorage.getItem('quetzalBookings') || '[]');
      foundBooking = storedBookings.find(booking => 
        booking.flightCode.toUpperCase() === bookingCode && 
        booking.lastName.toUpperCase() === surname
      );
    } catch (e) {
      console.error('Error reading bookings:', e);
    }

    // Show results after a short delay for better UX
    setTimeout(() => {
      if (foundBooking) {
        // Show success message with flight details
        results.className = 'mis-viajes-results success';
        
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          return date.toLocaleDateString('es-MX', options);
        };
        
        results.innerHTML = `
          <h2>¡Vuelo encontrado!</h2>
          <div class="mis-viajes-flight-details" style="text-align: left; max-width: 600px; margin-top: 20px;">
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Código de reservación:</span>
              <span class="mis-viajes-info-value">${foundBooking.flightCode}</span>
            </div>
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Pasajero:</span>
              <span class="mis-viajes-info-value">${foundBooking.lastName}</span>
            </div>
            <div class="mis-viajes-flight-route">
              <div class="mis-viajes-time-block">
                <div class="mis-viajes-time">${foundBooking.flight.departureTime}</div>
                <div class="mis-viajes-airport">${foundBooking.flight.origin}</div>
              </div>
              <div class="mis-viajes-route-middle">
                <div class="mis-viajes-duration">${foundBooking.flight.duration}</div>
                <div class="mis-viajes-layover">${foundBooking.flight.layoverInfo}</div>
              </div>
              <div class="mis-viajes-time-block">
                <div class="mis-viajes-time">${foundBooking.flight.arrivalTime}</div>
                <div class="mis-viajes-airport">${foundBooking.flight.destination}</div>
              </div>
            </div>
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Fecha de salida:</span>
              <span class="mis-viajes-info-value">${formatDate(foundBooking.departureDate)}</span>
            </div>
            ${foundBooking.returnDate ? `
              <div class="mis-viajes-info-row">
                <span class="mis-viajes-info-label">Fecha de regreso:</span>
                <span class="mis-viajes-info-value">${formatDate(foundBooking.returnDate)}</span>
              </div>
            ` : ''}
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Pasajeros:</span>
              <span class="mis-viajes-info-value">${foundBooking.passengers.adults} ${foundBooking.passengers.adults === 1 ? 'Adulto' : 'Adultos'}${foundBooking.passengers.children > 0 ? `, ${foundBooking.passengers.children} ${foundBooking.passengers.children === 1 ? 'Niño' : 'Niños'}` : ''}</span>
            </div>
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Clase:</span>
              <span class="mis-viajes-info-value">${foundBooking.seatClassName}</span>
            </div>
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Asientos:</span>
              <span class="mis-viajes-info-value">${foundBooking.seats.join(', ')}</span>
            </div>
            <div class="mis-viajes-info-row">
              <span class="mis-viajes-info-label">Total pagado:</span>
              <span class="mis-viajes-info-value mis-viajes-total">$${foundBooking.totalPrice.toLocaleString('es-MX')}.00</span>
            </div>
          </div>
        `;
      } else {
        // Show error message
        results.className = 'mis-viajes-results error';
        results.innerHTML = `
          <h2>Lo sentimos no pudimos encontrar tu vuelo</h2>
          <p>Error: 404</p>
          <p>No se encontró ningún vuelo con el código <strong>${bookingCode}</strong> y apellido <strong>${surname}</strong>.</p>
          <p>Por favor verifica que hayas ingresado la información correctamente.</p>
        `;
      }
    }, 500);
  };

      // Set up login button in Rastrear page
      const rastrearLoginBtn = document.getElementById('rastrearLoginBtn');
      if (rastrearLoginBtn) {
        rastrearLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up login button in Mis Viajes page
      const misViajesLoginBtn = document.getElementById('misViajesLoginBtn');
      if (misViajesLoginBtn) {
        misViajesLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up login button in Results page
      const resultsLoginBtn = document.getElementById('resultsLoginBtn');
      if (resultsLoginBtn) {
        resultsLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Results page
      const misViajesLinkResults = document.getElementById('misViajesLinkResults');
      
      if (misViajesLinkResults) {
        misViajesLinkResults.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

      // Set up login button in Seat Number Selection page
      const seatNumberLoginBtn = document.getElementById('seatNumberLoginBtn');
      if (seatNumberLoginBtn) {
        seatNumberLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Seat Number Selection page
      const misViajesLinkSeatNumber = document.getElementById('misViajesLinkSeatNumber');
      if (misViajesLinkSeatNumber) {
        misViajesLinkSeatNumber.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

      // Set up login button in Summary page
      const summaryLoginBtn = document.getElementById('summaryLoginBtn');
      if (summaryLoginBtn) {
        summaryLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Summary page
      const misViajesLinkSummary = document.getElementById('misViajesLinkSummary');
      if (misViajesLinkSummary) {
        misViajesLinkSummary.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

      // Set up login button in Payment Methods page
      const paymentLoginBtn = document.getElementById('paymentLoginBtn');
      if (paymentLoginBtn) {
        paymentLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Payment Methods page
      const misViajesLinkPayment = document.getElementById('misViajesLinkPayment');
      if (misViajesLinkPayment) {
        misViajesLinkPayment.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

      // Set up login button in Card Payment page
      const cardLoginBtn = document.getElementById('cardLoginBtn');
      if (cardLoginBtn) {
        cardLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Card Payment page
      const misViajesLinkCard = document.getElementById('misViajesLinkCard');
      if (misViajesLinkCard) {
        misViajesLinkCard.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

      // Set up login button in Payment Processing page
      const processingLoginBtn = document.getElementById('processingLoginBtn');
      if (processingLoginBtn) {
        processingLoginBtn.addEventListener('click', () => {
          if (userData.isLoggedIn) {
            showAccountModal();
          } else {
            modal.classList.add('active');
            switchTab('login');
          }
        });
      }

      // Set up Mis Viajes link in Payment Processing page
      const misViajesLinkProcessing = document.getElementById('misViajesLinkProcessing');
      if (misViajesLinkProcessing) {
        misViajesLinkProcessing.addEventListener('click', (e) => {
          e.preventDefault();
          if (userData.isLoggedIn) {
            showMisViajes();
          } else {
            alert('Por favor, inicia sesión o regístrate para acceder a Mis viajes');
          }
        });
      }

  // Initially disable Mis Viajes
  document.addEventListener('DOMContentLoaded', function() {
    const misViajesLinks = document.querySelectorAll('#misViajesLink, #misViajesLink2');
    misViajesLinks.forEach(link => {
      link.classList.add('disabled');
    });
  });

})();

      // Flight search functionality
      (function() {
        'use strict';

        let currentTripType = 'round';
        let adultCount = 1;
        let childCount = 0;
        let currentSortOrder = 'asc'; // 'asc' for lowest price, 'desc' for highest price
        let currentFlights = []; // Store current flights for re-sorting
        let currentSearchData = null; // Store current search data
        let currentFilter = 'all'; // 'all', 'direct', or 'layover'

  // Trip type buttons
  const tripButtons = document.querySelectorAll('[data-trip-type]');
  
  tripButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons and add base class
      tripButtons.forEach(b => {
        b.classList.remove('trip-btn-active');
        b.classList.add('trip-btn');
      });
      // Remove base class and add active class to clicked button
      this.classList.remove('trip-btn');
      this.classList.add('trip-btn-active');
      
      currentTripType = this.getAttribute('data-trip-type');
      updateFormBasedOnTripType();
    });
  });

  // Update form based on trip type
  function updateFormBasedOnTripType() {
    const datesLabel = document.getElementById('datesLabel');
    const returnDateWrapper = document.getElementById('returnDateWrapper');
    const returnDate = document.getElementById('returnDate');

    if (currentTripType === 'round') {
      datesLabel.textContent = 'Fechas';
      returnDateWrapper.style.display = 'inline-block';
      returnDate.required = true;
    } else if (currentTripType === 'oneway') {
      datesLabel.textContent = 'Fecha de salida';
      returnDateWrapper.style.display = 'none';
      returnDate.required = false;
      returnDate.value = '';
    } else if (currentTripType === 'multi') {
      datesLabel.textContent = 'Fechas (múltiples destinos)';
      returnDateWrapper.style.display = 'inline-block';
      returnDate.required = true;
    }
  }

  // Passenger counter
  window.changePassengers = function(type, change) {
    if (type === 'adults') {
      adultCount = Math.max(1, Math.min(9, adultCount + change));
      document.getElementById('adultCount').textContent = adultCount;
      updatePassengerButtons('adults');
    } else if (type === 'children') {
      childCount = Math.max(0, Math.min(9, childCount + change));
      document.getElementById('childCount').textContent = childCount;
      updatePassengerButtons('children');
    }
  };

  function updatePassengerButtons(type) {
    const count = type === 'adults' ? adultCount : childCount;
    const buttons = document.querySelectorAll(`[onclick*="${type}"]`);
    buttons.forEach(btn => {
      const change = btn.textContent === '+' ? 1 : -1;
      if (change === -1) {
        btn.disabled = count <= (type === 'adults' ? 1 : 0);
      } else {
        btn.disabled = count >= 9;
      }
    });
  }

  // Initialize passenger buttons
  updatePassengerButtons('adults');
  updatePassengerButtons('children');

  // Prevent same origin and destination
  const originSelect = document.getElementById('originSelect');
  const destinationSelect = document.getElementById('destinationSelect');

  originSelect.addEventListener('change', function() {
    const selectedOrigin = this.value;
    const options = destinationSelect.querySelectorAll('option');
    
    options.forEach(option => {
      if (option.value === selectedOrigin) {
        option.disabled = true;
      } else {
        option.disabled = false;
      }
    });
  });

  destinationSelect.addEventListener('change', function() {
    const selectedDest = this.value;
    const options = originSelect.querySelectorAll('option');
    
    options.forEach(option => {
      if (option.value === selectedDest) {
        option.disabled = true;
      } else {
        option.disabled = false;
      }
    });
  });

  // Handle flight search
  window.handleFlightSearch = function() {
    const origin = originSelect.value;
    const destination = destinationSelect.value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;

    // Validation
    if (!destination) {
      alert('Por favor, selecciona un destino');
      return;
    }

    if (!departureDate) {
      alert('Por favor, selecciona una fecha de salida');
      return;
    }

    if (currentTripType === 'round' && !returnDate) {
      alert('Por favor, selecciona una fecha de regreso');
      return;
    }

    if (origin === destination) {
      alert('El origen y el destino no pueden ser iguales');
      return;
    }

    // Search object
    const searchData = {
      tripType: currentTripType,
      origin: origin,
      destination: destination,
      departureDate: departureDate,
      returnDate: returnDate || null,
      adults: adultCount,
      children: childCount,
      totalPassengers: adultCount + childCount
    };

    console.log('Flight search:', searchData);
    
        // Generate and display results
        const flights = generateFlightResults(searchData);
        currentFlights = flights;
        currentSearchData = searchData;
        displayFlightResults(searchData, flights, currentSortOrder, currentFilter);
  };

  // Generate flight results based on search
  function generateFlightResults(searchData) {
    const flights = [];
    const times = ['06:30', '07:45', '09:15', '11:20', '13:45', '15:30', '18:00', '20:15'];
    const durations = ['1h 15m', '1h 30m', '2h 15m', '2h 45m', '3h 20m'];
    const layovers = [false, false, false, true, true]; // Some flights have layovers
    const basePrices = [850, 980, 1120, 1200, 1350, 1420, 1580, 1720];

    // Generate 6-8 flight options
    const numFlights = Math.floor(Math.random() * 3) + 6; // 6-8 flights
    
    for (let i = 0; i < numFlights; i++) {
      const departureTime = times[Math.floor(Math.random() * times.length)];
      const arrivalHour = parseInt(departureTime.split(':')[0]) + Math.floor(Math.random() * 3) + 1;
      const arrivalMin = Math.floor(Math.random() * 60);
      const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`;
      
      const hasLayover = layovers[Math.floor(Math.random() * layovers.length)];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      const price = basePrices[Math.floor(Math.random() * basePrices.length)];
      
      flights.push({
        id: `FL${i + 1}`,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        origin: searchData.origin,
        destination: searchData.destination,
        duration: duration,
        hasLayover: hasLayover,
        layoverInfo: hasLayover ? '1 escala' : 'Direct',
        price: price,
        airline: 'Quetzal Airways'
      });
    }

        // Sort will be handled in displayFlightResults based on sort order
        return flights;
      }

      // Display flight results
      function displayFlightResults(searchData, flights, sortOrder = 'asc', filter = 'all') {
        // Filter flights based on layover preference
        let filteredFlights = [...flights];
        if (filter === 'direct') {
          filteredFlights = filteredFlights.filter(flight => !flight.hasLayover);
        } else if (filter === 'layover') {
          filteredFlights = filteredFlights.filter(flight => flight.hasLayover);
        }
        
        // Sort flights based on current sort order
        const sortedFlights = [...filteredFlights];
        if (sortOrder === 'asc') {
          sortedFlights.sort((a, b) => a.price - b.price);
        } else {
          sortedFlights.sort((a, b) => b.price - a.price);
        }
    const resultsPage = document.getElementById('flightResultsPage');
    const mainPage = document.getElementById('mainPage');
    
    if (!resultsPage || !mainPage) return;

    // Hide main page and show results page
    mainPage.classList.add('main-page--hidden');
    resultsPage.classList.remove('flight-results-page--hidden');

    // Update passenger info
    const passengerInfo = document.querySelector('.results-subtitle');
    
    if (passengerInfo) {
      const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
      passengerInfo.textContent = passengerText;
    }

    // Render flight cards
    const resultsList = document.getElementById('flightResultsList');
    if (!resultsList) return;

        resultsList.innerHTML = '';

        sortedFlights.forEach(flight => {
      const card = document.createElement('div');
      card.className = 'flight-result-card';
      
      card.innerHTML = `
        <div class="flight-time-info">
          <div class="flight-time">${flight.departureTime}</div>
          <div class="flight-airport">${flight.origin}</div>
        </div>
        
        <div class="flight-route-middle">
          <div class="flight-duration">${flight.duration}</div>
          <div class="flight-route-line"></div>
          <div class="flight-layover">${flight.layoverInfo}</div>
        </div>
        
        <div class="flight-time-info">
          <div class="flight-time">${flight.arrivalTime}</div>
          <div class="flight-airport">${flight.destination}</div>
        </div>
        
        <div class="flight-price">
          <div class="flight-price-amount">$${flight.price.toLocaleString('es-MX')}.00</div>
          <button class="flight-price-btn" onclick="selectFlight('${flight.id}')">Seleccionar</button>
        </div>
      `;
      
      resultsList.appendChild(card);
    });
  }

      // Function to select a flight and show seat selection page
      let currentlySelectedFlight = null;
      
      window.selectFlight = function(flightId) {
        console.log('Selected flight:', flightId);
        
        // Find the selected flight from current flights
        const selectedFlight = currentFlights.find(flight => flight.id === flightId);
        
        if (!selectedFlight) {
          alert('Error: No se pudo encontrar la información del vuelo seleccionado.');
          return;
        }
        
        // Store the selected flight globally
        currentlySelectedFlight = selectedFlight;
        
        // Show seat selection page
        showSeatSelectionPage(selectedFlight);
      };

      // Show seat selection page
      function showSeatSelectionPage(selectedFlight) {
        const resultsPage = document.getElementById('flightResultsPage');
        const seatSelectionPage = document.getElementById('seatSelectionPage');
        
        if (!resultsPage || !seatSelectionPage) return;

        // Hide results page and show seat selection page
        resultsPage.classList.add('flight-results-page--hidden');
        seatSelectionPage.classList.remove('seat-selection-page--hidden');

        // Update passenger info
        const passengerInfo = document.getElementById('seatSelectionPassengerInfo');
        if (passengerInfo) {
          const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
          passengerInfo.textContent = passengerText;
        }

        // Display selected flight info
        const flightInfo = document.getElementById('selectedFlightInfo');
        if (flightInfo && selectedFlight) {
          flightInfo.innerHTML = `
            <div class="flight-info-card">
              <div class="flight-info-time">
                <div class="flight-info-time-value">${selectedFlight.departureTime}</div>
                <div class="flight-info-airport">${selectedFlight.origin}</div>
              </div>
              <div class="flight-info-middle">
                <div class="flight-info-duration">${selectedFlight.duration}</div>
                <div class="flight-info-layover">${selectedFlight.layoverInfo}</div>
              </div>
              <div class="flight-info-time">
                <div class="flight-info-time-value">${selectedFlight.arrivalTime}</div>
                <div class="flight-info-airport">${selectedFlight.destination}</div>
              </div>
            </div>
          `;
        }

        // Display seat options
        displaySeatOptions(selectedFlight);
      }

      // Display seat options
      function displaySeatOptions(selectedFlight) {
        const seatOptionsList = document.getElementById('seatOptionsList');
        if (!seatOptionsList) return;

        // Define seat classes and their prices based on base flight price
        const basePrice = selectedFlight.price;
        const seatClasses = [
          {
            id: 'economy',
            name: 'Económica',
            description: 'Asientos estándar con todas las comodidades básicas',
            priceMultiplier: 1.0,
            features: ['Asiento estándar', 'Equipaje de mano incluido', 'Entretenimiento a bordo']
          },
          {
            id: 'premium',
            name: 'Premium Economy',
            description: 'Más espacio para las piernas y comodidad adicional',
            priceMultiplier: 1.5,
            features: ['Más espacio para piernas', 'Prioridad de embarque', 'Equipaje adicional']
          },
          {
            id: 'business',
            name: 'Business Class',
            description: 'Asientos reclinables con servicio premium',
            priceMultiplier: 2.5,
            features: ['Asientos reclinables', 'Sala VIP', 'Menú gourmet', 'Prioridad en todo']
          },
          {
            id: 'first',
            name: 'First Class',
            description: 'Máximo confort y lujo en tu viaje',
            priceMultiplier: 4.0,
            features: ['Cápsulas privadas', 'Servicio personalizado', 'Menú de chef', 'Suite privada']
          }
        ];

        seatOptionsList.innerHTML = '';

        seatClasses.forEach((seatClass, index) => {
          const seatPrice = Math.round(basePrice * seatClass.priceMultiplier);
          const totalPrice = seatPrice * (adultCount + childCount);
          
          const card = document.createElement('div');
          card.className = 'seat-option-card';
          
          card.innerHTML = `
            <div class="seat-option-header">
              <h3 class="seat-class-name">${seatClass.name}</h3>
              <div class="seat-class-price">
                <span class="seat-price-amount">$${seatPrice.toLocaleString('es-MX')}.00</span>
                <span class="seat-price-label">por persona</span>
              </div>
            </div>
            <p class="seat-class-description">${seatClass.description}</p>
            <ul class="seat-class-features">
              ${seatClass.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <div class="seat-option-footer">
              <div class="seat-total-price">
                <span class="seat-total-label">Total para ${adultCount + childCount} ${adultCount + childCount === 1 ? 'pasajero' : 'pasajeros'}:</span>
                <span class="seat-total-amount">$${totalPrice.toLocaleString('es-MX')}.00</span>
              </div>
              <button class="seat-select-btn" onclick="selectSeatClass('${seatClass.id}', ${seatPrice}, ${totalPrice})">
                Seleccionar
              </button>
            </div>
          `;
          
          seatOptionsList.appendChild(card);
        });
      }

      // Function to select a seat class and show seat number selection page
      let selectedSeatClassData = null;
      
      window.selectSeatClass = function(seatClassId, pricePerPerson, totalPrice) {
        console.log('Selected seat class:', seatClassId, 'Price per person:', pricePerPerson, 'Total:', totalPrice);
        
        // Store selected seat class data
        selectedSeatClassData = {
          classId: seatClassId,
          pricePerPerson: pricePerPerson,
          totalPrice: totalPrice
        };
        
        // Show seat number selection page
        showSeatNumberSelectionPage(selectedSeatClassData);
      };

      // Show seat number selection page
      function showSeatNumberSelectionPage(seatClassData) {
        const seatSelectionPage = document.getElementById('seatSelectionPage');
        const seatNumberSelectionPage = document.getElementById('seatNumberSelectionPage');
        
        if (!seatSelectionPage || !seatNumberSelectionPage) return;

        // Hide seat selection page and show seat number selection page
        seatSelectionPage.classList.add('seat-selection-page--hidden');
        seatNumberSelectionPage.classList.remove('seat-number-selection-page--hidden');

        // Update passenger info
        const passengerInfo = document.getElementById('seatNumberPassengerInfo');
        if (passengerInfo) {
          const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
          passengerInfo.textContent = passengerText;
        }

        // Display selected seat class info
        const seatClassInfo = document.getElementById('selectedSeatClassInfo');
        if (seatClassInfo && seatClassData) {
          const classNames = {
            'economy': 'Económica',
            'premium': 'Premium Economy',
            'business': 'Business Class',
            'first': 'First Class'
          };
          
          seatClassInfo.innerHTML = `
            <div class="seat-class-info-card">
              <div class="seat-class-info-name">Clase: ${classNames[seatClassData.classId] || seatClassData.classId}</div>
              <div class="seat-class-info-price">$${seatClassData.pricePerPerson.toLocaleString('es-MX')}.00 por persona</div>
            </div>
          `;
        }

        // Update total seats needed
        const totalSeatsNeeded = document.getElementById('totalSeatsNeeded');
        if (totalSeatsNeeded) {
          totalSeatsNeeded.textContent = (adultCount + childCount).toString();
        }

        // Generate and display seat map
        generateSeatMap(seatClassData.classId);
      }

      // Generate seat map based on class
      let selectedSeats = [];
      
      function generateSeatMap(seatClassId) {
        const seatMap = document.getElementById('seatMap');
        if (!seatMap) return;

        // Define seat layout based on class
        const seatLayouts = {
          'economy': { rows: 30, seatsPerRow: 6, seatConfig: 'ABC DEF' },
          'premium': { rows: 10, seatsPerRow: 6, seatConfig: 'ABC DEF' },
          'business': { rows: 8, seatsPerRow: 4, seatConfig: 'AB CD' },
          'first': { rows: 4, seatsPerRow: 4, seatConfig: 'AB CD' }
        };

        const layout = seatLayouts[seatClassId] || seatLayouts['economy'];
        seatMap.innerHTML = '';

        // Create rows
        for (let row = 1; row <= layout.rows; row++) {
          const rowElement = document.createElement('div');
          rowElement.className = 'seat-row';
          
          // Create seat labels (A, B, C, etc.)
          const seatLabels = layout.seatConfig.split(' ');
          
          // Left side seats
          const leftLabels = seatLabels[0].split('');
          leftLabels.forEach(label => {
            const seat = createSeatElement(row, label, seatClassId);
            rowElement.appendChild(seat);
          });
          
          // Row number in the middle
          const rowNumber = document.createElement('div');
          rowNumber.className = 'seat-row-number';
          rowNumber.textContent = row;
          rowElement.appendChild(rowNumber);
          
          // Right side seats
          const rightLabels = seatLabels[1].split('');
          rightLabels.forEach(label => {
            const seat = createSeatElement(row, label, seatClassId);
            rowElement.appendChild(seat);
          });
          
          seatMap.appendChild(rowElement);
        }

        // Reset selected seats
        selectedSeats = [];
        updateContinueButton();
      }

      // Create individual seat element
      function createSeatElement(row, label, seatClassId) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.row = row;
        seat.dataset.label = label;
        seat.dataset.seatId = `${row}${label}`;
        
        // Randomly assign some seats as occupied (30% chance)
        const isOccupied = Math.random() < 0.3;
        if (isOccupied) {
          seat.classList.add('seat--occupied');
        } else {
          seat.classList.add('seat--available');
          seat.onclick = () => toggleSeatSelection(seat);
        }
        
        seat.textContent = label;
        return seat;
      }

      // Toggle seat selection
      function toggleSeatSelection(seatElement) {
        if (seatElement.classList.contains('seat--occupied')) return;

        const seatId = seatElement.dataset.seatId;
        const totalNeeded = adultCount + childCount;
        
        if (seatElement.classList.contains('seat--selected')) {
          // Deselect seat
          seatElement.classList.remove('seat--selected');
          seatElement.classList.add('seat--available');
          selectedSeats = selectedSeats.filter(id => id !== seatId);
        } else {
          // Select seat if we haven't reached the limit
          if (selectedSeats.length < totalNeeded) {
            seatElement.classList.remove('seat--available');
            seatElement.classList.add('seat--selected');
            selectedSeats.push(seatId);
          } else {
            alert(`Solo puedes seleccionar ${totalNeeded} ${totalNeeded === 1 ? 'asiento' : 'asientos'}`);
            return;
          }
        }
        
        updateSeatSelectionUI();
        updateContinueButton();
      }

      // Update seat selection UI
      function updateSeatSelectionUI() {
        const selectedSeatsCount = document.getElementById('selectedSeatsCount');
        if (selectedSeatsCount) {
          selectedSeatsCount.textContent = selectedSeats.length.toString();
        }
      }

      // Update continue button state
      function updateContinueButton() {
        const continueBtn = document.getElementById('continueSeatBtn');
        const totalNeeded = adultCount + childCount;
        
        if (continueBtn) {
          if (selectedSeats.length === totalNeeded) {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
          } else {
            continueBtn.disabled = true;
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
          }
        }
      }

      // Continue from seat selection
      let selectedFlightData = null;
      
      window.continueFromSeatSelection = function() {
        const totalNeeded = adultCount + childCount;
        
        if (selectedSeats.length !== totalNeeded) {
          alert(`Por favor selecciona ${totalNeeded} ${totalNeeded === 1 ? 'asiento' : 'asientos'}`);
          return;
        }
        
        // Store selected flight data for summary
        if (currentSearchData && selectedSeatClassData && currentlySelectedFlight) {
          selectedFlightData = {
            ...currentSearchData,
            selectedFlight: currentlySelectedFlight,
            seatClass: selectedSeatClassData,
            selectedSeats: selectedSeats
          };
        }
        
        // Show summary page
        showFlightSummaryPage();
      };

      // Show flight summary page
      function showFlightSummaryPage() {
        const seatNumberSelectionPage = document.getElementById('seatNumberSelectionPage');
        const flightSummaryPage = document.getElementById('flightSummaryPage');
        
        if (!seatNumberSelectionPage || !flightSummaryPage) return;

        // Hide seat number selection page and show summary page
        seatNumberSelectionPage.classList.add('seat-number-selection-page--hidden');
        flightSummaryPage.classList.remove('flight-summary-page--hidden');

        // Update passenger info
        const passengerInfo = document.getElementById('summaryPassengerInfo');
        if (passengerInfo) {
          const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
          passengerInfo.textContent = passengerText;
        }

        // Display flight info
        displaySummaryFlightInfo();
        
        // Display passenger details
        displaySummaryPassengerDetails();
        
        // Display seats info
        displaySummarySeatsInfo();
        
        // Display pricing
        displaySummaryPricing();
      }

      // Display flight info in summary
      function displaySummaryFlightInfo() {
        const flightInfo = document.getElementById('summaryFlightInfo');
        if (!flightInfo || !selectedFlightData) return;

        const flight = selectedFlightData.selectedFlight;
        if (!flight) return;

        flightInfo.innerHTML = `
          <div class="summary-flight-card">
            <div class="summary-flight-time">
              <div class="summary-time-value">${flight.departureTime}</div>
              <div class="summary-airport">${flight.origin}</div>
            </div>
            <div class="summary-flight-middle">
              <div class="summary-duration">${flight.duration}</div>
              <div class="summary-layover">${flight.layoverInfo}</div>
            </div>
            <div class="summary-flight-time">
              <div class="summary-time-value">${flight.arrivalTime}</div>
              <div class="summary-airport">${flight.destination}</div>
            </div>
          </div>
          <div class="summary-flight-dates">
            <div class="summary-date-item">
              <span class="summary-date-label">Fecha de salida:</span>
              <span class="summary-date-value">${formatDate(selectedFlightData.departureDate)}</span>
            </div>
            ${selectedFlightData.returnDate ? `
              <div class="summary-date-item">
                <span class="summary-date-label">Fecha de regreso:</span>
                <span class="summary-date-value">${formatDate(selectedFlightData.returnDate)}</span>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Display passenger details in summary
      function displaySummaryPassengerDetails() {
        const passengerDetails = document.getElementById('summaryPassengerDetails');
        if (!passengerDetails) return;

        let html = '';
        const totalPassengers = adultCount + childCount;

        for (let i = 1; i <= totalPassengers; i++) {
          const passengerType = i <= adultCount ? 'Adulto' : 'Niño';
          html += `
            <div class="summary-passenger-item">
              <div class="summary-passenger-number">Pasajero ${i}</div>
              <div class="summary-passenger-type">${passengerType}</div>
            </div>
          `;
        }

        passengerDetails.innerHTML = html;
      }

      // Display seats info in summary
      function displaySummarySeatsInfo() {
        const seatsInfo = document.getElementById('summarySeatsInfo');
        if (!seatsInfo || !selectedSeatClassData) return;

        const classNames = {
          'economy': 'Económica',
          'premium': 'Premium Economy',
          'business': 'Business Class',
          'first': 'First Class'
        };

        seatsInfo.innerHTML = `
          <div class="summary-seats-card">
            <div class="summary-seat-class">
              <span class="summary-seat-label">Clase:</span>
              <span class="summary-seat-value">${classNames[selectedSeatClassData.classId] || selectedSeatClassData.classId}</span>
            </div>
            <div class="summary-seat-numbers">
              <span class="summary-seat-label">Asientos:</span>
              <span class="summary-seat-value">${selectedSeats.join(', ')}</span>
            </div>
          </div>
        `;
      }

      // Display pricing in summary
      function displaySummaryPricing() {
        const pricingDetails = document.getElementById('summaryPricingDetails');
        if (!pricingDetails || !selectedSeatClassData) return;

        const pricePerPerson = selectedSeatClassData.pricePerPerson;
        const totalPassengers = adultCount + childCount;
        const subtotal = pricePerPerson * totalPassengers;
        const taxes = Math.round(subtotal * 0.16); // 16% IVA
        const total = subtotal + taxes;

        pricingDetails.innerHTML = `
          <div class="summary-pricing-item">
            <span class="summary-pricing-label">Tarifa por persona (${totalPassengers} ${totalPassengers === 1 ? 'pasajero' : 'pasajeros'}):</span>
            <span class="summary-pricing-value">$${pricePerPerson.toLocaleString('es-MX')}.00</span>
          </div>
          <div class="summary-pricing-item">
            <span class="summary-pricing-label">Subtotal:</span>
            <span class="summary-pricing-value">$${subtotal.toLocaleString('es-MX')}.00</span>
          </div>
          <div class="summary-pricing-item">
            <span class="summary-pricing-label">Impuestos y cargos:</span>
            <span class="summary-pricing-value">$${taxes.toLocaleString('es-MX')}.00</span>
          </div>
          <div class="summary-pricing-item summary-pricing-total">
            <span class="summary-pricing-label">Total:</span>
            <span class="summary-pricing-value">$${total.toLocaleString('es-MX')}.00</span>
          </div>
        `;
      }

      // Format date helper function
      function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
      }

      // Continue from summary
      window.continueFromSummary = function() {
        console.log('Continuing to payment with data:', selectedFlightData);
        
        // Show payment methods page
        showPaymentMethodsPage();
      };

      // Show payment methods page
      function showPaymentMethodsPage() {
        const flightSummaryPage = document.getElementById('flightSummaryPage');
        const paymentMethodsPage = document.getElementById('paymentMethodsPage');
        
        if (!flightSummaryPage || !paymentMethodsPage) return;

        // Hide summary page and show payment methods page
        flightSummaryPage.classList.add('flight-summary-page--hidden');
        paymentMethodsPage.classList.remove('payment-methods-page--hidden');

        // Update passenger info
        const passengerInfo = document.getElementById('paymentPassengerInfo');
        if (passengerInfo) {
          const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
          passengerInfo.textContent = passengerText;
        }

        // Display payment summary
        displayPaymentSummary();
        
        // Display payment methods
        displayPaymentMethods();
      }

      // Display payment summary
      function displayPaymentSummary() {
        const summaryInfo = document.getElementById('paymentSummaryInfo');
        if (!summaryInfo || !selectedSeatClassData) return;

        const pricePerPerson = selectedSeatClassData.pricePerPerson;
        const totalPassengers = adultCount + childCount;
        const subtotal = pricePerPerson * totalPassengers;
        const taxes = Math.round(subtotal * 0.16);
        const total = subtotal + taxes;

        summaryInfo.innerHTML = `
          <div class="payment-summary-card">
            <div class="payment-summary-item">
              <span class="payment-summary-label">Subtotal:</span>
              <span class="payment-summary-value">$${subtotal.toLocaleString('es-MX')}.00</span>
            </div>
            <div class="payment-summary-item">
              <span class="payment-summary-label">Impuestos y cargos:</span>
              <span class="payment-summary-value">$${taxes.toLocaleString('es-MX')}.00</span>
            </div>
            <div class="payment-summary-item payment-summary-total">
              <span class="payment-summary-label">Total a pagar:</span>
              <span class="payment-summary-value">$${total.toLocaleString('es-MX')}.00</span>
            </div>
          </div>
        `;
      }

      // Display payment methods
      let selectedPaymentMethod = null;
      
      function displayPaymentMethods() {
        const paymentMethodsList = document.getElementById('paymentMethodsList');
        if (!paymentMethodsList) return;

        const paymentMethods = [
          {
            id: 'credit-card',
            name: 'Tarjeta de Crédito',
            icon: '💳',
            description: 'Visa, Mastercard, American Express',
            popular: true
          },
          {
            id: 'debit-card',
            name: 'Tarjeta de Débito',
            icon: '💳',
            description: 'Tarjetas de débito bancarias',
            popular: false
          },
          {
            id: 'paypal',
            name: 'PayPal',
            icon: '🔷',
            description: 'Paga rápido y seguro con PayPal',
            popular: true
          },
          {
            id: 'bank-transfer',
            name: 'Transferencia Bancaria',
            icon: '🏦',
            description: 'Transferencia directa desde tu banco',
            popular: false
          }
        ];

        paymentMethodsList.innerHTML = '';

        paymentMethods.forEach(method => {
          const card = document.createElement('div');
          card.className = `payment-method-card ${method.popular ? 'payment-method-popular' : ''}`;
          card.dataset.methodId = method.id;
          
          card.innerHTML = `
            <div class="payment-method-header">
              <div class="payment-method-icon">${method.icon}</div>
              <div class="payment-method-info">
                <h3 class="payment-method-name">${method.name}</h3>
                <p class="payment-method-description">${method.description}</p>
              </div>
              <div class="payment-method-radio">
                <input type="radio" name="paymentMethod" value="${method.id}" id="payment-${method.id}" onchange="selectPaymentMethod('${method.id}')">
                <label for="payment-${method.id}"></label>
              </div>
            </div>
            ${method.popular ? '<div class="payment-method-badge">Popular</div>' : ''}
          `;
          
          card.addEventListener('click', function(e) {
            if (e.target.type !== 'radio' && e.target.tagName !== 'LABEL') {
              const radio = card.querySelector('input[type="radio"]');
              if (radio) {
                radio.checked = true;
                selectPaymentMethod(method.id);
              }
            }
          });
          
          paymentMethodsList.appendChild(card);
        });
      }

      // Select payment method
      window.selectPaymentMethod = function(methodId) {
        selectedPaymentMethod = methodId;
        
        // Update visual selection
        const paymentCards = document.querySelectorAll('.payment-method-card');
        paymentCards.forEach(card => {
          card.classList.remove('payment-method-selected');
          if (card.dataset.methodId === methodId) {
            card.classList.add('payment-method-selected');
          }
        });
        
        // Enable continue button
        const continueBtn = document.getElementById('paymentContinueBtn');
        if (continueBtn) {
          continueBtn.disabled = false;
          continueBtn.style.opacity = '1';
          continueBtn.style.cursor = 'pointer';
        }
      };

      // Continue from payment
      window.continueFromPayment = function() {
        if (!selectedPaymentMethod) {
          alert('Por favor selecciona un método de pago');
          return;
        }
        
        console.log('Payment method selected:', selectedPaymentMethod);
        
        // Route based on payment method
        if (selectedPaymentMethod === 'paypal') {
          showPayPalLogin();
        } else if (selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') {
          showCardPaymentPage();
        } else if (selectedPaymentMethod === 'bank-transfer') {
          alert('Para completar la transferencia bancaria, recibirás las instrucciones por correo electrónico. Esta funcionalidad será implementada próximamente.');
        } else {
          alert(`Procesando pago con ${selectedPaymentMethod}. Esta funcionalidad será implementada próximamente.`);
        }
      };

      // Show PayPal login modal
      function showPayPalLogin() {
        const paypalModal = document.getElementById('paypalModal');
        if (paypalModal) {
          paypalModal.classList.remove('payment-modal--hidden');
        }
      }

      // Close PayPal modal
      window.closePayPalModal = function() {
        const paypalModal = document.getElementById('paypalModal');
        if (paypalModal) {
          paypalModal.classList.add('payment-modal--hidden');
        }
      };

      // Show card payment page
      function showCardPaymentPage() {
        const paymentMethodsPage = document.getElementById('paymentMethodsPage');
        const cardPaymentPage = document.getElementById('cardPaymentPage');
        
        if (!paymentMethodsPage || !cardPaymentPage) return;

        // Hide payment methods page and show card payment page
        paymentMethodsPage.classList.add('payment-methods-page--hidden');
        cardPaymentPage.classList.remove('card-payment-page--hidden');

        // Update passenger info
        const passengerInfo = document.getElementById('cardPaymentPassengerInfo');
        if (passengerInfo) {
          const passengerText = `${adultCount} ${adultCount === 1 ? 'Adulto' : 'Adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'Niño' : 'Niños'}` : ''}`;
          passengerInfo.textContent = passengerText;
        }

        // Display payment summary
        displayCardPaymentSummary();
        
        // Set up form handlers
        setupCardPaymentForm();
      }

      // Display payment summary in card payment page
      function displayCardPaymentSummary() {
        const summaryInfo = document.getElementById('cardPaymentSummaryInfo');
        if (!summaryInfo || !selectedSeatClassData) return;

        const pricePerPerson = selectedSeatClassData.pricePerPerson;
        const totalPassengers = adultCount + childCount;
        const subtotal = pricePerPerson * totalPassengers;
        const taxes = Math.round(subtotal * 0.16);
        const total = subtotal + taxes;

        summaryInfo.innerHTML = `
          <div class="payment-summary-card">
            <div class="payment-summary-item">
              <span class="payment-summary-label">Subtotal:</span>
              <span class="payment-summary-value">$${subtotal.toLocaleString('es-MX')}.00</span>
            </div>
            <div class="payment-summary-item">
              <span class="payment-summary-label">Impuestos y cargos:</span>
              <span class="payment-summary-value">$${taxes.toLocaleString('es-MX')}.00</span>
            </div>
            <div class="payment-summary-item payment-summary-total">
              <span class="payment-summary-label">Total a pagar:</span>
              <span class="payment-summary-value">$${total.toLocaleString('es-MX')}.00</span>
            </div>
          </div>
        `;
      }

      // Setup card payment form
      function setupCardPaymentForm() {
        const cardPaymentForm = document.getElementById('cardPaymentForm');
        if (!cardPaymentForm) return;

        // Format card number input
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
          cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
          });
        }

        // Format expiry date input
        const cardExpiryInput = document.getElementById('cardExpiry');
        if (cardExpiryInput) {
          cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
              value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
          });
        }

        // Only allow numbers for CVV
        const cardCVVInput = document.getElementById('cardCVV');
        if (cardCVVInput) {
          cardCVVInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
          });
        }

        // Handle form submission
        cardPaymentForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const cardData = {
            cardNumber: cardNumberInput.value.replace(/\s/g, ''),
            cardName: document.getElementById('cardName').value,
            cardExpiry: cardExpiryInput.value,
            cardCVV: cardCVVInput.value,
            saveCard: document.getElementById('saveCard').checked
          };

          console.log('Card payment submitted:', cardData);
          
          // Basic validation - check required fields first
          if (!cardData.cardName || cardData.cardName.trim().length === 0) {
            alert('Por favor ingresa el nombre en la tarjeta');
            return;
          }
          
          if (!cardData.cardExpiry || cardData.cardExpiry.length < 5) {
            alert('Por favor ingresa una fecha de expiración válida');
            return;
          }
          
          if (!cardData.cardCVV || cardData.cardCVV.length < 3) {
            alert('Por favor ingresa un CVV válido');
            return;
          }
          
          // Validate card number - more lenient validation
          const cardNumberClean = cardData.cardNumber.replace(/\s/g, '').replace(/\D/g, '');
          
          if (!cardNumberClean || cardNumberClean.length < 12) {
            alert('Por favor ingresa un número de tarjeta válido (mínimo 12 dígitos)');
            return;
          }
          
          if (cardNumberClean.length > 19) {
            alert('El número de tarjeta no puede tener más de 19 dígitos');
            return;
          }
          
          // Allow the payment to proceed if basic checks pass
          // In production, you would perform proper validation here
          showPaymentProcessingPage();
          
          // Here you would typically send this data to your payment processor
        });
      }

      // Show payment processing page
      function showPaymentProcessingPage() {
        const cardPaymentPage = document.getElementById('cardPaymentPage');
        const paymentProcessingPage = document.getElementById('paymentProcessingPage');
        
        if (!cardPaymentPage || !paymentProcessingPage) return;

        // Hide card payment page and show processing page
        cardPaymentPage.classList.add('card-payment-page--hidden');
        paymentProcessingPage.classList.remove('payment-processing-page--hidden');

        // Reset animation state
        const loadingSpinner = document.getElementById('loadingSpinner');
        const successCheckmark = document.getElementById('successCheckmark');
        const statusText = document.getElementById('processingStatusText');
        const statusSubtext = document.getElementById('processingStatusSubtext');
        
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (successCheckmark) successCheckmark.style.display = 'none';
        if (statusText) statusText.textContent = 'Procesando pago...';
        if (statusSubtext) statusSubtext.textContent = 'Por favor espera mientras procesamos tu pago';

        // Start processing animation (3 seconds total)
        setTimeout(() => {
          // After 2.5 seconds, show success checkmark
          if (loadingSpinner) loadingSpinner.style.display = 'none';
          if (successCheckmark) successCheckmark.style.display = 'block';
          if (statusText) statusText.textContent = '¡Pago exitoso!';
          if (statusSubtext) statusSubtext.textContent = 'Tu reserva ha sido confirmada';
          
          // After 3 seconds total, show confirmation modal
          setTimeout(() => {
            showPaymentConfirmationModal();
          }, 500); // 0.5 seconds after checkmark appears (3 seconds total)
        }, 2500); // 2.5 seconds of loading
      }

      // Simple card number validation (Luhn algorithm)
      function validateCardNumber(cardNumber) {
        if (!cardNumber) return false;
        
        // Remove spaces and non-digits
        const cleanedNumber = cardNumber.replace(/\s+/g, '').replace(/\D/g, '');
        
        // Check if it's a valid length (13-19 digits)
        if (cleanedNumber.length < 13 || cleanedNumber.length > 19) return false;
        
        // Check if all characters are digits
        if (!/^\d+$/.test(cleanedNumber)) return false;
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        // Process from right to left
        for (let i = cleanedNumber.length - 1; i >= 0; i--) {
          let digit = parseInt(cleanedNumber.charAt(i));
          
          if (isEven) {
            digit *= 2;
            if (digit > 9) {
              digit -= 9;
            }
          }
          
          sum += digit;
          isEven = !isEven;
        }
        
        return sum % 10 === 0;
      }

      // Show payment confirmation modal
      function showPaymentConfirmationModal() {
        const modal = document.getElementById('paymentConfirmationModal');
        if (!modal) return;

        // Generate flight code
        const flightCode = generateFlightCode();
        
        // Get last name from card name or generate one
        const cardName = document.getElementById('cardName')?.value || 'Usuario';
        const lastName = extractLastName(cardName);
        
        // Calculate total
        const total = (selectedSeatClassData.totalPrice + Math.round(selectedSeatClassData.totalPrice * 0.16));
        
        // Save booking information to localStorage for "Mis viajes"
        if (currentlySelectedFlight && selectedFlightData && selectedSeatClassData && selectedSeats) {
          const bookingInfo = {
            flightCode: flightCode,
            lastName: lastName,
            flight: {
              departureTime: currentlySelectedFlight.departureTime,
              arrivalTime: currentlySelectedFlight.arrivalTime,
              origin: currentlySelectedFlight.origin,
              destination: currentlySelectedFlight.destination,
              duration: currentlySelectedFlight.duration,
              layoverInfo: currentlySelectedFlight.layoverInfo
            },
            departureDate: selectedFlightData.departureDate,
            returnDate: selectedFlightData.returnDate || null,
            seatClass: selectedSeatClassData.classId,
            seatClassName: {
              'economy': 'Económica',
              'premium': 'Premium Economy',
              'business': 'Business Class',
              'first': 'First Class'
            }[selectedSeatClassData.classId] || selectedSeatClassData.classId,
            seats: selectedSeats,
            passengers: {
              adults: adultCount,
              children: childCount
            },
            totalPrice: total,
            bookingDate: new Date().toISOString()
          };
          
          // Save to localStorage
          try {
            const existingBookings = JSON.parse(localStorage.getItem('quetzalBookings') || '[]');
            existingBookings.push(bookingInfo);
            localStorage.setItem('quetzalBookings', JSON.stringify(existingBookings));
          } catch (e) {
            console.error('Error saving booking:', e);
          }
        }
        
        // Update modal content
        const flightCodeElement = document.getElementById('confirmationFlightCode');
        const lastNameElement = document.getElementById('confirmationLastName');
        const totalElement = document.getElementById('confirmationTotal');
        
        if (flightCodeElement) flightCodeElement.textContent = flightCode;
        if (lastNameElement) lastNameElement.textContent = lastName;
        if (totalElement) totalElement.textContent = `$${total.toLocaleString('es-MX')}.00`;
        
        // Show modal
        modal.classList.remove('payment-confirmation-modal--hidden');
      }

      // Generate random flight code
      function generateFlightCode() {
        const letters = 'QW';
        const numbers = Math.floor(10000 + Math.random() * 90000); // 5 digit number
        return `${letters}-${numbers}`;
      }

      // Extract last name from full name
      function extractLastName(fullName) {
        if (!fullName || fullName.trim().length === 0) {
          return 'Usuario';
        }
        
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          // Return the last part as last name
          return nameParts[nameParts.length - 1].toUpperCase();
        }
        
        // If only one name, return it as last name
        return nameParts[0].toUpperCase();
      }

      // Close confirmation modal and return to main page
      window.closeConfirmationModal = function() {
        const modal = document.getElementById('paymentConfirmationModal');
        if (modal) {
          modal.classList.add('payment-confirmation-modal--hidden');
        }
        
        // Hide payment processing page if visible
        const paymentProcessingPage = document.getElementById('paymentProcessingPage');
        if (paymentProcessingPage) {
          paymentProcessingPage.classList.add('payment-processing-page--hidden');
        }
        
        // Return to main page (this will hide all other pages and modals)
        showMainPage();
      };

      // Function to go back to payment methods
      window.showPaymentMethods = function() {
        const paymentMethodsPage = document.getElementById('paymentMethodsPage');
        const cardPaymentPage = document.getElementById('cardPaymentPage');
        
        if (paymentMethodsPage) paymentMethodsPage.classList.remove('payment-methods-page--hidden');
        if (cardPaymentPage) cardPaymentPage.classList.add('card-payment-page--hidden');
      };

      // Handle PayPal login form
      document.addEventListener('DOMContentLoaded', function() {
        const paypalLoginForm = document.getElementById('paypalLoginForm');
        if (paypalLoginForm) {
          paypalLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const paypalEmail = document.getElementById('paypalEmail').value;
            const paypalPassword = document.getElementById('paypalPassword').value;
            
            console.log('PayPal login attempted:', paypalEmail);
            
            // Close PayPal modal and show processing
            closePayPalModal();
            
            // Show payment processing page for PayPal
            setTimeout(() => {
              showPaymentProcessingPage();
            }, 300);
            
            // Here you would typically redirect to PayPal or process the payment
          });
        }
      });

      // Function to go back to flight summary
      window.showFlightSummary = function() {
        const flightSummaryPage = document.getElementById('flightSummaryPage');
        const paymentMethodsPage = document.getElementById('paymentMethodsPage');
        
        if (flightSummaryPage) flightSummaryPage.classList.remove('flight-summary-page--hidden');
        if (paymentMethodsPage) paymentMethodsPage.classList.add('payment-methods-page--hidden');
      };

      // Function to go back to seat number selection
      window.showSeatNumberSelection = function() {
        const seatNumberSelectionPage = document.getElementById('seatNumberSelectionPage');
        const flightSummaryPage = document.getElementById('flightSummaryPage');
        
        if (seatNumberSelectionPage) seatNumberSelectionPage.classList.remove('seat-number-selection-page--hidden');
        if (flightSummaryPage) flightSummaryPage.classList.add('flight-summary-page--hidden');
      };

      // Function to go back to seat class selection
      window.showSeatSelection = function() {
        const seatSelectionPage = document.getElementById('seatSelectionPage');
        const seatNumberSelectionPage = document.getElementById('seatNumberSelectionPage');
        
        if (seatSelectionPage) seatSelectionPage.classList.remove('seat-selection-page--hidden');
        if (seatNumberSelectionPage) seatNumberSelectionPage.classList.add('seat-number-selection-page--hidden');
      };

      // Function to go back to flight results
      window.showFlightResults = function() {
        const resultsPage = document.getElementById('flightResultsPage');
        const seatSelectionPage = document.getElementById('seatSelectionPage');
        
        if (resultsPage) resultsPage.classList.remove('flight-results-page--hidden');
        if (seatSelectionPage) seatSelectionPage.classList.add('seat-selection-page--hidden');
      };

      // Toggle sort order between lowest and highest price
      window.toggleSortOrder = function() {
        const sortText = document.getElementById('sortText');
        const sortIcon = document.getElementById('sortIcon');
        const sortControls = document.querySelector('.sort-controls');
        
        if (currentSortOrder === 'asc') {
          currentSortOrder = 'desc';
          sortText.textContent = 'Highest Price';
          sortIcon.textContent = '▲';
          sortControls.classList.add('sort-asc');
        } else {
          currentSortOrder = 'asc';
          sortText.textContent = 'Lowest Price';
          sortIcon.textContent = '▼';
          sortControls.classList.remove('sort-asc');
        }
        
        // Re-display results with new sort order
        if (currentFlights.length > 0 && currentSearchData) {
          displayFlightResults(currentSearchData, currentFlights, currentSortOrder, currentFilter);
        }
      };

      // Toggle filter menu
      window.toggleFilterMenu = function() {
        const filterMenu = document.getElementById('filterMenu');
        if (filterMenu) {
          filterMenu.classList.toggle('filter-menu-active');
        }
      };

      // Apply filter
      window.applyFilter = function(filterType) {
        currentFilter = filterType;
        const filterMenu = document.getElementById('filterMenu');
        const filterText = document.getElementById('filterText');
        const filterAll = document.getElementById('filterAll');
        const filterDirect = document.getElementById('filterDirect');
        const filterLayover = document.getElementById('filterLayover');
        
        // Update radio buttons
        if (filterAll) filterAll.checked = filterType === 'all';
        if (filterDirect) filterDirect.checked = filterType === 'direct';
        if (filterLayover) filterLayover.checked = filterType === 'layover';
        
        // Update button text
        if (filterText) {
          if (filterType === 'all') {
            filterText.textContent = 'Filter';
          } else if (filterType === 'direct') {
            filterText.textContent = 'Directos';
          } else if (filterType === 'layover') {
            filterText.textContent = 'Con escala';
          }
        }
        
        // Close menu
        if (filterMenu) {
          filterMenu.classList.remove('filter-menu-active');
        }
        
        // Re-display results with new filter
        if (currentFlights.length > 0 && currentSearchData) {
          displayFlightResults(currentSearchData, currentFlights, currentSortOrder, currentFilter);
        }
      };

      // Close filter menu when clicking outside
      document.addEventListener('click', function(event) {
        const filterBtn = document.getElementById('filterBtn');
        const filterMenu = document.getElementById('filterMenu');
        if (filterMenu && filterBtn && !filterBtn.contains(event.target) && !filterMenu.contains(event.target)) {
          filterMenu.classList.remove('filter-menu-active');
        }
      });

    })();

