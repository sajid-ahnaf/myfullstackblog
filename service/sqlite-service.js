require('dotenv').config({ path: './w3s-dynamic-storage/.env' });
const dbFile = `./${process.env.SQLITE_DB}`;
const sqlite = require('better-sqlite3');
const path = require('path');
const argon2 = require('argon2');

// Initialize the database
const db = new sqlite(path.resolve(dbFile), {fileMustExist: false});

const createTablesIfNotExist = () => {

  const aboutTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS about (
      id integer PRIMARY KEY AUTOINCREMENT,
      title text,
      content text
    );`
  );

  const articlesTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS articles (
      id integer PRIMARY KEY AUTOINCREMENT,
      slug text NOT NULL UNIQUE,
      title text,
      content text,
      views integer,
      created_at datetime,
      updated_at datetime
    );`
  );
    
  const commentsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
      id integer PRIMARY KEY AUTOINCREMENT,
      article_id integer NOT NULL,
      content text,
      created_at datetime
    );`
  );

  const usersTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id integer PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at datetime,
      updated_at datetime
    );`
  );

  aboutTable.run();
  articlesTable.run();
  commentsTable.run();
  usersTable.run()
};

const addEmptyAboutRow = () => {
  const aboutEmptyRow = db.prepare(`
      INSERT OR IGNORE INTO about (id, title, content)
      VALUES (1, '','')
  `)
  aboutEmptyRow.run();
}

createTablesIfNotExist();
addEmptyAboutRow();

const getAbout = () => {
  try {
    const stmt = db.prepare('SELECT * FROM about WHERE id = 1');
    const intro = stmt.get();
    return {
      success: true,
      data: intro
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error
    }
  }
}

const updateAbout = body => {
  try {
    const stmt = db.prepare('UPDATE about SET title=?, content=? WHERE id=1');
    stmt.run(body.title, body.content);
    return {
      success: true,
      msg: 'Intro updated!',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      msg: 'Could not update intro',
    };
  }
};

const generateSlug = (slug) => {
  const jsonResponse = {
    success: false,
    slug: slug
  }
  const uniqueSlugCheck = db.prepare("SELECT 1 FROM articles WHERE slug = ?");
  const slugExists = uniqueSlugCheck.get(slug);
  if(!slugExists) {
    jsonResponse.success = true;
    jsonResponse.slug = slug
  } else {
    let numberX = 1
    while (true) {
      const slugCheck = uniqueSlugCheck.get(`${slug}-${numberX}`)
      if(!slugCheck) {
        jsonResponse.success = true
        jsonResponse.slug = `${slug}-${numberX}`
        break
      } else {
        numberX += 1
        continue
      }
    }
  }
  return jsonResponse;
}

const updateArticleSlug = (oldSlug, newSlug) => {
  const jsonResponse = {
    success: false,
    slug: oldSlug
  }
  const uniqueSlugCheck = db.prepare("SELECT 1 FROM articles WHERE slug = ?");
  const slugExists = uniqueSlugCheck.get(newSlug);

  if(!slugExists) {
    jsonResponse.success = true;
    jsonResponse.slug = newSlug
  } else {
    if(newSlug === oldSlug) {
      jsonResponse.success = true;
      jsonResponse.slug = oldSlug;
    } else {
      let numberX = 1
      while (true) {
        const slugCheck = uniqueSlugCheck.get(`${oldSlug}-${numberX}`)
        if(!slugCheck) {
          jsonResponse.success = true
          jsonResponse.slug = `${oldSlug}-${numberX}`
          break
        } else {
          numberX += 1
          continue
        }
      }
    }
  }

  return jsonResponse;
}

const addArticle = (body) => {
  const jsonResponse = {
    success: false,
  }
  try {
    const insertArticle = db.prepare('INSERT INTO articles (slug, title, content, views, created_at, updated_at) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
    const result = insertArticle.run(body.slug, body.title, body.content)
    jsonResponse.newSlug = body.slug;
    jsonResponse.success = true
    jsonResponse.msg = "Article successfully published!"
    jsonResponse.lastArticleInsertedId = result.lastInsertRowid;
    return jsonResponse;
  } catch (error) {
    console.log(error)
    jsonResponse.error = error
    jsonResponse.msg = 'Failed publishing article.'
    return jsonResponse
  }
};

const editArticle = (body) => {
  const jsonResponse = {
    success: false,
  }
  try {
    const stmt = db.prepare('UPDATE articles SET slug=?, title=?, content=?, updated_at=CURRENT_TIMESTAMP WHERE slug=?');
    const result = stmt.run(body.newSlug, body.title, body.content, body.oldSlug)
    jsonResponse.slug = body.newSlug;
    jsonResponse.success = true
    jsonResponse.msg = "Article successfully updated!"
    jsonResponse.lastArticleInsertedId = result.lastInsertRowid;
    return jsonResponse;
  } catch (error) {
    console.log(error);
    jsonResponse.error = error,
    jsonResponse.msg = 'Failed to update.'
  } finally {
    return jsonResponse
  }
}

const getArticle = (slug) => {
  const stmt = db.prepare('SELECT * FROM articles WHERE slug = ?');
  const article = stmt.get(slug);
  if(!article) {
    return undefined;
  }
  const comments = getComments(article.id)
  article.comments = comments
  article.totalComments = comments.length
  return article;
}

const getArticles = () => {
  const stmt = db.prepare('SELECT * FROM articles ORDER BY created_at DESC');
  const articles = stmt.all();
  for (const article of articles) {
    article.totalComments = getComments(article.id).length
  }
  return articles;
}

const deleteArticles = (articleIdList) => {
  const res = {
    success: false
  }
  const deletedArticleSlugs = [];
  try {
    articleIdList.map(articleId => {
      const getArticleSlugStatement = db.prepare('SELECT slug FROM articles WHERE id=?');
      const getArticleSlugResult = getArticleSlugStatement.get(articleId);
      deletedArticleSlugs.push(getArticleSlugResult.slug);
      const stmt = db.prepare('DELETE FROM articles WHERE id=?');
      stmt.run(articleId);
      deleteComments('articles', articleId);
    })

    res.success = true,
    res.error = '',
    res.msg = "Article(s) successfully deleted!",
    res.slugs = deletedArticleSlugs

  } catch (error) {
    res.success = false,
      res.error = error,
      res.msg = "Could not delete article(s)"    
  }

  return res;
}

const getComments = (articleId) => {
  const stmt = db.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC');
  const comments = stmt.all(articleId);
  return comments
}

const addComment = (body) => {
  try {
    const stmt = db.prepare('INSERT INTO comments (article_id, content, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    stmt.run(body.articleId, body.content);
    return {
      success: true,
      msg: "Comment successfully added!"
    }    
  } catch (error) {
    console.log(error)
    return {
      success: false,
      msg: error
    }
  }
}

const deleteComments = (commentsOrArticles, id) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  switch (commentsOrArticles) {
    case 'comments':
      //id will be a list
      try {
        id.forEach(id => {
          const stmt = db.prepare('DELETE FROM comments WHERE id=?')
          stmt.run(id)
        })
        jsonResponse.success = true
        jsonResponse.error = ''
        jsonResponse.msg = "Comment(s) successfully deleted!"
        } catch (error) {
        jsonResponse.error = error
        jsonResponse.msg = "Could not delete comment(s)"

      }
      break;
    case 'articles':
      //id will be an integer
      try {
        const stmt = db.prepare('DELETE FROM article_images WHERE article_id IN (?)')
        stmt.run(id)
        jsonResponse.success = true
        jsonResponse.error = ''
        jsonResponse.msg = "Comment(s) successfully deleted!"
    
      } catch (error) {
          jsonResponse.error = error
          jsonResponse.msg = "Could not delete comment(s)"
      }
      break
    default:
      break;
  }
  return jsonResponse
}

const viewCounter = (articleId) => {
  const checkViewCount = db.prepare('SELECT views FROM articles WHERE id=?')
  const addViewCount = db.prepare('UPDATE articles SET views=?  WHERE id=?')
  const viewCount = checkViewCount.get(articleId).views
  addViewCount.run(viewCount+1, articleId)
  return {
    views: viewCount + 1
  }
}

const createUser = (username, password) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  const query = db.prepare(`INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
  try {
    query.run(username, password);
    jsonResponse.success = true;
    jsonResponse.error = undefined;
    jsonResponse.msg = "User created successfully!";
  } catch (error) {
    jsonResponse.success = false,
    jsonResponse.error = error;
    jsonResponse.msg = "Could not create user: " + username;
  }
  return jsonResponse;
}

const getUserByUsername = (username) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  const query = db.prepare(`SELECT * FROM users WHERE username = ?`);
  try {
    const result = query.get(username);
    return result;
  } catch (error) {
    jsonResponse.error = error;
    jsonResponse.msg = "Could not find user: " + username;
  }
  return jsonResponse;
}

const getUserByUsernameAndPassword = async (username, password, isPasswordHashed) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  try {
    const user = getUserByUsername(username);
    if (user) {
      if (isPasswordHashed && user.password === password) {
        jsonResponse.success = true;
        jsonResponse.data = user;
      } else {
        try {
          const verified = await argon2.verify(user.password, password);
          if (verified) {
            jsonResponse.success = true;
            jsonResponse.data = user;
          }        
        } catch (error) {
          console.log(error)
        }
      }
    }
  } catch (error) {
    jsonResponse.error = error;
    jsonResponse.msg = "Could not find user: " + username;
  }
  return jsonResponse;
}

const changeUserPassword = (username, password) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  console.log(password)
  try {
    const changePasswordQuery = db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?');
    changePasswordQuery.run(password, username);
    jsonResponse.success = true;
    jsonResponse.error = '';
    jsonResponse.msg = "User password changed successfully!";    
  } catch (error) {
    jsonResponse.error = error;
    jsonResponse.msg = "Could not change the password for the user: " + username;
  }
  return jsonResponse;
}

const deleteUser = (username) => {
  const jsonResponse = {
    success: false,
    error: 'unknown error'
  }
  try {
    const query = db.prepare(`DELETE FROM users WHERE username = ?`);
    query.run(username);
    jsonResponse.success = true;
    jsonResponse.error = '';
    jsonResponse.msg = "User deleted successfully!";
  } catch (error) {
    jsonResponse.error = error;
    jsonResponse.msg = "Could not delete user: " + username;
  }
  return jsonResponse;
}

module.exports = {
  // Export functions for API 
  getAbout,
  updateAbout,
  createTablesIfNotExist,
  addArticle,
  editArticle,
  getArticle,
  getArticles,
  deleteArticles,
  addComment,
  deleteComments,
  viewCounter,
  generateSlug,
  updateArticleSlug,
  createUser,
  getUserByUsername,
  getUserByUsernameAndPassword,
  changeUserPassword,
  deleteUser
};
