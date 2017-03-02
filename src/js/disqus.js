const onLoad = onLoad || []; // jshint ignore:line

/**
 * UI Comments Class
 */
class UIComments {
  constructor( buttons, showButton, hideButton, comments ) {
    this.showButton = document.getElementById(showButton);
    this.hideButton = document.getElementById(hideButton);
    this.comments   = document.getElementById(comments);
    this.buttons    = document.getElementById(buttons);

    // Comments shown
    this.shown          = false;
    // Comments loaded
    this.loadedComments = false;

    // Initialize buttons (it's hidden as default)
    this.buttons.className += ' visible';

    // Add click event listener
    this.showButton.addEventListener("click", () => this.show());
    this.hideButton.addEventListener("click", () => this.hide());
  }

  show() {
    this.shown = true;
    this.comments.className += ' visible';

    // Hide showButton
    this.showButton.className = this.showButton.className.replace('visible', '');
    // Show hideButton
    this.hideButton.className += ' visible';

    if ( !this.loadedComments ) this.load();
  }

  hide() {
    if ( this.shown ) {
      this.shown              = false;
      this.comments.className = this.comments.className.replace('visible', '');

      // Show showButton
      this.showButton.className += ' visible';
      // Hide hideButton
      this.hideButton.className = this.hideButton.className.replace('visible', '');
    }
  }

  load() {
    this.loadedComments = true;
    const d             = document, s = d.createElement('script');
    s.src               = 'https://blog-tjo-space.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  }

}

// Run when page is loaded
onLoad.push(() => {
  const pageComments = new UIComments('buttons-comments', 'show-comments', 'hide-comments', 'disqus_thread');
});
