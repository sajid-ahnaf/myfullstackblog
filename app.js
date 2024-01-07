require('dotenv').config({ path: './w3s-dynamic-storage/.env' });
const express = require('express');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const handlebars = require('express-handlebars');
const fileUpload = require('express-fileupload');
const { convert } = require('html-to-text');
const { JSDOM } = require('jsdom');
const http = require('http');
const { WebSocketServer } = require('ws');

const { generateAccessToken, ifAdminIsAuthenticated } = require('./utilities/auth-utilities');
const { addHours } = require('./utilities/date-utilities');
const { storePermImages, clearTempImages, deleteAllArticleImages, imageSourceFixer } = require('./utilities/file-utilities');
const {
  getArticle,
  getArticles,
  deleteArticles,
  addComment,
  deleteComments,
  addArticle,
  editArticle,
  viewCounter,
  updateAbout,
  getAbout,
  generateSlug,
  updateArticleSlug } = require('./service/sqlite-service');

const axios = require('axios');
const app = express();
const port = 3000;
const cookieName = 'accessToken';
const uploadsPath = `${__dirname}/w3s-dynamic-storage/uploads`;
const tempPath = `${uploadsPath}/temp`;

app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  helpers: {
    dateFormat: require('handlebars-dateformat')
  },
  extname: 'hbs',
  defaultLayout: 'index',
  partialsDir: __dirname + '/views/partials/',
  runtimeOptions: {
    data: {
      NODE_ENV: process.env.NODE_ENV,
    }
  },
}));

app.use(fileUpload({
  limits: {
    fileSize: 100000000,
  },
  abortOnLimit: true,
}));
app.use(express.static('public'));
app.use('/uploads', express.static('w3s-dynamic-storage/uploads'));
app.use('/perm', express.static('w3s-dynamic-storage/uploads/perm'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Default route
app.get('/', async (req, res) => {
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  const articles = getArticles();
  const about = getAbout();

  for (const article of articles) {
    const simDom = new JSDOM(article.content)
    const img = simDom.window.document.querySelector("img")

    if (img) {
      article.imgSource = img.getAttribute('src')
    }
    const titleText = convert(article.title, {
      wordwrap: 130,
      selectors: [
        { selector: 'img', format: 'skip' }
      ]
    })
    article.title = titleText
    article.content = convert(article.content, {
      wordwrap: 130,
      selectors: [
        { selector: 'img', format: 'skip' }
      ]
    })
    article.content = article.content.trim()
  }
  res.render('home', { articles, isAdmin, about: about.data });
});

app.get('/edit-about', async (req, res) => {

  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');

  const content = getAbout();
  res.render('text-editor', {
    type: 'edit-about',
    title: 'Edit About',
    article: content.data,
  });
});

app.put('/edit-about', async (req, res) => {
  const request = {
    type: 'about'
  }
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');
  req.body.title = imageSourceFixer(req.body.title, '', 'about');
  req.body.content = imageSourceFixer(req.body.content, '', 'about');
  storePermImages(uploadsPath, '', '', req.body.title + req.body.content, 'about');
  clearTempImages(tempPath);
  const response = updateAbout(req.body);
  res.json(response);
});

/**Auth routes */
app.get(`/${process.env.LOGIN_ROUTE_PATH}`, async (req, res) => {

  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (isAdmin || req.cookies[cookieName]) {
    return res.redirect('/');
  }
  res.render('signin', {RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY});
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { data } = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body['g-recaptcha-response']}`);
    if (!data['success']) throw new Error('Recaptcha siteverify failed.');
    const token = await generateAccessToken(req.body);
    if (token.error) return res.json(token);
    const cookie = res.cookie(cookieName, token, {
      maxAge: addHours(12), // Access Token Expiration time is 12 hours
      sameSite: 'none',
      secure: true,
    });
    if (!cookie) throw new Error('Unable to set cookie.');
    return res.json({ success: true});
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: error.message });
  }
});

app.post('/api/auth/signout', (req, res) => {
  loggedIn = false;
  if (req.cookies[cookieName]) {
    res.clearCookie(cookieName);
  }
  return res.redirect('/');
});

/** Article routes */

app.get('/new-article', async (req, res) => {

  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');

  res.render('text-editor', {
    type: 'new-article',
    title: 'New Article'
  });
});

app.post('/new-article', async (req, res) => {
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');

  const jsonResponse = {
    success: false,
    error: 'Uknown error',
    status: 500
  }

  try {
    const slug = generateSlug(req.body.slug);

    req.body.slug = slug.slug;
    req.body.title = imageSourceFixer(req.body.title, slug.slug)
    req.body.content = imageSourceFixer(req.body.content, slug.slug)

    const res = addArticle(req.body);
    jsonResponse.success = res.success;
    jsonResponse.error = '';
    jsonResponse.status = 200;
    jsonResponse.msg = res.msg;
    if (res.newSlug) {
      jsonResponse.newSlug = res.newSlug;
      storePermImages(uploadsPath, jsonResponse.newSlug, jsonResponse.newSlug, req.body.title + req.body.content);
      clearTempImages(tempPath);
    }
  } catch (error) {
    console.error(error);
    jsonResponse.error = error;
  } finally {
    res.json(jsonResponse);
  }
});

app.get('/article/:slug', async (req, res) => {
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  const article = getArticle(req.params.slug);
  if (!article) return res.status(404).send('Page does not exist');
  const about = getAbout()
  try {
    const newViewCount = viewCounter(article.id);
    article.views = newViewCount.views;
  } catch (error) {
    console.log(error);
  } finally {
    res.render('article', { article, isAdmin, about: about.data, RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY });
  }
});

app.get('/article/:slug/edit', async (req, res) => {
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');
  const article = getArticle(req.params.slug);
  if (!article) return res.status(404).send('Page does not exist');
  res.render('text-editor', {
    type: 'edit-article',
    title: 'Edit Article',
    article: article,
  });
});

app.put('/article/:slug/edit', async (req, res) => {
  const isAdmin = await ifAdminIsAuthenticated(req.cookies[cookieName], cookieName, res);
  if (!isAdmin) return res.redirect('/');

  const slug = updateArticleSlug(req.body.oldSlug, req.body.newSlug);
  req.body.newSlug = slug.slug;
  req.body.title = imageSourceFixer(req.body.title, slug.slug, '', req.body.oldSlug)
  req.body.content = imageSourceFixer(req.body.content, slug.slug, '', req.body.oldSlug)

  const jsonResponse = {
    success: false,
    error: 'Uknown error',
    status: 500,
  };
  try {
    const res = editArticle(req.body);
    if (res.success) {
      jsonResponse.success = res.success;
      jsonResponse.error = '';
      jsonResponse.status = 200;
      jsonResponse.msg = res.msg;
      if (res.slug) {
        jsonResponse.slug = res.slug;
        storePermImages(uploadsPath, req.body.oldSlug, req.body.newSlug, req.body.title + req.body.content);
        clearTempImages(tempPath);
      }
    }
  } catch (error) {
    console.error(error);
    jsonResponse.error = error;
  } finally {
    return res.json(jsonResponse);
  }
});

app.post('/post-comment', async (req, res) => {
  const jsonResponse = {
    success: false,
    error: 'Uknown error',
    status: 500,
  };
  const recaptchaResponse = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body['g-recaptcha-response']}`
  );
  if (!recaptchaResponse.data['success']) {
    jsonResponse.status = 401;
    jsonResponse.error = 'reCAPTCHA failed';
    return res.json(jsonResponse);
  }
  try {
    const res = addComment(req.body);
    jsonResponse.success = res.success;
    jsonResponse.error = '';
    jsonResponse.status = 200;
    jsonResponse.msg = res.msg;
  } catch (error) {
    console.error(error);
    jsonResponse.error = error;
  } finally {
    return res.json(jsonResponse);
  }
});

app.post('/upload-image', (req, res) => {
  const { upload: image } = req.files;
  if (!image) return res.sendStatus(400);
  if (!/^image/.test(image.mimetype)) return res.sendStatus(400);
  const backendPath = __dirname + '/w3s-dynamic-storage/uploads/temp';
  if (!fs.existsSync(backendPath)) fs.mkdirSync(backendPath);
  image.mv(backendPath + '/' + image.name);
  return res.json({ url: '/uploads/temp/' + image.name });
});

app.delete('/', (req, res) => {
  const jsonResponse = {
    success: false,
    error: 'Unknown error',
    status: 500
  }
  try {
    if (req.body.commentOrArticle === 'article') {
      const res = deleteArticles(req.body.idList);
      if (res.success) deleteAllArticleImages(uploadsPath, res.slugs)
      jsonResponse.success = res.success;
      jsonResponse.error = '';
      jsonResponse.status = 200
      jsonResponse.msg = res.msg
    } else if (req.body.commentOrArticle === 'comment') {
      const res = deleteComments('comments', req.body.idList)
      jsonResponse.success = res.success;
      jsonResponse.error = '';
      jsonResponse.status = 200
      jsonResponse.msg = res.msg
    }
  } catch (error) {
    console.log(error)
    jsonResponse.error = error
  } finally {
    return res.json(jsonResponse)
  }
})

// If a URL route doesn't exist sends 404 with text
app.get('*', function (req, res) {
  res.status(404).send('Page does not exist');
});

const server = http.createServer(app);

//Development
if (process.env.NODE_ENV === 'development') {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    ws.send('connected');
    const interval = setInterval(() => {
      ws.ping();
    }, 30000);
  });
}

server.listen(port, async () => {
  console.log('Running server on port: ' + port)
});