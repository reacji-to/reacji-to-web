import { destinations } from './destinations.js';
import {postRef, emptyPost, validDocument} from '@reacji/posts';
import {placementRef, canonicalUrl} from '@reacji/web';
import {emojiValue, parseReaction, updateReactionUser} from '@reacji/protocol';
import {normalizeUsage, recordEmojiUse} from '@reacji/emoji-frequency';
import { samplePosts } from './samples.js';
const actor={id:0,login:'you'};
const prefix='reacji.to:page-demo:v1:';
const sampleDocuments=new Map();
let demoPlacements={};
const isSamplePlacement=placement=>Boolean(document.querySelector(placement.anchor.selector)?.closest('.reaction-demo'));
const usageKey='reacji.to:emoji-usage';
const demoAliases=[{name:'design',emoji:'🎨'}];
function readUsage(){try{return normalizeUsage(JSON.parse(localStorage.getItem(usageKey)));}catch{return [];}}
function rememberEmoji(emoji,moveFrom){
  if(!emoji||moveFrom)return;
  try{localStorage.setItem(usageKey,JSON.stringify(recordEmojiUse(readUsage(),emoji)));}catch{/* Saving a preference must not undo a saved reaction. */}
}
function key(post) { return `${prefix}${post.id}:local`; }
function read(post) {
  if(post.platform!=='web')return structuredClone(sampleDocuments.get(key(post))||emptyPost(post));
  const raw=localStorage.getItem(key(post));
  const value=raw?JSON.parse(raw):emptyPost(post);
  if(!validDocument(value,post))throw new Error('Saved demo reactions could not be read. Clear this site’s browser data to reset them.');
  value.placements=Object.fromEntries(Object.entries(value.placements||{}).filter(([,placement])=>!isSamplePlacement(placement)));
  Object.assign(value.placements,demoPlacements);
  return value;
}
async function handle(message) {
  if(message.type==='raycast-catalog')return {actions:[]};
  if(message.type==='emoji-usage-get')return {usage:readUsage()};
  if(message.type==='emoji-alias-list')return {aliases:demoAliases};
  if(message.type==='visibility-get')return {visibility:'local'};
  if(message.type==='visibility-save'){
    destinations.get(message.visibility);
    return {visibility:'local'};
  }
  if(message.type==='status')return {connected:false,actor:null,privateRepository:null};
  if(message.type==='options'){location.assign('/about');return {url:`${location.origin}/about`};}
  const post=postRef(message.post||message.event?.post);
  if(post.platform==='web' ? post.url!==canonicalUrl(location.href) : !samplePosts.some(sample=>sample.post.platform===post.platform&&sample.post.id===post.id))throw new Error('Choose content on this page.');
  const integration = destinations.entries.find(item => item.kind === 'integration' && (destinations.readType(item.id) === message.type || message.visibility === item.id));
  if(integration) {
    if(message.type!=='react')return emptyPost(post);
    throw new Error('Install the extension to run integration actions. This demo saves only in this browser.');
  }
  const doc=read(post);
  if(message.type==='local-read')return doc;
  if(message.type!=='react')throw new Error('Unsupported demo action.');
  const emoji=message.event.emoji===null?null:emojiValue(message.event.emoji);
  if(message.event.emoji!==null&&!emoji)throw new Error('Choose an emoji.');
  if(post.platform!=='web'){
    const next=updateReactionUser(doc.users[actor.id],parseReaction(message.event),{login:actor.login});
    if(next)doc.users[actor.id]=next;else delete doc.users[actor.id];
    sampleDocuments.set(key(post),structuredClone(doc));
    if(message.trackUsage!==false&&message.event.operation!=='remove')rememberEmoji(emoji);
    return {actor,document:doc};
  }
  const anchor=placementRef(message.event.placement);
  doc.placements ||= {};
  if(message.event.moveFrom){
    const source=doc.placements[message.event.moveFrom];
    if(!source?.users?.[actor.id]?.emoji||doc.placements[anchor.id])throw new Error('Your reaction has changed. Refresh the page before moving it.');
    delete source.users[actor.id];
    if(!Object.keys(source.users).length)delete doc.placements[message.event.moveFrom];
  }
  if(emoji===null)delete doc.placements[anchor.id];
  else doc.placements[anchor.id]={anchor,users:{[actor.id]:{login:actor.login,emoji}}};
  demoPlacements=Object.fromEntries(Object.entries(doc.placements).filter(([,placement])=>isSamplePlacement(placement)));
  const persistent={...doc,placements:Object.fromEntries(Object.entries(doc.placements).filter(([,placement])=>!isSamplePlacement(placement)))};
  if(Object.keys(persistent.placements).length)localStorage.setItem(key(post),JSON.stringify(persistent));
  else localStorage.removeItem(key(post));
  if(message.trackUsage!==false)rememberEmoji(emoji,message.event.moveFrom);
  return {actor,document:doc};
}
// Lexical browser API replacement. Never touches the installed extension or its credentials.
export const runtime={
  sendMessage:async message=>{
    try{return {ok:true,value:await handle(message)};}
    catch(error){return {ok:false,error:error.name==='QuotaExceededError'||error.name==='SecurityError'?'Browser storage is unavailable. Allow site storage to save demo reactions.':error.message};}
  },
};
