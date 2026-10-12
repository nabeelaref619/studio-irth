// One-use, same-tab language handoff. No automatic draft saving or network I/O.
export const DRAFT_KEY='irth-tools:word-counter-language:v1';
export const DRAFT_TTL=5*60*1000;
export const MAX_DRAFT_LENGTH=1000000;
const validRate=rate=>Number.isInteger(rate)&&rate>=60&&rate<=240&&rate%5===0;
export function saveDraft(storage,text,rate,targetPath,now=Date.now()){
  if(typeof text!=='string'||text.length>MAX_DRAFT_LENGTH||!validRate(rate)||typeof targetPath!=='string'||!targetPath.endsWith('/word-counter/'))return false;
  try{storage.setItem(DRAFT_KEY,JSON.stringify({text,rate,targetPath,expires:now+DRAFT_TTL}));return true;}catch{return false;}
}
export function takeDraft(storage,path,now=Date.now()){
  try{
    const raw=storage.getItem(DRAFT_KEY);
    // Consume before parsing, including malformed, stale or mismatched entries.
    storage.removeItem(DRAFT_KEY);
    if(!raw)return null;
    const draft=JSON.parse(raw);
    if(!draft||typeof draft.text!=='string'||draft.text.length>MAX_DRAFT_LENGTH||!validRate(draft.rate)||draft.targetPath!==path||!Number.isFinite(draft.expires)||draft.expires<=now||draft.expires>now+DRAFT_TTL)return null;
    return {text:draft.text,rate:draft.rate};
  }catch{return null;}
}
export function clearDraft(storage){try{storage.removeItem(DRAFT_KEY);}catch{}}
