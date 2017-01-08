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
    console.log('Click');
    if ( !this.opened )
      this.show();
    else
      this.hide();
  }

  show() {
    console.log('Show');
    this.opened = true;
    this.menu.className += " transition visible";
  }

  hide() {
    console.log('Hide');
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

class UITableOfContent {
  constructor() {
    this.table  = document.getElementById('tableOfContent');
    this.header = document.getElementsByTagName('header')[ 0 ];

    // Tether for positioning
    this.tether = new Tether({
      element          : this.table,
      target           : this.header,
      attachment       : 'top right',
      targetAttachment : 'bottom right',
      constraints      : [ {
        to  : 'window',
        pin : [ 'top' ]
      } ]
    });
  }
}

window.onload = () => {
  const uiMenus = [];

  // NAVBAR MORE
  uiMenus.push(new UIMenu("nav-more", "nav-more-menu"));

  // HEADER STICKY MENU
  uiMenus.push(new UIMenu("header-sticky-more", "header-sticky-menu"));

  // ARTICLE SHARE /Only if article-share is in DOM
  if ( document.getElementById("article-share") ) {
    uiMenus.push(new UIMenu("article-share", "article-share-menu"));
  }

  // TABLE OF CONTENTS
  //if ( document.getElementById('tableOfContent') ) {
  //  new UITableOfContent();
  //}

  // FIX DATES TO fromNow()
  Array.from(document.getElementsByClassName('created')).forEach(( elem ) => {
    const date     = elem.getAttribute('date');
    console.log(date);
    elem.innerHTML = moment(date).fromNow();
  });

  // Whenever user clicks, we go through opened menus, and check if action was for menu,
  //  if not, then we try to hide/close any opened menus
  document.getElementsByTagName('body')[ 0 ].addEventListener("click", ( event ) => {

    const find = !!uiMenus.find(menu => {
      return menu.action == event.target || menu.action == event.target.parentElement;
    });

    if (!find) uiMenus.forEach(menu => menu.hide());
  });

};
