const onLoad = onLoad || []; // jshint ignore:line

/**
 * UI Menu Class
 */
class UIMenu {
  constructor( action, menu ) {
    this.action = document.getElementById(action);
    this.menu   = document.getElementById(menu);

    // Menu opened status
    this.opened = false;

    // Tether for positioning
    this.tether = new Tether({
      element          : this.menu,
      target           : this.action,
      attachment       : 'top right',
      targetAttachment : 'bottom right'
    });

    // Add click event listener
    this.action.addEventListener("click", () => this.onClick());
    this.menu.addEventListener("transitionend", () => this.onTransitionEnd(), false);
  }

  onClick() {
    if ( !this.opened )
      this.show();
    else
      this.hide();
  }

  show() {
    this.opened = true;
    this.menu.className += " transition visible";
  }

  hide() {
    if ( this.opened ) {
      this.opened         = false;
      this.menu.className += " transition";
      this.menu.className = this.menu.className.replace('visible', '');
    }
  }

  onTransitionEnd() {
    console.log('Transition End');
    this.menu.className = this.menu.className.replace('transition', '');
  }
}

// Run when page is loaded
onLoad.push(() => {

  const uiMenus = [];

  // NAVBAR MORE
  uiMenus.push(new UIMenu("nav-more", "nav-more-menu"));

  // HEADER STICKY MENU
  uiMenus.push(new UIMenu("header-sticky-more", "header-sticky-menu"));

  // ARTICLE SHARE /Only if article-share is in DOM
  if ( document.getElementById("article-share") ) {
    uiMenus.push(new UIMenu("article-share", "article-share-menu"));
  }

  // FIX DATES TO fromNow()
  Array.from(document.getElementsByClassName('created')).forEach(( elem ) => {
    const date     = elem.getAttribute('date');
    elem.innerHTML = moment(date).fromNow();
  });

  // Whenever user clicks, we go through opened menus, and check if action was for menu,
  //  if not, then we try to hide/close any opened menus
  document.getElementsByTagName('body')[ 0 ].addEventListener("click", ( event ) => {

    const find = !!uiMenus.find(menu => {
      return menu.action === event.target || menu.action === event.target.parentElement;
    });

    if ( !find ) uiMenus.forEach(menu => menu.hide());
  });
});
