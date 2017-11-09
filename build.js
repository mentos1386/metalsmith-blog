// Node
const path     = require('path'),
      yaml     = require('js-yaml'),
      fs       = require('fs'),
      _        = require('lodash'),
      momentJs = require('moment');

// Metalsmith
const Metalsmith = require('metalsmith');

// Files
const markdown        = require('metalsmith-markdown-remarkable'),
      metalsmithPrism = require('metalsmith-prism'),
      layout          = require('metalsmith-layouts');

// Functionality
const wordcount           = require('metalsmith-word-count'),
      moment              = require('metalsmith-moment'),
      headings            = require('@xiphiaz/metalsmith-headings'),
      collections         = require('metalsmith-collections'),
      collectionsMetadata = require('metalsmith-collection-metadata'),
      authors             = require('metalsmith-author'),
      permalinks          = require('metalsmith-permalinks'),
      more                = require('metalsmith-more'),
      pagination          = require('metalsmith-pagination'),
      updated             = require('metalsmith-updated'),
      headingsLinks       = require("metalsmith-headings-identifier"),
      tags                = require('metalsmith-tags'),
      feed                = require('metalsmith-feed');

// Custom Markdown
const { replaceEntities, escapeHtml } = require('remarkable/lib/common/utils');

const customImage = imageRule => ( tokens, i, opt, env ) => {
  const img = imageRule(tokens, i, opt, env);
  return '<figure>' + img + '<figcaption>'
    + (tokens[ i ].title ? escapeHtml(replaceEntities(tokens[ i ].title)) : '')
    + '</figcaption></figure>'
};

const options = {
  headings            : {
    selectors : [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ]
  },
  headingsLinks       : {
    linkTemplate : '<a href="#%s"></a>'
  },
  collections         : {
    pages    : 'pages/*.md',
    projects : 'projects/*.md',
    posts    : {
      pattern : 'posts/*.md',
      sortBy  : 'created',
      reverse : true // Sort by desc/asc (false is older first)
    }
  },
  collectionsMetadata : {
    'collections.pages'    : {
      type : 'page'
    },
    'collections.posts'    : {
      type : 'post'
    },
    'collections.projects' : {
      type : 'project'
    }
  },
  permalinks          : {
    pattern : ':title',
    date    : 'YYYY/MM',

    linksets : [ {
      match   : { collection : 'posts' },
      pattern : 'blog/:date/:title'
    }, {
      match   : { collection : 'pages' },
      pattern : ':title'
    }, {
      match   : { collection : 'projects' },
      pattern : 'projects/:title'
    } ]
  },
  authors             : yaml.safeLoad(fs.readFileSync('./authors.yml', 'utf8')),
  moment              : [
    'created',
    'updated'
  ],
  layout              : {
    engine    : 'pug',
    default   : 'post.pug',
    directory : 'layouts'
  },
  pagination          : {
    'collections.posts'    : {
      perPage      : 5,
      layout       : 'index.pug',
      first        : 'index.html',
      path         : 'page/:num/index.html',
      pageMetadata : {
        path : '' // '' == /index.html
      }
    },
    'collections.projects' : {
      perPage      : 5,
      layout       : 'index.pug',
      first        : 'projects/index.html',
      path         : 'projects/page/:num/index.html',
      pageMetadata : {
        path : '' // '' == /index.html
      }
    }
  },
  markdown            : {
    preset     : 'full',
    options    : {
      html : true
    },
    langPrefix : 'language-'
  },
  feed                : {
    collection : 'posts'
  },
  tag                 : {
    handle  : 'tags',
    path    : 'tags/:tag.html',
    layout  : 'index.pug',
    sortBy  : 'date',
    reverse : true,
  }
};

const yamlConfig = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

Metalsmith(__dirname)
.metadata({
  config : yamlConfig,
  site   : {
    title  : yamlConfig.title,
    url    : yamlConfig.domain,
    author : yamlConfig.author,
  }
})
.source('./site')
.destination('./build')
.clean(false)

.use(tags(options.tag))

.use(updated())

.use(collections(options.collections))
.use(collectionsMetadata(options.collectionsMetadata))
.use(authors({ collection : 'pages', authors : options.authors }))
.use(authors({ collection : 'posts', authors : options.authors }))
.use(markdown(options.markdown.preset, options.markdown.options)
  .use(md => {
    md.renderer.rules.image = customImage(md.renderer.rules.image);
  })
)
.use(more({
  ext : "html"
}))
.use(( files, metalsmith, done ) => {
  const matchP = /<p>(.*?)<\/p>/;
  _.map(files, file => {
    if ( file.less ) {
      file.description = file.less.toString('utf8').match(matchP);
      if ( file.description ) {
        file.description = file.description[ 0 ]
        .replace('<p>', '')
        .replace('</p>', '');
      }
    }
  });
  done()
})
.use(metalsmithPrism())
.use(wordcount())
.use(headingsLinks(options.headingsLinks))
.use(headings(options.headings))

.use(( files, metalsmith, done ) => {
  _.each(files, file => {
    const headings = [];
    _.each(file.headings, heading => {
      if ( heading.tag === 'h1' || headings.length < 1 ) headings.push({
        title : heading,
        array : []
      });
      else headings[ headings.length - 1 ].array.push(heading)
    });
    file.headings = headings;
  });
  done()
})


// Create realPath to use with "github history"
.use(( files, metalsmith, done ) => {
  Object.keys(files).forEach(function ( file ) {
    files[ file ].realPath = 'site/' + file.replace('.html', '.md')
  });
  done();
})

.use(pagination(options.pagination))
.use(moment(options.moment))

// We have to transform "created" to "date" that is only a string, and not an moment object.
// used for permalinks
.use(( files, metalsmith, done ) => {
  Object.keys(files).forEach(file => {
    if ( files[ file ].created ) {
      files[ file ].date = files[ file ].created.toDate();
    }
  });
  done();
})

.use(permalinks(options.permalinks))

// Set some special config properties
.use(( files, metalsmith, done ) => {
  // Set date that is used as "site was generated"
  metalsmith._metadata.config.date = momentJs().format('LL');

  // If we have env set with specific BLOG_DOMAIN, then we use env as DOMAIN (used for tor hidden services)
  if ( process.env.BLOG_DOMAIN ) metalsmith._metadata.config.domain = process.env.BLOG_DOMAIN;

  done();
})

.use(layout(options.layout))
.use(feed(options.feed))

.build(( err, files ) => {
  if ( err ) throw err;

  console.log("Success, site build completed!");
});