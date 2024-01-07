// editor dependencies
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository.js';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import { Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, ImageTextAlternative } from '@ckeditor/ckeditor5-image';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import { FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';

// multiroot editor dependencies
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin.js';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement.js';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement.js';
import mix from '@ckeditor/ckeditor5-utils/src/mix.js';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui.js';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder.js';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import Template from '@ckeditor/ckeditor5-ui/src/template.js';

class MultirootEditor extends Editor {
  constructor(sourceElements, config) {
    super(config);
    if (this.config.get('initialData') === undefined) {
      const initialData = {};
      for (const rootName of Object.keys(sourceElements)) {
        initialData[rootName] = getDataFromElement(sourceElements[rootName]);
      }
      this.config.set('initialData', initialData);
    }
    for (const rootName of Object.keys(sourceElements)) {
      this.model.document.createRoot('$root', rootName);
    }
    this.ui = new MultirootEditorUI(this, new MultirootEditorUIView(this.locale, this.editing.view, sourceElements));
  }
  destroy () {
    const data = {};
    const editables = {};
    const editablesNames = Array.from(this.ui.getEditableElementsNames());
    for (const rootName of editablesNames) {
      data[rootName] = this.getData({ rootName });
      editables[rootName] = this.ui.getEditableElement(rootName);
    }
    this.ui.destroy();
    return super.destroy().then(() => {
      for (const rootName of editablesNames) {
        setDataInElement(editables[rootName], data[rootName]);
      }
    });
  }
  static create(sourceElements, config) {
    return new Promise(resolve => {
      const editor = new this(sourceElements, config);
      resolve(
        editor.initPlugins()
        .then(() => editor.ui.init())
        .then(() => editor.data.init(editor.config.get('initialData')))
        .then(() => editor.fire('ready'))
        .then(() => editor)
      );
    });
  }
}

mix(MultirootEditor, DataApiMixin);

class MultirootEditorUI extends EditorUI {
  constructor(editor, view) {
    super(editor);
    this.view = view;
  }
  init() {
    const view = this.view;
    const editor = this.editor;
    const editingView = editor.editing.view;
    let lastFocusedEditableElement;
    view.render();
    this.focusTracker.on('change:focusedElement', (evt, name, focusedElement) => {
      for (const editable of this.view.editables) {
        if (editable.element === focusedElement) {
          lastFocusedEditableElement = editable.element;
        }
      }
    });
    this.focusTracker.on('change:isFocused', (evt, name, isFocused) => {
      if(!isFocused) {
        lastFocusedEditableElement = null;
      }
    });
    for (const editable of this.view.editables) {
      const editableElement = editable.element;
      this.setEditableElement(editable.name, editableElement);
      editable.bind('isFocused').to(this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement', (isFocused, focusedElement) => {
        if (!isFocused) {
          return false;
        }
        if (focusedElement === editableElement) {
          return true;
        } else {
          return lastFocusedEditableElement === editableElement;
        }
      });
      editingView.attachDomRoot(editableElement, editable.name);
    }
    this._initPlaceholder();
    this._initToolbar();
    this.fire('ready');
  }
  destroy() {
    super.destroy();
    const view = this.view;
    const editingView = this.editor.editing.view;
    for (const editable of this.view.editables) {
      editingView.detachDomRoot(editable.name);
    }
    view.destroy();
  }
  _initToolbar() {
    const editor = this.editor;
    const view = this.view;
    const toolbar = view.toolbar;
    toolbar.fillFromConfig(editor.config.get('toolbar'), this.componentFactory);
    this.addToolbar(view.toolbar);
  }
  _initPlaceholder() {
    const editor = this.editor;
    const editingView = editor.editing.view;
    for (const editable of this.view.editables) {
      const editingRoot = editingView.document.getRoot(editable.name);
      const sourceElement = this.getEditableElement(editable.name);
      const placeholderText = (
        editor.config.get('placeholder')[editable.name] ||
        sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' && sourceElement.getAttribute('placeholder')
      );
      if (placeholderText) {
        enablePlaceholder({
          view: editingView,
          element: editingRoot,
          text: placeholderText,
          isDirectHost: false,
          keepOnFocus: true,
        });
      }
    }
  }
}

class MultirootEditorUIView extends EditorUIView {
  constructor(locale, editingView, editableElements) {
    super(locale);
    const t = locale.t;
    this.toolbar = new ToolbarView(locale);
    this.editables = [];
    for (const editableName of Object.keys(editableElements)) {
      const editable = new InlineEditableUIView(locale, editingView, editableElements[editableName], {
        label: editableView => {
          return t('Rich Text Editor. Editing area: %0', editableView.name);
        },
      });
      editable.name = editableName;
      this.editables.push(editable);
    }
    Template.extend(this.toolbar.template, {
      attributes: {
        class: [
          'ck-reset_all',
          'ck-rounded-corners',
        ],
        dir: locale.uiLanguageDirection,
      },
    });
  }
  render() {
    super.render();
    this.registerChild(this.editables);
    this.registerChild([this.toolbar]);
  }
}

MultirootEditor
.create({
  title: document.querySelector('#editor-title'),
  content: document.querySelector('#editor-content'),
}, {
  plugins: [
    Essentials,
    Paragraph,
    FontFamily,
    FontSize,
    Bold,
    Italic,
    Underline,
    Alignment,
    FileRepository,
    SimpleUploadAdapter,
    Clipboard,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    ImageBlockEditing,
    ImageInlineEditing,
    ImageTextAlternative,
  ],
  toolbar: {
    items: [
      'fontFamily', 'fontSize', '|',
      'bold', 'italic', 'underline', '|',
      'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify', '|',
      'imageUpload',
    ],
    shouldNotGroupWhenFull: false,
  },
  fontFamily: {
    options: [
      'default',
      'Arial, Helvetica, sans-serif',
      'Courier New, Courier, monospace',
      'Georgia, serif',
      'Lucida Sans Unicode, Lucida Grande, sans-serif',
      'Tahoma, Geneva, sans-serif',
      'Times New Roman, Times, serif',
      'Trebuchet MS, Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif',
    ],
    supportAllValues: true,
  },
  fontSize: {
    options: [ 8, 9, 10, 11, 12, 14, 'default', 18, 24, 30, 36, 48, 60, 72, 96 ],
    supportAllValues: true,
  },
  simpleUpload: {
    uploadUrl: '/upload-image',
  },
  placeholder: {
    title: 'Title...',
    content: 'Write content here...',
  },
  image: {
    resizeUnit: 'px',
    styles: {
      options: [
        'alignLeft', 'alignRight',
        'alignCenter', 'alignBlockLeft', 'alignBlockRight',
      ],
    },
    toolbar: [
      'imageStyle:alignLeft', 'imageStyle:alignRight', '|',
      'imageStyle:alignBlockLeft', 'imageStyle:alignCenter', 'imageStyle:alignBlockRight',
    ],
  },
})
.then(newEditor => {
  document.querySelector('#editor-toolbar').appendChild(newEditor.ui.view.toolbar.element);
  window.editor = newEditor;
})
.catch(err => {
  console.error(err.stack);
});