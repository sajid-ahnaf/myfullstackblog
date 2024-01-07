require('dotenv').config({ path: './w3s-dynamic-storage/.env' });
const { performance } = require('perf_hooks');
const dbFile = `./${process.env.SQLITE_DB}`;
const sqlite = require('better-sqlite3');
const path = require('path');

// Initialize the database
const db = new sqlite(path.resolve(dbFile), {fileMustExist: true});

const seedIntro = () => {
  const introData = {
    id: 1,
    title: `<p style="text-align:center;"><span style="font-size:30px;"><strong>My Blog</strong></span></p>`,
    content: `<figure class="image"><img src="/uploads/perm/template-profile-picture.png"></figure><p style="text-align:center;">&nbsp;</p><p style="text-align:center;">&nbsp;</p><p><span style="font-family:&quot;Open Sans&quot;, Arial, sans-serif;font-size:14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus ipsum ut lobortis porttitor. Aenean vel sem tincidunt, tincidunt orci vel, mattis elit. Morbi tristique mi tortor, eget sagittis tortor tempor et. In dignissim, nunc ac gravida pharetra, ex diam iaculis sem, vitae tempor arcu quam non libero. Proin ac velit nec ipsum vulputate elementum tincidunt ac arcu. Pellentesque nec est risus. Quisque egestas aliquet turpis et dignissim. Nullam ut tellus facilisis, commodo neque et, blandit lectus. Fusce vehicula sed augue id aliquam.</span></p>`
  }

  try {
    let insertIntro = db.prepare('REPLACE INTO about (id, title, content) VALUES (?, ?, ?)');
    insertIntro.run(introData.id, introData.title, introData.content);
  } catch (error) {
    console.log(error)
  }
}

const seedArticles = () => {

  const articlesData = {
        slug: 'article',
        title: '<p style="text-align:center;"><span style="font-size:30px;"><strong>Article</strong></span></p>',
        content: `<figure class="image image_resized" style="width:501px;"><img src="/uploads/perm/template-thumbnail.png"></figure><p>&nbsp;</p><p><span style="font-family:&quot;Open Sans&quot;, Arial, sans-serif;font-size:24px;"><strong>Lorem ipsum dolor sit amet,</strong></span><br><br><span style="font-family:&quot;Open Sans&quot;, Arial, sans-serif;font-size:14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus ipsum ut lobortis porttitor. Aenean vel sem tincidunt, tincidunt orci vel, mattis elit. Morbi tristique mi tortor, eget sagittis tortor tempor et. In dignissim, nunc ac gravida pharetra, ex diam iaculis sem, vitae tempor arcu quam non libero. Proin ac velit nec ipsum vulputate elementum tincidunt ac arcu. Pellentesque nec est risus. Quisque egestas aliquet turpis et dignissim. Nullam ut tellus facilisis, commodo neque et, blandit lectus. Fusce vehicula sed augue id aliquam.</span><br><br><span style="font-family:&quot;Open Sans&quot;, Arial, sans-serif;font-size:24px;"><strong>Lorem ipsum dolor sit amet,</strong></span></p><p>&nbsp;</p><p><span style="font-family:&quot;Open Sans&quot;, Arial, sans-serif;font-size:14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus ipsum ut lobortis porttitor. Aenean vel sem tincidunt, tincidunt orci vel, mattis elit. Morbi tristique mi tortor, eget sagittis tortor tempor et. In dignissim, nunc ac gravida pharetra, ex diam iaculis sem, vitae tempor arcu quam non libero. Proin ac velit nec ipsum vulputate elementum tincidunt ac arcu. Pellentesque nec est risus. Quisque egestas aliquet turpis et dignissim. Nullam ut tellus facilisis, commodo neque et, blandit lectus. Fusce vehicula sed augue id aliquam.</span></p>`,
        views: '50',
        comments: [
          {
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          }
        ]
  }


  let startTime = performance.now();
  console.log('Database seeding started')
  for (let index = 1; index <= 3; index++) {    
    try {
      let insertArticle = db.prepare('INSERT OR IGNORE INTO articles (id, slug, title, content, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
      insertArticle.run(index, articlesData.slug+'-'+index, articlesData.title, articlesData.content, articlesData.views);

      articlesData.comments.forEach(comment => {
        let stmt = db.prepare('INSERT OR IGNORE INTO comments (article_id, content, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
        stmt.run(index, comment.content);
      })
    } catch (error) {
      console.log(error)
  }
  }
  let endTime = performance.now()
  console.log('Database seeding finished in ' + (endTime - startTime) + ' ms');
};
seedIntro();
seedArticles();