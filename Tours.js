/* ============================================================
   CASA GRANDE — tours.js
   Módulos:
     1. Cursor personalizado
     2. Flip 3D de tarjetas al hacer clic en la foto
     3. Slider con botones prev/next y puntos indicadores
     4. Filtros por modalidad
     5. Modal de reserva con validación
     6. Fecha mínima del formulario
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CURSOR PERSONALIZADO
     ============================================================ */
  const cursor = document.getElementById('cursor');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top  = `${e.clientY}px`;
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  // Agrandar cursor en elementos interactivos
  const interactivos = 'a, button, .filtro-btn, input, select, textarea, .dest-foto, .actividad';
  document.querySelectorAll(interactivos).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grande'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grande'));
  });


  /* ============================================================
     2. FLIP 3D — clic en foto voltea la tarjeta
     ============================================================ */
  const tarjetas = document.querySelectorAll('.destino-card');

  tarjetas.forEach((tarjeta) => {
    const foto    = tarjeta.querySelector('.dest-foto');
    const btnBack = tarjeta.querySelector('.btn-volver');

    // Clic en la foto → voltear
    foto.addEventListener('click', () => {
      // Cerrar cualquier otra tarjeta volteada
      tarjetas.forEach((t) => {
        if (t !== tarjeta) t.classList.remove('volteada');
      });
      tarjeta.classList.toggle('volteada');
    });

    // Botón "Volver" → regresar al frente
    if (btnBack) {
      btnBack.addEventListener('click', (e) => {
        e.stopPropagation();
        tarjeta.classList.remove('volteada');
      });
    }
  });


  /* ============================================================
     3. SLIDER con botones prev/next y puntos
     ============================================================ */
  const slider    = document.getElementById('destinosGrid');
  const prevBtn   = document.querySelector('.prev-btn');
  const nextBtn   = document.querySelector('.next-btn');
  const dotsWrap  = document.getElementById('sliderDots');

  // Ancho de tarjeta + gap (2rem = 32px)
  const CARD_W    = 340;
  const GAP       = 32;
  const PASO      = CARD_W + GAP;

  let indice      = 0;  // índice de la tarjeta izquierda visible

  /**
   * Calcula cuántas tarjetas caben en el viewport del slider.
   */
  const tarjetasVisibles = () => {
    const wrapperW = slider.parentElement.clientWidth;
    return Math.max(1, Math.floor((wrapperW + GAP) / PASO));
  };

  /**
   * Calcula el total de pasos posibles (grupos de desplazamiento).
   */
  const totalPasos = () => {
    const visibles = tarjetasVisibles();
    const activas  = [...slider.querySelectorAll('.destino-card:not(.oculto)')];
    return Math.max(0, activas.length - visibles);
  };

  /**
   * Actualiza la posición visual del slider y el estado de los botones y puntos.
   */
  const actualizarSlider = () => {
    const pasos = totalPasos();
    indice = Math.min(indice, pasos);         // no pasar del límite
    indice = Math.max(0, indice);

    slider.style.transform = `translateX(-${indice * PASO}px)`;

    // Botones
    prevBtn.disabled = indice === 0;
    nextBtn.disabled = indice >= pasos;

    // Puntos
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('activo', i === indice);
    });
  };

  /**
   * Genera los puntos indicadores según el número de pasos.
   */
  const generarPuntos = () => {
    dotsWrap.innerHTML = '';
    const pasos = totalPasos();
    for (let i = 0; i <= pasos; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
      dot.addEventListener('click', () => {
        indice = i;
        actualizarSlider();
      });
      dotsWrap.appendChild(dot);
    }
    actualizarSlider();
  };

  prevBtn.addEventListener('click', () => { indice--; actualizarSlider(); });
  nextBtn.addEventListener('click', () => { indice++; actualizarSlider(); });

  // Recalcular al cambiar el tamaño de ventana
  window.addEventListener('resize', () => {
    indice = 0;
    generarPuntos();
  });


  /* ============================================================
     4. FILTROS POR MODALIDAD
     ============================================================ */
  const filtroBtns = document.querySelectorAll('.filtro-btn');

  filtroBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Marcar activo
      filtroBtns.forEach((b) => b.classList.remove('activo'));
      btn.classList.add('activo');

      const filtro = btn.dataset.filtro;

      // Mostrar / ocultar tarjetas
      tarjetas.forEach((tarjeta) => {
        const mods = tarjeta.dataset.modalidades || '';
        const mostrar = filtro === 'todos' || mods.includes(filtro);
        tarjeta.classList.toggle('oculto', !mostrar);
        if (!mostrar) tarjeta.classList.remove('volteada'); // voltear de vuelta si se oculta
      });

      // Resetear slider y puntos
      indice = 0;
      generarPuntos();
    });
  });

  // Inicializar puntos
  generarPuntos();


  /* ============================================================
     5. MODAL DE RESERVA
     ============================================================ */
  const overlay     = document.getElementById('modalOverlay');
  const modalDest   = document.getElementById('modalDestino');
  const btnCerrar   = document.getElementById('modalCerrar');
  const modalForm   = document.getElementById('modalForm');
  const msgEl       = document.getElementById('modal-msg');

  /**
   * Abre el modal con el nombre del destino.
   * @param {string} destino
   */
  const abrirModal = (destino) => {
    modalDest.textContent = destino;
    overlay.classList.add('abierto');
    document.body.style.overflow = 'hidden';
    // Resetear form y mensaje
    modalForm.reset();
    msgEl.className = 'form-mensaje';
    msgEl.textContent = '';
  };

  const cerrarModal = () => {
    overlay.classList.remove('abierto');
    document.body.style.overflow = '';
  };

  // Botones "Reservar este tour" dentro de cada tarjeta
  document.querySelectorAll('.btn-reservar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirModal(btn.dataset.destino || 'Tour');
    });
  });

  btnCerrar.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarModal();
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });


  /* ============================================================
     6. VALIDACIÓN Y ENVÍO DEL FORMULARIO
     ============================================================ */

  /**
   * Muestra un mensaje de estado en el formulario.
   * @param {string} texto
   * @param {'ok'|'err'} tipo
   */
  const mostrarMensaje = (texto, tipo) => {
    msgEl.textContent = texto;
    msgEl.className   = `form-mensaje ${tipo}`;
    setTimeout(() => {
      msgEl.className   = 'form-mensaje';
      msgEl.textContent = '';
    }, 5000);
  };

  /**
   * Valida todos los campos del formulario del modal.
   * @returns {boolean}
   */
  const validarModal = () => {
    const nombre   = document.getElementById('m-nombre').value.trim();
    const email    = document.getElementById('m-email').value.trim();
    const modalidad = document.getElementById('m-modalidad').value;
    const fecha    = document.getElementById('m-fecha').value;
    const personas = document.getElementById('m-personas').value;

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre)               { mostrarMensaje('Por favor ingresa tu nombre.', 'err');            return false; }
    if (!emailReg.test(email)) { mostrarMensaje('Ingresa un correo electrónico válido.', 'err');   return false; }
    if (!modalidad)            { mostrarMensaje('Selecciona una modalidad de servicio.', 'err');    return false; }
    if (!fecha)                { mostrarMensaje('Selecciona la fecha del tour.', 'err');            return false; }
    if (!personas || personas < 1) { mostrarMensaje('Indica el número de personas.', 'err');       return false; }

    return true;
  };

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarModal()) return;

    const btnEnviar = modalForm.querySelector('.btn-submit');
    btnEnviar.textContent = 'Enviando...';
    btnEnviar.disabled    = true;

    // Simulación de envío — conecta aquí tu backend o servicio de email
    setTimeout(() => {
      mostrarMensaje('¡Solicitud enviada! Te contactaremos pronto 🏡', 'ok');
      modalForm.reset();
      btnEnviar.textContent = 'Enviar solicitud ✦';
      btnEnviar.disabled    = false;

      // Cerrar modal tras 2 segundos
      setTimeout(cerrarModal, 2200);
    }, 1400);
  });


  /* ============================================================
     7. FECHA MÍNIMA — no permitir fechas pasadas
     ============================================================ */
  const inputFecha = document.getElementById('m-fecha');
  if (inputFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.setAttribute('min', hoy);
  }

}); // fin DOMContentLoaded