const fs = require('fs');
const jsdom = require("jsdom");

const storePermImages = (basePath, oldSlug, newSlug, content, type) => {
  const srcs = content.match(/(?<=src=")[^"]*(?=")/gm);
  const files = [];
  const temp = `${basePath}/temp`;
  let perm = `${basePath}/${oldSlug}`;
  
  if (srcs !== null) for (const src of srcs) files.push(src.match(/([^\/]+$)/gm)[0]);
  if (files.length && !type) {

    if (fs.existsSync(perm) && oldSlug !== newSlug) {
      fs.renameSync(perm, `${basePath}/${newSlug}`)
      perm = `${basePath}/${newSlug}`;
    } else if (fs.existsSync(perm) && oldSlug === newSlug) {
      perm = `${basePath}/${oldSlug}`;
    } else {
      fs.mkdirSync(perm);
    }

    if (!fs.existsSync(temp)) fs.mkdirSync(temp);
    const dir = fs.readdirSync(temp);
    const imgs = [];
    for (const file of dir) if (files.includes(file)) imgs.push(file);
    for (const file of imgs) fs.renameSync(`${temp}/${file}`, `${perm}/${file}`);
    clearUnusedImages(perm, files);
    return imgs;
  }

  if (type && type === 'about') {
    const perm = `${basePath}/about`;
    if (!fs.existsSync(temp)) fs.mkdirSync(temp);
    if (!fs.existsSync(perm)) fs.mkdirSync(perm);
    const dir = fs.readdirSync(temp);
    const imgs = [];
    for (const file of dir) if (files.includes(file)) imgs.push(file);
    for (const file of imgs) fs.renameSync(`${temp}/${file}`, `${perm}/${file}`);
    clearUnusedImages(perm, files);
    return imgs;
  }
  clearUnusedImages(perm, files);
};

const clearTempImages = temp => {
  const dir = fs.readdirSync(temp);
  dir.forEach(file => { fs.unlinkSync(`${temp}/${file}`) });
};

const clearUnusedImages = (path, imagesList) => {
  if(fs.existsSync(path)) {
    if(imagesList.length < 1) {
      fs.rm(`${path}`, { recursive: true }, (err) => {
        if(err) throw err;
      });
    }
    fs.readdir(path, (err, files) => {
      let unusedImages = files.filter(x => !imagesList.includes(x));
      unusedImages.forEach(image => {
        fs.unlink(`${path}/${image}`,(err) => {
          if (err) throw err;
        })
      })
    })
  }
}

const deleteAllArticleImages = (basePath, slugs) => {
  try {
    slugs.forEach(slug => {
      if(fs.existsSync(`${basePath}/${slug}`)) {
        fs.rm(`${basePath}/${slug}`, { recursive: true }, (err) => {
          if(err) throw err;
        });
      }
    })
  } catch (error) {
    throw error;
  }
}

const imageSourceFixer = (text, slug, type, oldSlug) => {
  const { JSDOM } = jsdom;
  const html = new JSDOM(text)
  const images = html.window.document.getElementsByTagName('img');
  for (let img of images) {
    const src = img.attributes.getNamedItem('src');
    if (!src) continue;
    const split = src.value.split('/');
    for (let i = 0; i < split.length; i++) {
      if(split[i] === 'temp') {
        if (type && type === 'about') {
          split[i] = 'about';
        } else {
          split[i] = slug;
        }
      } else if ( oldSlug && String(split[i]) === String(oldSlug) && oldSlug !== slug) {
        split[i] = slug
      } else if (oldSlug && String(split[i]) === String(oldSlug) && oldSlug === slug) {
        split[i] = oldSlug
      }
    }
    src.value = split.join('/');
    img.attributes.setNamedItem(src);
  }
  return html.window.document.body.innerHTML;
};

module.exports = { storePermImages, clearTempImages, deleteAllArticleImages, imageSourceFixer };