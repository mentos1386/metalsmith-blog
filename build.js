// Node
const path = require('path'),
      yaml = require('js-yaml'),
      fs   = require('fs');

// Metalsmith
const Metalsmith = require('metalsmith');

// Files
const markdown = require('metalsmith-markdown-remarkable'),
      highlight = require('metalsmith-code-highlight'),
      layout = require('metalsmith-layouts');

// Functionality
const wordcount = require('metalsmith-word-count'),
      moment = require('metalsmith-moment'),
      headings = require('@xiphiaz/metalsmith-headings'),
      collections = require('metalsmith-collections'),
      collectionsMetadata = require('metalsmith-collection-metadata'),
      authors = require('metalsmith-author'),
      permalinks = require('metalsmith-permalinks'),
      more = require('metalsmith-more'),
      pagination = require('metalsmith-pagination'),
      updated = require('metalsmith-updated'),
      headingsLinks = require("metalsmith-headings-identifier");


const options = {
    headings: {
        selectors: [
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6'
        ]
    },
    headingsLinks: {
        linkTemplate: '<a href="#%s"></a>'
    },
    collections: {
        pages: 'pages/*.md',
        posts: {
            pattern: 'posts/*.md',
            sortBy: 'date',
            reverse: true
        }
    },
    collectionsMetadata: {
        'collections.pages': {
            type: 'page'
        },
        'collections.posts': {
            type: 'post'
        }
    },
    permalinks: {
        pattern: ':title',
        date: 'YYYY/MM',

        linksets: [{
            match: { collection: 'posts' },
            pattern: 'blog/:date/:title'
        },{
            match: { collection: 'pages' },
            pattern: ':title'
        }]
    },
    authors: {
        collection: 'posts',
        authors: yaml.safeLoad(fs.readFileSync('./authors.yml', 'utf8'))
    },
    moment: [
        'created',
        'updated'
    ],
    layout: {
        engine: 'pug',
        default: 'post.pug',
        directory: 'layouts'
    },
    pagination: {
        'collections.posts': {
            perPage: 5,
            layout: 'index.pug',
            first: 'index.html',
            path: 'page/:num/index.html',
            pageMetadata: {
                path: '' // '' == /index.html
            }
        }
    },
    markdown: {
        preset: 'full',
        options: {
            html: true
        }
    }
};

Metalsmith(__dirname)
    .metadata({
        config: yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'))
    })
    .source('./site')
    .destination('./build')
    .clean(false)

    .use(collections(options.collections))
    .use(collectionsMetadata(options.collectionsMetadata))
    .use(authors(options.authors))
    .use(more({
        ext: "md"
    }))
    .use(markdown(options.markdown.preset, options.markdown.options))
    .use(highlight())
    .use(wordcount())
    .use(headingsLinks(options.headingsLinks))
    .use(headings(options.headings))
    .use(updated())

    // Create realPath to use with "github history"
    .use(function (files, metalsmith, done) {
        Object.keys(files).forEach(function(file) {
            files[file].realPath = 'site/' + file.replace('.html', '.md')
        });
        done();
    })

    .use(pagination(options.pagination))
    .use(moment(options.moment))

    // We have to transform "created" to "date" that is only a string, and not an moment object.
    // used for permalinks
    .use(function (files, metalsmith, done) {
        Object.keys(files).forEach(function(file) {
            if (files[file].created) {
                files[file].date = files[file].created.toDate();
            }
        });
        done();
    })

    .use(permalinks(options.permalinks))
    .use(layout(options.layout))

    .build(function(err, files) {
        if (err) throw err;

        //console.log(files['blog/2016/10/learning-pixi/index.html'].headings);
        console.log("Success, site build completed!");
    });