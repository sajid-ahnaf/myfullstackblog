const recaptchaSiteKey = 'YOUR_RECATPCHA_SITE_KEY';

const recaptcha = (callback) => {
  return grecaptcha.ready(function() {
    grecaptcha.execute(recaptchaSiteKey, {action: 'submit'})
    .then((token) => {
      callback(token);
    });
  });
};

// This function stops at grecaptcha execute
const submitComment = (e, id) => {
  const comment = document.querySelector("#comment-text").value;
  if (!comment.trim()) return console.error('Comment-field empty');

  recaptcha(async (token) => {
    fetch(`/post-comment`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "g-recaptcha-response": token,
        articleId: id,
        content: comment
      })
    })
    .then(response => {
      return response.json();
    }).then(data => {
      if (data.success) location.reload();
    }).catch(e => {
      console.error(e)
    })
  });
};

const imageSourceFixer = text => {
  const parser = new DOMParser();
  const html = parser.parseFromString(text, 'text/html');
  const images = html.getElementsByTagName('img');
  for (let img of images) {
    const src = img.attributes.getNamedItem('src');
    if (!src) continue;
    const split = src.value.split('/');
    for (let i = 0; i < split.length; i++) if (split[i] === 'temp') split[i] = 'perm';
    src.value = split.join('/');
    img.attributes.setNamedItem(src);
  }
  return html.body.innerHTML;
};

const getData = rootName => window.editor.getData({ rootName });

const titleToSlug = title => {
  const slug = title.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, '-').toLowerCase();
  if (!slug.trim()) throw new Error('Title-field empty');
  return slug.replace(/['"]/g, '');
};

const submitText = async (editType) => {
  const title = getData('title');
  const content = getData('content');
  const slug = titleToSlug(title);
  const headers = { 'Content-Type': 'application/json' };

  switch (editType) {
    case 'edit-about':
      try {
        const res = await fetch('/edit-about', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ title, content }),
        }).then(res => res.json());

        if (!res.success) throw new Error(`${res.error}`);
        window.location.href = '/';
      } catch (error) {
        console.error(error);
      }
      return;
    case 'edit-article':
      try {
        const oldSlug = document.querySelector('#slug-input').value;
        const newSlug = slug;
        const res = await fetch(`/article/${oldSlug}/edit`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ title, content, newSlug, oldSlug }),
        }).then(res => res.json());

        if (!res.success) throw new Error(`${res.error}`);
        window.location.href = `/article/${res.newSlug ? res.newSlug : slug}`;
      } catch (error) {
        console.error(error);
      }
      return;
    case 'new-article':
      try {
        const res = await fetch('/new-article', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title, content, slug }),
        }).then(res => res.json());

        if (!res.success) throw new Error(`${res.error}`);
        window.location.href = `/article/${res.newSlug ? res.newSlug : slug}`;
      } catch (error) {
        console.error(error);
      }
      return;
    default:
      return;
  }
};

const deleteArticlesComments = async (commentOrArticle, nodeList) => {
  const idList = []
  switch (commentOrArticle) {
    case 'comment':
      nodeList.forEach(commentNode => {
        idList.push(commentNode.id)
      })    
      break;
    case 'article':
      nodeList.forEach(articleNode => {
        idList.push(articleNode.id)
      })    
    default:
      break;
  }
  // the ID of this node is the slug of the article
  if (idList.length < 1) {
    console.error('Nothing selected to be deleted')
    return
  }
  fetch('/', {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idList: idList,
      commentOrArticle: commentOrArticle
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 200) location.reload();
  });
};

const signIn = (event) => {
  event.preventDefault();
  const statusBox = document.querySelector('#status-box');
  statusBox.innerText = 'Loading...';
  statusBox.classList.remove('status-error');
  statusBox.classList.add('status-loading');
  const data = {};
  const form = event.target;
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    data[input.name] = input.value;
  });
  recaptcha(async (token) => {
    data["g-recaptcha-response"] = token;

    const res = await fetch('/api/auth/signin', {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then(res => res.json());

    if (res.success) {
      window.location.href = '/';
    } else {
      statusBox.innerText = res.error;
      statusBox.classList.remove('status-loading');
      statusBox.classList.add('status-error');
    }
  });
};

const signOut = async () => {
  const res = await fetch('/api/auth/signout', { method: 'POST' });
  if (res.redirected) window.location.href = res.url;
}