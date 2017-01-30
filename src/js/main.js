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

class UITableOfContent {
  constructor() {
    this.table  = document.getElementById('tableOfContent');
    this.header = document.getElementsByTagName('header')[ 0 ];
    this.headerStick = document.getElementsByClassName('header-sticky')[0];

    // Tether for positioning
    this.tether = new Tether({
      element          : this.table,
      target           : this.header,
      attachment       : 'top right',
      targetAttachment : 'bottom right',
      targetOffset     : '0px -16px',
      constraints      : [ {
        to  : this.headerStick,
        pin : [ 'top' ],
      } ]
    });

    this.headings = document.getElementsByClassName('heading');
    this.opened    = [];

    Array.from(this.headings).forEach(heading => {
      const button    = heading.getElementsByClassName('mdi-button')[ 0 ];
      const subHeader = heading.getElementsByClassName('subHeaders')[ 0 ];
      if ( button && subHeader ) {
        button.addEventListener('click', () => this.onClick(button, subHeader));
        subHeader.addEventListener('transitionend', () => this.onTransitionEnd(subHeader));
        subHeader.className += ' closed';
      }
    });
  }

  onClick( button, subHeader ) {
    const opened = this.opened.indexOf(subHeader) !== -1;

    if ( opened ) this.hide(button, subHeader);
    else this.show(button, subHeader);
  }

  hide(button, subHeader) {
    this.opened.splice(this.opened.indexOf(subHeader), 1);
    subHeader.className += ' transition closed';
    subHeader.className = subHeader.className.replace(/opened/g, '');

    button.className = button.className.replace(/opened/g, '');
  }

  show(button, subHeader) {
    this.opened.push(subHeader);
    subHeader.className += ' transition opened';
    subHeader.className = subHeader.className.replace(/closed/g, '');

    button.className += ' opened';
  }

  onTransitionEnd(subHeader) {
    console.log('Transition End', subHeader);
    subHeader.className = subHeader.className.replace(/transition/g, '');
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
  if ( document.getElementById('tableOfContent') ) {
    new UITableOfContent();
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
      return menu.action == event.target || menu.action == event.target.parentElement;
    });

    if ( !find ) uiMenus.forEach(menu => menu.hide());
  });

};
