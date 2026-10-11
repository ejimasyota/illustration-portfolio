import catalog from '../generated/catalog.json';
type Picture = {src:string; thumb:string; alt:string; caption:string; width:number; height:number};
export type Work = {
 slug:string; title:string; description:string; date:string; tags:string[];
 published:boolean; featured:boolean; order:number; cover:Omit<Picture,'alt'|'caption'>; images:Picture[];
};
type Artist = {name:string;url:string;description:string;tags:string[]};
type Settings = {title:string;name:string;tagline:string;description:string;bio:string;tools:string;email:string;socialUrl:string;copyright:string};
const content = catalog as {settings:Settings;works:Work[];artists:Artist[]};
export const { settings, works, artists } = content;
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (value = '/') => base + '/' + value.replace(/^\//, '');
export const formatDate = (date: string) => date.replaceAll('-', '.');
