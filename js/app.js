(() => {
  const { products, frames, infoPages } = window.SKALA_DATA;

  const els = {
    homeView: document.getElementById('homeView'),
    framesContainer: document.getElementById('framesContainer'),
    productView: document.getElementById('productView'),
    productEditorial: document.getElementById('productEditorial'),
    productRightPanel: document.getElementById('productRightPanel'),
    productCounter: document.getElementById('productCounter'),
    productSeriesCode: document.getElementById('productSeriesCode'),
    productTitle: document.getElementById('productTitle'),
    productSpec: document.getElementById('productSpec'),
    productCraftNote: document.getElementById('productCraftNote'),
    productPrice: document.getElementById('productPrice'),
    handMacroImg: document.getElementById('handMacroImg'),
    handMacroCaption: document.getElementById('handMacroCaption'),
    gearDots: document.getElementById('gearDots'),
    prevRingBtn: document.getElementById('prevRingBtn'),
    nextRingBtn: document.getElementById('nextRingBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),
    acquireBtn: document.getElementById('acquireBtn'),
    acquireFeedback: document.getElementById('acquireFeedback'),
    sizeSelector: document.getElementById('sizeSelector'),
    brandLogoLink: document.getElementById('brandLogoLink'),

    menuToggleBtn: document.getElementById('menuToggleBtn'),
    menuDrawer: document.getElementById('menuDrawer'),
    menuBackdrop: document.getElementById('menuBackdrop'),
    closeMenuBtn: document.getElementById('closeMenuBtn'),
    drawerProductList: document.getElementById('drawerProductList'),

    cartToggleBtn: document.getElementById('cartToggleBtn'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartBackdrop: document.getElementById('cartBackdrop'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartCountBadge: document.getElementById('cartCountBadge'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartFooter: document.getElementById('cartFooter'),
    cartTotalValue: document.getElementById('cartTotalValue'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    cartConfirmation: document.getElementById('cartConfirmation'),

    infoModal: document.getElementById('infoModal'),
    infoModalTitle: document.getElementById('infoModalTitle'),
    infoModalBody: document.getElementById('infoModalBody'),
    closeInfoModalBtn: document.getElementById('closeInfoModalBtn'),
  };

  let activeProductIdx = 0;
  let selectedSize = '17.3mm (7)';
  let cart = loadCart();
  let switchSwapTimer = null;

  const turntable = new window.OrbitalTurntable({
    stageEl: document.getElementById('orbitalStage'),
    trackEl: document.getElementById('orbitalTrack'),
    slotA: document.getElementById('orbitalSlotA'),
    slotB: document.getElementById('orbitalSlotB'),
    rimGlowEl: document.getElementById('stageRimGlow'),
    onSwitchStart: (newIdx, product) => {
      activeProductIdx = newIdx;
      updateHashSilent(product.id);
      syncGearDots(newIdx);
      els.acquireFeedback.textContent = '';

      els.productEditorial.classList.add('is-switching');
      els.productRightPanel.classList.add('is-switching');

      clearTimeout(switchSwapTimer);
      switchSwapTimer = setTimeout(() => {
        populateProductPanels(newIdx, product);
        els.productEditorial.classList.remove('is-switching');
        els.productRightPanel.classList.remove('is-switching');
      }, 240);
    },
    onSwitchComplete: (newIdx, product) => {
      activeProductIdx = newIdx;
      populateProductPanels(newIdx, product);
    },
  });

  function loadCart() {
    try {
      const raw = localStorage.getItem('skala_cart_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem('skala_cart_v1', JSON.stringify(cart));
    } catch {
      // Ignore storage quota / privacy mode issues
    }
  }

  function formatUSD(n) {
    return '$' + Number(n).toLocaleString('en-US');
  }

  function createSplitHalf(sideData, productIndex) {
    const product = products[productIndex];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'split-half';
    btn.setAttribute('aria-label', `Inspect ${product.title}`);

    const wrap = document.createElement('div');
    wrap.className = 'split-video-wrap' + (sideData.dimensional ? ' is-dimensional' : '');

    const video = document.createElement('video');
    video.className = 'split-video' + (sideData.gradeClass ? ' ' + sideData.gradeClass : '');
    video.src = sideData.video;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');

    const veil = document.createElement('div');
    veil.className = 'split-hover-veil';

    const label = document.createElement('span');
    label.className = 'hover-item-name';
    label.textContent = sideData.label || product.title;

    veil.appendChild(label);
    wrap.appendChild(video);
    btn.appendChild(wrap);
    btn.appendChild(veil);

    btn.addEventListener('click', () => {
      openProductRoute(product.id);
    });

    return btn;
  }

  function buildHomeFrames() {
    els.framesContainer.innerHTML = '';
    frames.forEach((frame) => {
      const section = document.createElement('section');
      section.className = 'split-frame';
      section.id = frame.id;
      section.setAttribute('aria-label', `Collection frame ${frame.productIndex + 1}`);

      section.appendChild(createSplitHalf(frame.left, frame.productIndex));
      section.appendChild(createSplitHalf(frame.right, frame.productIndex));

      els.framesContainer.appendChild(section);
    });

    ensureVideosPlaying();
  }

  function ensureVideosPlaying() {
    const videos = els.framesContainer.querySelectorAll('video');
    videos.forEach((v) => {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    });
  }

  function pauseHomeVideos() {
    els.framesContainer.querySelectorAll('video').forEach((v) => v.pause());
  }

  function buildMenuProducts() {
    els.drawerProductList.innerHTML = '';
    products.forEach((p, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'drawer-product-btn';
      btn.innerHTML = `
        <span class="drawer-product-name">${p.title}</span>
        <span class="drawer-product-idx">0${idx + 1}</span>
      `;
      btn.addEventListener('click', () => {
        closeDrawers();
        openProductRoute(p.id);
      });
      li.appendChild(btn);
      els.drawerProductList.appendChild(li);
    });
  }

  function buildGearDots() {
    els.gearDots.innerHTML = '';
    products.forEach((p, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gear-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Rotate to ${p.title}`);
      dot.addEventListener('click', () => {
        if (idx === activeProductIdx) return;
        const dir = idx > activeProductIdx ? 1 : -1;
        // Rotate directly to target index by computing shortest delta or explicit jump
        jumpToIndex(idx, dir);
      });
      els.gearDots.appendChild(dot);
    });
  }

  function jumpToIndex(targetIdx, dirHint = 1) {
    const len = products.length;
    const prevIdx = activeProductIdx;
    if (targetIdx === prevIdx) return;

    // Temporarily align currentIndex so turntable.rotateBy(1) hits exact targetIdx
    const normalizedStep = targetIdx - prevIdx;
    turntable.rotateBy(normalizedStep);
    void dirHint;
  }

  function syncGearDots(idx) {
    const dots = els.gearDots.querySelectorAll('.gear-dot');
    dots.forEach((dot, i) => {
      const isAct = i === idx;
      dot.classList.toggle('is-active', isAct);
      dot.setAttribute('aria-selected', String(isAct));
    });
  }

  function populateProductPanels(idx, product) {
    const total = String(products.length).padStart(2, '0');
    const cur = String(idx + 1).padStart(2, '0');

    els.productCounter.textContent = `${cur} / ${total}`;
    els.productSeriesCode.textContent = product.code;
    els.productTitle.textContent = product.title;
    els.productSpec.textContent = product.spec;
    els.productCraftNote.textContent = product.craftNote;
    els.productPrice.textContent = formatUSD(product.price);
    els.handMacroImg.src = product.handImg;
    els.handMacroImg.alt = `${product.title} worn on a physician hand`;
    els.handMacroCaption.textContent = product.handCaption;
    syncGearDots(idx);
  }

  function showHomeView() {
    document.body.classList.remove('mode-product');
    document.body.classList.add('mode-home');
    document.body.classList.remove('no-scroll');

    els.productView.classList.remove('is-visible');
    els.productView.hidden = true;
    els.homeView.hidden = false;

    ensureVideosPlaying();
  }

  function showProductView(productId) {
    const foundIdx = products.findIndex((p) => p.id === productId);
    const idx = foundIdx >= 0 ? foundIdx : 0;
    const product = products[idx];
    activeProductIdx = idx;

    pauseHomeVideos();
    els.homeView.hidden = true;
    els.productView.hidden = false;
    document.body.classList.remove('mode-home');
    document.body.classList.add('mode-product');
    document.body.classList.add('no-scroll');

    els.acquireFeedback.textContent = '';
    populateProductPanels(idx, product);
    turntable.setProducts(products, idx);

    requestAnimationFrame(() => {
      els.productView.classList.add('is-visible');
    });
  }

  function openProductRoute(productId) {
    const nextHash = `#/product/${productId}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      showProductView(productId);
    }
  }

  function openHomeRoute() {
    if (window.location.hash && window.location.hash !== '#/') {
      window.location.hash = '#/';
    } else {
      showHomeView();
    }
  }

  function updateHashSilent(productId) {
    const nextHash = `#/product/${productId}`;
    try {
      window.history.replaceState(null, '', nextHash);
    } catch {
      // Fallback safely if restricted
    }
  }

  function handleRoute() {
    const hash = window.location.hash || '#/';
    const match = hash.match(/^#\/product\/([^/]+)$/);
    if (match) {
      showProductView(match[1]);
    } else {
      showHomeView();
    }
  }

  function renderCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    els.cartCountBadge.textContent = String(totalCount);
    els.cartCountBadge.hidden = totalCount === 0;

    els.cartItemsList.innerHTML = '';
    els.cartConfirmation.hidden = true;

    if (!cart.length) {
      els.cartItemsList.innerHTML = '<p class="cart-empty">NO SPECIMENS IN REQUISITION CASE.</p>';
      els.cartTotalValue.textContent = '$0';
      els.checkoutBtn.disabled = true;
      els.checkoutBtn.style.opacity = '0.45';
      return;
    }

    els.checkoutBtn.disabled = false;
    els.checkoutBtn.style.opacity = '1';

    let total = 0;
    cart.forEach((item, index) => {
      const product = products.find((p) => p.id === item.id) || products[0];
      total += product.price * item.qty;

      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <img class="cart-thumb" src="${product.plateImg}" alt="${product.title}" />
        <div class="cart-item-info">
          <h3>${product.title}</h3>
          <p class="cart-item-sub">CALIPER ${item.size} &times; ${item.qty} &mdash; ${formatUSD(product.price * item.qty)}</p>
        </div>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cart-remove-btn';
      removeBtn.textContent = 'REMOVE';
      removeBtn.addEventListener('click', () => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      });

      row.appendChild(removeBtn);
      els.cartItemsList.appendChild(row);
    });

    els.cartTotalValue.textContent = formatUSD(total);
  }

  function acquireCurrentPiece() {
    const product = products[activeProductIdx];
    const existing = cart.find((item) => item.id === product.id && item.size === selectedSize);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, size: selectedSize, qty: 1 });
    }
    saveCart();
    renderCart();
    els.acquireFeedback.textContent = `ADDED TO REQUISITION CASE — ${product.title} (${selectedSize})`;
  }

  function openMenu() {
    closeDrawers();
    els.menuBackdrop.hidden = false;
    els.menuDrawer.hidden = false;
    els.menuToggleBtn.setAttribute('aria-expanded', 'true');
  }

  function openCart() {
    closeDrawers();
    renderCart();
    els.cartBackdrop.hidden = false;
    els.cartDrawer.hidden = false;
    els.cartToggleBtn.setAttribute('aria-expanded', 'true');
  }

  function openInfoModal(key) {
    const info = infoPages[key];
    if (!info) return;
    closeDrawers();
    els.infoModalTitle.textContent = info.title;
    els.infoModalBody.innerHTML = info.body;
    els.infoModal.hidden = false;
  }

  function closeDrawers() {
    els.menuBackdrop.hidden = true;
    els.menuDrawer.hidden = true;
    els.cartBackdrop.hidden = true;
    els.cartDrawer.hidden = true;
    els.infoModal.hidden = true;
    els.menuToggleBtn.setAttribute('aria-expanded', 'false');
    els.cartToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function bindUI() {
    els.brandLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawers();
      openHomeRoute();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    els.backToHomeBtn.addEventListener('click', () => {
      openHomeRoute();
    });

    els.prevRingBtn.addEventListener('click', () => turntable.rotateBy(-1));
    els.nextRingBtn.addEventListener('click', () => turntable.rotateBy(1));

    els.sizeSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.size-pill');
      if (!btn) return;
      selectedSize = btn.dataset.size;
      els.sizeSelector.querySelectorAll('.size-pill').forEach((pill) => {
        pill.classList.toggle('is-active', pill === btn);
      });
    });

    els.acquireBtn.addEventListener('click', acquireCurrentPiece);

    els.menuToggleBtn.addEventListener('click', openMenu);
    els.closeMenuBtn.addEventListener('click', closeDrawers);
    els.menuBackdrop.addEventListener('click', closeDrawers);

    els.cartToggleBtn.addEventListener('click', openCart);
    els.closeCartBtn.addEventListener('click', closeDrawers);
    els.cartBackdrop.addEventListener('click', closeDrawers);

    els.closeInfoModalBtn.addEventListener('click', closeDrawers);
    els.infoModal.addEventListener('click', (e) => {
      if (e.target === els.infoModal) closeDrawers();
    });

    els.checkoutBtn.addEventListener('click', () => {
      if (!cart.length) return;
      const serial = Math.floor(100000 + Math.random() * 899999);
      els.cartConfirmation.textContent =
        `REQUISITION LOGGED // REF #SK-${serial}. CALIBRATION & CONCIERGE DISPATCH CONFIRMATION ISSUED.`;
      els.cartConfirmation.hidden = false;
      cart = [];
      saveCart();
      els.cartCountBadge.hidden = true;
      els.cartCountBadge.textContent = '0';
      els.cartItemsList.innerHTML = '<p class="cart-empty">ALLOCATION RESERVED.</p>';
      els.cartTotalValue.textContent = '$0';
    });

    document.querySelectorAll('[data-info-key]').forEach((btn) => {
      btn.addEventListener('click', () => openInfoModal(btn.dataset.infoKey));
    });

    document.querySelectorAll('[data-jump-home]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeDrawers();
        openHomeRoute();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const drawerOpen = !els.menuDrawer.hidden || !els.cartDrawer.hidden || !els.infoModal.hidden;
        if (drawerOpen) {
          closeDrawers();
        } else if (!els.productView.hidden) {
          openHomeRoute();
        }
      }
    });

    window.addEventListener('hashchange', handleRoute);
  }

  function init() {
    buildHomeFrames();
    buildMenuProducts();
    buildGearDots();
    renderCart();
    bindUI();
    handleRoute();
  }

  init();
})();
