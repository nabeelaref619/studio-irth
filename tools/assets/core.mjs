export function countWords(text, locale='ar') {
  if (typeof Intl.Segmenter === 'function') return [...new Intl.Segmenter(locale,{granularity:'word'}).segment(text)].filter(x=>x.isWordLike).length;
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)||[]).length;
}
export function countCharacters(text,locale='ar') {
  return typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(locale,{granularity:'grapheme'}).segment(text)].length:[...text].length;
}
export function fitDimensions(w,h,maxW,maxH){const factor=Math.min(1,maxW/w,maxH/h);return {width:Math.max(1,Math.round(w*factor)),height:Math.max(1,Math.round(h*factor))};}
export function ratioDimensions(rw,rh,w){if(![rw,rh,w].every(n=>Number.isFinite(n)&&n>0))throw new Error('Invalid dimensions');return {width:Math.round(w),height:Math.max(1,Math.round(w*rh/rw))};}
export function formatTime(seconds){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
