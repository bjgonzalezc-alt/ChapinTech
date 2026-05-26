document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.support-menu-btn');
  const navLinks = document.querySelector('.support-shell .nav-links');

  if (!menuButton || !navLinks) {
    return;
  }

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
});
