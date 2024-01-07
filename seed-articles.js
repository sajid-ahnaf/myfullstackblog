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
    title: `<p style="text-align:center;"><span style="font-size:30px;">Akians Coders</span></p>`,
    content: `<figure class="image"><img src="/img/jenny_image.png"></figure><p>&nbsp;</p><p style="text-align:center;">sajidhasan2023@gmail.com</p><p style="text-align:center;">&nbsp;</p><p style="text-align:center;">Welcome to AkC's blog, jay :D :D !! I share recipies, life hacks and parenting tips to my readers. My blog is about my life and the things I experience , hence I love exchanging ideas and gain new perspectives from my audience. Come join me on my journey so that I can particiapte in yours! Life is all about the journey, so let’s talk ;)&nbsp;</p>`
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
    articles: [
      {
        id: 1,
        slug: 'water-splash',
        title: '<p style="text-align:center;"><span style="font-family:Tahoma, Geneva, sans-serif;font-size:48px;">Water Splash</span></p>',
        content: `<p style='text-align:center;'><img src='/perm/water-splash.png'></p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:30px;'><strong>We took a trip downtown a nice autumn evening! ...</strong></span></p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:18px;'>We took a trip downtown on a beautiful autumn evening and it was an unforgettable experience. The crisp air, the rustling leaves, and the warm glow of the street lights created a serene atmosphere. We strolled down the bustling streets, taking in the sights and sounds of the city. We stopped by a local cafe for a warm drink and continued on to admire the vibrant foliage in the nearby park. As the night sky painted the sky with stars, we walked back to our starting point, filled with a sense of peace and contentment from our simple yet lovely evening out.</span></p><p><br>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:30px;'><strong>If you didn't have baby clouds,</strong></span></p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:18px;'>If there were no baby clouds, our world would look and feel vastly different. Baby clouds, also known as cumulus clouds, bring us much needed rain, cooling relief on hot summer days, and offer a beautiful and ever-changing canvas in the sky. Without them, our landscape would lack the dramatic and picturesque qualities that clouds provide. Furthermore, the absence of baby clouds would also affect our weather patterns, potentially leading to droughts and other environmental issues. Overall, baby clouds play a vital role in our planet's ecology and their presence is essential for a healthy and balanced earth.</span></p>`,
        views: '15',
        comments: [
          {
            article_id: 1,
            content: `Great Article, Thank you!`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            article_id: 1,
            content: `Love the image! Look forward to your next article`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          }
        ]
      },
      {
        id: 2,
        slug: 'ready-for-king-winther',
        title: '<p style="text-align:center;"><span style="font-family:Tahoma, Geneva, sans-serif;font-size:48px;">Ready for King Winther</span></p>',
        content: `<p style='text-align:center;'><img src='/perm/ready-for-king-winther.png'></p><p style='font-family:Tahoma, sans-serif;font-size:18px'>Whether you believe in the science behind the approaching harsh winter season or prefer to avoid the cold throughout the fall months, we're thinking you'd still like to be prepared head-to-toe well in advance. When you wake up the following morning to another 'record low' or 'record snowfall,' you'll be glad you're prepared with adequate insulation, snow gear, warm socks—and your favorite canned soup.</p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:30px;'><strong>Prepare an emergency plan</strong></span></p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:18px'>First and foremost, experts urge that everyone create an emergency plan, regardless of where they reside. Consider the possibility that you will not be together when the storm comes. According to the Department of Homeland Security, your plan should include where you should evacuate in the event of an emergency, where you will seek shelter if you are unable to return home, and how you will communicate with your family.</span><br>&nbsp;</p><p><span style='font-family:Gza, Tahoma, sans-serif;font-size:30px;'><strong>Pack a 'go' bag</strong></span></p><p><br><span style='font-family:Tahoma, sans-serif;font-size:18px'>A 'go' bag contains everything you'd need to leave the house in an emergency, including copies of all important documents, an extra set of keys, cash, bottled water, nonperishable food, medications, a first aid kit, a flashlight, and toiletries.</span></p>`,
        views: '128',
        comments: [
          {
            article_id: 2,
            content: `Good luck!`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            article_id: 2,
            content: `I also try to stay prepared for an extreme winter.`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            article_id: 2,
            content: `Great tips! thanks you!`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
        ]
      },
      {
        id: 3,
        slug: 'homemade-pizza',
        title: '<p style="text-align:center;"><span style="font-family:Tahoma, Geneva, sans-serif;font-size:48px;">Homemade Pizza!</span></p>',
        content: `<figure class='image' style='text-align:center;'><img src='/perm/homemade-pizza.png'></figure><p style='font-family:Tahoma, sans-serif;font-size:18px'>This cheese pizza tastes just like a traditional pie, but immensely better. It's complex enough for adults but appealing to children of all ages. We've tested this cheese pizza on several kids in our life, and they all adore it. Here's what makes this cheese pizza superior to standard delivery pizza</p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:30px;'><strong>Pizza making tools</strong></span></p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'>To make a great cheese pizza, it's helpful to have a few pizza making tools handy! These two tools have been indispensable in our homemade pizza making game. Here's what Alex and I recommend:</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Pizza stone:</strong> A pizza stone is what makes Italian pizza crust crispy on the outside and soft on the inside. Here's the <u>best pizza stone</u>&nbsp;we've found, and a bit more on&nbsp;<u>pizza stone care</u>.</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Pizza peel:&nbsp;</strong>What's a pizza peel? It's a paddle used to slide the pizza onto the hot pizza stone in the oven. We recommend this&nbsp;<u>Standard pizza peel</u>&nbsp;or this&nbsp;<u>Conveyor pizza peel</u>.</p><p>&nbsp;</p><p><span style='font-family:Tahoma, sans-serif;font-size:30px'><strong>Instructions</strong></span></p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Make the pizza dough:</strong>&nbsp;Follow the&nbsp;<u>Best Pizza Dough</u>&nbsp;recipe to prepare the dough. (This takes about 15 minutes to make and 45 minutes to rest.)</p><p style='font-family:Tahoma, sans-serif;font-size:18px'>Place a&nbsp;<u>pizza stone</u>&nbsp;in the oven and preheat to 500°F. OR preheat your pizza oven (here's the&nbsp;<u>pizza oven we use</u>).</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Make the pizza sauce:</strong> Make the&nbsp;<u>Easy Pizza Sauce</u>.</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Prepare the toppings:&nbsp;</strong>Slice or tear the fresh mozzarella into small pieces.&nbsp;</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'><strong>Bake the pizza:</strong>&nbsp;When the oven is ready, dust a&nbsp;<u>pizza peel</u>&nbsp;with cornmeal or semolina flour. (If you don't have a pizza peel, you can use a rimless baking sheet or the back of a rimmed baking sheet. But a pizza peel is well worth the investment!) Stretch the dough into a circle; see&nbsp;<u>How to Stretch Pizza Dough</u>&nbsp;for instructions.&nbsp;Then gently place the dough onto the pizza peel.</p><p>&nbsp;</p><p style='font-family:Tahoma, sans-serif;font-size:18px'>Spread the pizza sauce over the dough using the back of a spoon to create a thin layer. Add the pieces of fresh mozzarella cheese evenly across the dough, then top with the shredded mozzarella cheese. Sprinkle evenly with the garlic powder, dried oregano, and a few pinches of&nbsp;<u>kosher salt</u>.</p><p style='font-family:Tahoma, sans-serif;font-size:18px'>Use the pizza peel to carefully transfer the pizza onto the preheated pizza stone. Bake the pizza until the cheese and crust are nicely browned, about 5 to 7 minutes in the oven (or 1 minute in a pizza oven). Slice into pieces and serve immediately.</p>`,
        views: '498',
        comments: [
          {
            article_id: 3,
            content: `Wow! This is a great pizza!`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          },
          {
            article_id: 3,
            content: `Thank you for sharing your tips!`,
            created_at: 'CURRENT_TIMESTAMP',
            updated_at: 'CURRENT_TIMESTAMP',
          }
        ]
      },
    ]
  }


  let startTime = performance.now();
  console.log('Database seeding started')
  articlesData.articles.forEach(article => {
    try {
      let insertArticle = db.prepare('INSERT OR IGNORE INTO articles (id, slug, title, content, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
      insertArticle.run(article.id, article.slug, article.title, article.content, article.views);

      article.comments.forEach(comment => {
        let stmt = db.prepare('INSERT OR IGNORE INTO comments (article_id, content, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
        stmt.run(article.id, comment.content);
      })
    } catch (error) {
      console.log(error)
    }
  })
  let endTime = performance.now()
  console.log('Database seeding finished in ' + (endTime - startTime) + ' ms');
};
seedIntro();
seedArticles();
