import { jsdom } from 'jsdom';

const document = new jsdom('<!doctype html><html><body></body></html>');

global.document = document;
global.window = document.defaultView;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
