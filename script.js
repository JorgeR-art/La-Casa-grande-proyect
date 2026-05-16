/* ============================================================
   CASA GRANDE — script.js
   Módulos:
     1. Cursor personalizado
     2. Navbar al hacer scroll
     3. Menú móvil (hamburger)
     4. Animaciones reveal al hacer scroll
     5. Validación y envío del formulario
     6. Fechas mínimas en el formulario
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CURSOR PERSONALIZADO
     ============================================================ */
  const cursor = document.getElementById('cursor');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  // Elementos interactivos que agrandan el cursor
  const interactivos = document.querySelectorAll(
    'a, button, .card, .g-item, input, select, textarea'
  );

  interactivos.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grande'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grande'));
  });

  // Ocultar cursor al salir de la ventana
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });


  /* ============================================================
     2. NAVBAR — cambio al hacer scroll
     ============================================================ */
  const navbar = document.getElementById('navbar');

  const manejarNavbar = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', manejarNavbar, { passive: true });
  manejarNavbar(); // estado inicial


  /* ============================================================
     3. MENÚ MÓVIL (HAMBURGER)
     ============================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobLinks   = document.querySelectorAll('.mob-link');

  const toggleMenu = () => {
    mobileMenu.classList.toggle('abierto');
    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = mobileMenu.classList.contains('abierto')
      ? 'hidden'
      : '';
  };

  hamburger.addEventListener('click', toggleMenu);

  // Cerrar menú al hacer clic en un enlace
  mobLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('abierto');
      document.body.style.overflow = '';
    });
  });


  /* ============================================================
     4. REVEAL AL HACER SCROLL — Intersection Observer
     ============================================================ */
  const elementos = document.querySelectorAll('.reveal');

  const observadorReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Pequeño delay escalonado para grupos de elementos
          const delay = index * 70;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observadorReveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elementos.forEach((el) => observadorReveal.observe(el));


  /* ============================================================
     5. FORMULARIO — validación y envío simulado
     ============================================================ */
  const form    = document.getElementById('reservaForm');
  const formMsg = document.getElementById('form-msg');

  /**
   * Muestra un mensaje de feedback en el formulario.
   * @param {string} texto   - Texto a mostrar
   * @param {string} tipo    - 'ok' | 'err'
   */
  const mostrarMensaje = (texto, tipo) => {
    formMsg.textContent = texto;
    formMsg.className = `form-mensaje ${tipo}`;
    setTimeout(() => {
      formMsg.className = 'form-mensaje';
      formMsg.textContent = '';
    }, 5000);
  };

  /**
   * Valida los campos del formulario.
   * Retorna true si todo es válido, false si hay error.
   */
  const validarFormulario = () => {
    const nombre   = document.getElementById('nombre').value.trim();
    const email    = document.getElementById('email').value.trim();
    const servicio = document.getElementById('servicio').value;
    const llegada  = document.getElementById('llegada').value;
    const salida   = document.getElementById('salida').value;

    if (!nombre) {
      mostrarMensaje('Por favor ingresa tu nombre.', 'err');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarMensaje('Por favor ingresa un correo electrónico válido.', 'err');
      return false;
    }

    if (!servicio) {
      mostrarMensaje('Por favor selecciona un servicio.', 'err');
      return false;
    }

    if (!llegada || !salida) {
      mostrarMensaje('Por favor selecciona las fechas de llegada y salida.', 'err');
      return false;
    }

    if (new Date(salida) <= new Date(llegada)) {
      mostrarMensaje('La fecha de salida debe ser posterior a la de llegada.', 'err');
      return false;
    }

    return true;
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validarFormulario()) return;

      // Simulación de envío — aquí puedes conectar tu backend o servicio de email
      const btnSubmit = form.querySelector('.btn-submit');
      btnSubmit.textContent = 'Enviando...';
      btnSubmit.disabled = true;

      setTimeout(() => {
        mostrarMensaje(
          '¡Gracias! Recibimos tu solicitud. Te contactaremos pronto 🏡',
          'ok'
        );
        form.reset();
        btnSubmit.textContent = 'Enviar Solicitud ✦';
        btnSubmit.disabled = false;
      }, 1400);
    });
  }


  /* ============================================================
     6. FECHAS MÍNIMAS EN EL FORMULARIO
     (no permitir fechas pasadas)
     ============================================================ */
  const inputLlegada = document.getElementById('llegada');
  const inputSalida  = document.getElementById('salida');

  if (inputLlegada && inputSalida) {
    // Fecha mínima = hoy
    const hoy = new Date().toISOString().split('T')[0];
    inputLlegada.setAttribute('min', hoy);
    inputSalida.setAttribute('min', hoy);

    // Cuando cambia llegada, ajustar mínimo de salida
    inputLlegada.addEventListener('change', () => {
      inputSalida.setAttribute('min', inputLlegada.value);
      // Si la salida ya elegida es anterior a la nueva llegada, resetearla
      if (inputSalida.value && inputSalida.value <= inputLlegada.value) {
        inputSalida.value = '';
      }
    });
  }

}); // fin DOMContentLoaded
